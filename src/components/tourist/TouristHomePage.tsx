'use client';

import { useState, useMemo } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import dynamic from 'next/dynamic';
import { useTranslations } from 'next-intl';
import {
  MapPin, Star, Users, ArrowRight, Shield, Sparkles,
  ShieldAlert, CheckCircle, Eye, Search, X,
  ChevronDown, ChevronUp, Clock, Info, Printer, Share2,
  ClipboardCheck, Send, ThumbsUp, ThumbsDown,
  Waves, Shell, Leaf, Landmark, UtensilsCrossed,
  Car, Bus, Footprints, Route, ShieldCheck, BarChart3
} from 'lucide-react';
import { StarRating } from '@/components/ui/StarRating';
import { addFeedback } from '@/lib/firebase';
import { cn, slugify } from '@/lib/utils';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { destinosInfo, fluxoData, cadasturData, calcularISA } from '@/data/mockData';
import type { Feedback, DestinoInfo } from '@/data/mockData';
import { useSupabaseSync } from '@/lib/supabase-data';
import { normalizeStyle, normalizeTransport } from '@/lib/routePresets';
import { planRoute, haversineKm, MAX_ROUTE_DAYS } from '@/lib/route-planner';
import type { PlannedDay } from '@/lib/route-planner';

// Dynamically load Map component to prevent SSR window error on homepage
const HomeRouteMap = dynamic(
  () => import('./HomeRouteMap'),
  { ssr: false }
);

function getISABadge(score: number, t: (key: string) => string) {
  if (score >= 80) return { label: t('healthy'), variant: 'success' as const };
  if (score >= 60) return { label: t('attention'), variant: 'warning' as const };
  return { label: t('critical'), variant: 'danger' as const };
}

interface RouteDay {
  day: number;
  destinations: typeof destinosInfo;
  description: string;
  travelKm: number;
}

export default function TouristHomePage() {
  useSupabaseSync();
  const t = useTranslations('planner');
  const tRanking = useTranslations('ranking');

  // Questionnaire Options
  // Icones de traco no lugar dos emoji que viviam nos rotulos de i18n: emoji
  // renderizam diferente em cada sistema, nao herdam a cor do texto e nao
  // escalam com o peso tipografico.
  const styles = useMemo(() => [
    { id: 'adventure', icon: Waves, label: t('styles.adventure.label'), desc: t('styles.adventure.desc') },
    { id: 'relax', icon: Shell, label: t('styles.relax.label'), desc: t('styles.relax.desc') },
    { id: 'ecotourism', icon: Leaf, label: t('styles.ecotourism.label'), desc: t('styles.ecotourism.desc') },
    { id: 'culture', icon: Landmark, label: t('styles.culture.label'), desc: t('styles.culture.desc') },
    { id: 'gastronomy', icon: UtensilsCrossed, label: t('styles.gastronomy.label'), desc: t('styles.gastronomy.desc') },
    { id: 'family', icon: Users, label: t('styles.family.label'), desc: t('styles.family.desc') },
  ], [t]);

  const transports = useMemo(() => [
    { id: 'buggy', icon: Car, label: t('transports.buggy.label') },
    { id: 'shuttle', icon: Bus, label: t('transports.shuttle.label') },
    { id: 'hike', icon: Footprints, label: t('transports.hike.label') },
  ], [t]);

  // Questionnaire States
  const [step, setStep] = useState<1 | 2 | 3 | 4 | 5 | 6>(1);
  const [selectedStyle, setSelectedStyle] = useState('adventure');
  const [durationDays, setDurationDays] = useState(3);
  const [expandedPartners, setExpandedPartners] = useState<Record<string, boolean>>({});
  const [selectedTransport, setSelectedTransport] = useState('buggy');
  const [expandedDay, setExpandedDay] = useState<number | null>(null);

  const togglePartner = (id: string) => {
    setExpandedPartners(prev => ({ ...prev, [id]: !prev[id] }));
  };
  const [searchQuery, setSearchQuery] = useState('');
  // Destino confirmado com Enter. Digitar apenas filtra a lista; so o Enter
  // move a camera, senao a tomada se reenquadraria a cada letra.
  const [focusedDest, setFocusedDest] = useState<DestinoInfo | null>(null);

  const handleSearchKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key !== 'Enter') return;
    e.preventDefault();
    const q = searchQuery.trim().toLowerCase();
    if (!q) {
      setFocusedDest(null);
      return;
    }
    const match =
      destinosInfo.find(d => d.nome.toLowerCase().includes(q)) ??
      destinosInfo.find(d => d.municipio.toLowerCase().includes(q));
    if (match) setFocusedDest(match);
  };

  // Detailed Questionnaire States
  const [selectedGroupProfile, setSelectedGroupProfile] = useState('couple');
  const [selectedBudget, setSelectedBudget] = useState('moderate');
  const [selectedStayPreference, setSelectedStayPreference] = useState('inn');

  // Planning / Experience Selection States
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [travelerNames, setTravelerNames] = useState('');
  const [specialRequirements, setSpecialRequirements] = useState('');
  const [selectedExperiences, setSelectedExperiences] = useState<Record<string, boolean>>({});

  // Evaluation (Step 6) States
  const evalCriteria = [
    { key: 'limpo', emoji: '🧹', label: 'Limpo e conservado' },
    { key: 'sinalizado', emoji: '🪧', label: 'Boa sinalização' },
    { key: 'preservado', emoji: '🌿', label: 'Bem preservado' },
    { key: 'acessibilidade', emoji: '♿', label: 'Acessível' },
    { key: 'seguranca', emoji: '🔒', label: 'Seguro' },
    { key: 'custo_beneficio', emoji: '💰', label: 'Bom custo-benefício' },
    { key: 'conservacao', emoji: '🏗️', label: 'Bem conservado' },
    { key: 'superlotado', emoji: '🚫', label: 'Superlotado', negative: true },
  ];
  const [evalRatings, setEvalRatings] = useState<Record<string, number>>({});
  const [evalCriteriaByDest, setEvalCriteriaByDest] = useState<Record<string, Record<string, boolean>>>({});
  const [evalConformityByDest, setEvalConformityByDest] = useState<Record<string, 'yes' | 'no'>>({});
  const [evalComments, setEvalComments] = useState<Record<string, string>>({});
  const [evalSubmittedDests, setEvalSubmittedDests] = useState<Record<string, boolean>>({});
  const [evalLoadingDest, setEvalLoadingDest] = useState<string | null>(null);

  const handleEvalSubmitDest = async (destNome: string) => {
    const rating = evalRatings[destNome] || 0;
    if (rating === 0) return;
    setEvalLoadingDest(destNome);
    try {
      const criteria = evalCriteriaByDest[destNome] || {};
      const conformity = evalConformityByDest[destNome] || 'yes';
      const comment = evalComments[destNome] || '';
      const conformityTag = `[Conformidade: ${conformity === 'yes' ? 'Sim' : 'Não'}]`;
      await addFeedback({
        destino: destNome,
        nota_geral: rating,
        limpo: !!criteria.limpo,
        sinalizado: !!criteria.sinalizado,
        preservado: !!criteria.preservado,
        acessibilidade: !!criteria.acessibilidade,
        seguranca: !!criteria.seguranca,
        custo_beneficio: !!criteria.custo_beneficio,
        conservacao: !!criteria.conservacao,
        superlotado: !!criteria.superlotado,
        comentario: comment.trim() ? `${conformityTag} ${comment}` : conformityTag,
      });
      setEvalSubmittedDests(prev => ({ ...prev, [destNome]: true }));
    } catch (err) {
      console.error('Error submitting evaluation:', err);
    } finally {
      setEvalLoadingDest(null);
    }
  };

  // Suggested Route States
  const [suggestedRoute, setSuggestedRoute] = useState<{
    title: string;
    description: string;
    destinations: typeof destinosInfo;
    days: RouteDay[];
  } | null>(null);

  // All destinations memo
  const destinations = useMemo(() => {
    return destinosInfo.map(d => {
      const fluxo = fluxoData.find(f => f.destino === d.nome);
      const isa = calcularISA(d.nome, [] as Feedback[]);
      const partners = cadasturData.filter(c => c.destino === d.nome && c.regularizado);
      return { ...d, fluxo, isa, partners };
    }).sort((a, b) => b.isa - a.isa);
  }, []);

  const topDestinations = destinations.slice(0, 3); // Top 3 largest cards

  // Turns a planned day into a readable summary. Lives here (not in the planner) so the
  // copy follows the active locale instead of being hardcoded in Portuguese.
  const describeDay = (day: PlannedDay): string => {
    if (day.destinations.length > 1) {
      return t('dayPlanMulti', {
        destinations: day.destinations.map(d => d.nome).join(' • '),
        distance: day.travelKm,
      });
    }

    const only = day.destinations[0];
    if (day.travelKm > 0) {
      return t('dayPlanSingleTransfer', {
        destination: only.nome,
        city: only.municipio,
        distance: day.travelKm,
      });
    }

    return t('dayPlanSingle', { destination: only.nome, city: only.municipio });
  };

  // Process questionnaire answers and suggest a route
  const handleGenerateRoute = () => {
    const transportKey = normalizeTransport(selectedTransport);
    let title = t(`routes.${selectedStyle}.${transportKey}.title`);
    const description = t(`routes.${selectedStyle}.${transportKey}.description`);

    // The search box is the trip's starting point, so a match anchors the route instead of
    // replacing one of the destinations the translated title promises.
    let matchedQueryDest: string | null = null;
    if (searchQuery.trim() !== '') {
      const q = searchQuery.toLowerCase();
      const match = destinosInfo.find(d =>
        d.nome.toLowerCase().includes(q) ||
        d.municipio.toLowerCase().includes(q)
      );
      if (match) {
        matchedQueryDest = match.nome;

        const cleanName = matchedQueryDest.replace(/ e .*/g, '').replace(/ e Morro.*/g, '');
        if (!title.includes(cleanName)) {
          title = `${title} ${t('with')} ${cleanName}`;
        }
      }
    }

    const plan = planRoute({
      catalogue: destinosInfo,
      style: normalizeStyle(selectedStyle),
      transport: transportKey,
      days: durationDays,
      anchorName: matchedQueryDest,
    });

    const routeDays: RouteDay[] = plan.days.map(day => ({
      day: day.day,
      destinations: day.destinations,
      description: describeDay(day),
      travelKm: day.travelKm,
    }));

    const generated = {
      title,
      description,
      destinations: plan.destinations,
      days: routeDays,
    };

    // Pre-select default attractions
    const initialExps: Record<string, boolean> = {};
    plan.destinations.forEach(dest => {
      dest.atracoes?.forEach(act => {
        initialExps[act.id] = true;
      });
    });
    setSelectedExperiences(initialExps);

    setSuggestedRoute(generated);
    // Todos os dias nascem fechados: com um dia aberto o cronograma rolava e os
    // demais dias sumiam da dobra, e o mapa enquadrava so o dia aberto em vez
    // da rota inteira.
    setExpandedDay(null);

    // Save generated route to search/route history in local storage
    if (typeof window !== 'undefined') {
      const historyStr = localStorage.getItem('poti_route_history');
      const history = historyStr ? JSON.parse(historyStr) : [];
      const newHistoryItem = {
        id: `route-${Date.now()}`,
        title,
        style: selectedStyle,
        duration: `${plan.days.length} ${plan.days.length === 1 ? 'dia' : 'dias'}`,
        transport: selectedTransport,
        date: new Date().toLocaleDateString('pt-BR'),
        destinations: plan.destinations.map(d => d.nome),
      };
      localStorage.setItem('poti_route_history', JSON.stringify([newHistoryItem, ...history].slice(0, 10)));
    }

    setStep(3);
  };

  // Memoized destinations for the map based on active day/route state or active filters
  const mapDestinations = useMemo(() => {
    if (suggestedRoute) {
      if (expandedDay === null) return suggestedRoute.destinations;
      const dayItem = suggestedRoute.days.find(d => d.day === expandedDay);
      return dayItem && dayItem.destinations.length > 0 
        ? dayItem.destinations 
        : suggestedRoute.destinations;
    }

    // Dynamic filtering for map markers when planning/configuring
    let filtered = destinations;

    // 1. Text search query
    if (searchQuery.trim() !== '') {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(d => 
        d.nome.toLowerCase().includes(query) || 
        d.municipio.toLowerCase().includes(query) ||
        d.descricao.toLowerCase().includes(query)
      );
    }

    // 2. Style preference filtering to highlight matching destinations
    if (selectedStyle === 'adventure') {
      filtered = filtered.filter(d => 
        d.nome.includes('Dunas') || d.nome.includes('Lagoa') || d.nome.includes('Parrachos') || d.nome.includes('Pipa')
      );
    } else if (selectedStyle === 'relax') {
      filtered = filtered.filter(d => 
        d.nome.includes('Pipa') || d.nome.includes('Madeiro') || d.nome.includes('Gostoso') || d.nome.includes('Galinhos') || d.nome.includes('Maracajaú')
      );
    } else if (selectedStyle === 'ecotourism') {
      filtered = filtered.filter(d => 
        d.nome.includes('Lagoa') || d.nome.includes('Parrachos') || d.nome.includes('Galinhos') || d.nome.includes('Maracajaú')
      );
    } else if (selectedStyle === 'culture') {
      filtered = filtered.filter(d => 
        d.nome.includes('Forte') || d.nome.includes('Mossoró') || d.nome.includes('Lajedo') || d.nome.includes('Barreira') || d.nome.includes('Santa Rita')
      );
    } else if (selectedStyle === 'gastronomy') {
      filtered = filtered.filter(d => 
        d.nome.includes('Pipa') || d.nome.includes('Cunhaú') || d.nome.includes('Ponta Negra')
      );
    } else if (selectedStyle === 'family') {
      filtered = filtered.filter(d => 
        d.nome.includes('Pipa') || d.nome.includes('Lagoa') || d.nome.includes('Forte') || d.nome.includes('Ponta Negra')
      );
    }

    // Fallback: if filters result in empty list, show first 4 monitored destinations so the map is not empty
    if (filtered.length === 0) {
      return destinations.filter(d => d.monitorado).slice(0, 4);
    }

    return filtered;
  }, [suggestedRoute, expandedDay, destinations, selectedStyle, searchQuery]);

  const handleShareWhatsApp = (sendPdf: boolean) => {
    const startFormatted = startDate ? new Date(startDate + 'T00:00:00').toLocaleDateString('pt-BR') : '';
    const endFormatted = endDate ? new Date(endDate + 'T00:00:00').toLocaleDateString('pt-BR') : '';
    const passengers = travelerNames.split('\n').filter(Boolean).join(', ');
    
    let tripSummaryText = `*POTI - Roteiro de Viagem*\nCódigo: *POTI-2026-X79B*\nPeríodo: ${startFormatted} a ${endFormatted}\nEstilo: *${suggestedRoute?.title || ''}*\nPassageiros: ${passengers}\nGerado de forma sustentável e 100% regularizada no RN.`;
    
    if (sendPdf) {
      tripSummaryText += `\n\n_Estou enviando em anexo o arquivo PDF do meu roteiro._`;
      window.print();
    }
    
    window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(tripSummaryText)}`, '_blank');
  };

  return (
    <div className="animate-fade-in space-y-12">
      {/* ═══ Smart Route Planner & Map Split-Pane Hero Section ═══ */}
      <section className="relative w-full h-[calc(100vh-4rem)] border-b border-[var(--color-border)] bg-[var(--color-bg)] overflow-hidden">

          {/* Cena 3D ocupando o hero inteiro, atras de tudo. Sem interacao:
              a camera e uma tomada fixa orbitando Genipabu, nao uma ferramenta
              de navegacao — arrastar o mapa so quebraria o enquadramento. */}
          <div className="absolute inset-0">
            <HomeRouteMap
              destinations={mapDestinations}
              activeDay={expandedDay}
              isInteractive={false}
              hasRoute={suggestedRoute !== null}
              routeDestinations={suggestedRoute?.destinations}
              focusTarget={focusedDest}
            />
          </div>

          {/* Painel flutuante. No mobile ocupa a metade de baixo e deixa a
              duna aparecer em cima; no desktop encosta a direita com margem,
              para o mapa respirar em volta. */}
          {/* Painel flutuante. `p-6` tambem no desktop (era sm:p-8): 16px de
              padding a menos e 16px de conteudo a mais, e num painel que precisa
              caber sem rolar isso conta. */}
          <div className="absolute inset-x-0 bottom-0 top-[42vh] lg:inset-y-6 lg:left-auto lg:right-6 lg:top-6 lg:bottom-6 lg:w-[min(30rem,42vw)] flex flex-col p-6 overflow-y-auto custom-scrollbar z-10 justify-between bg-[var(--color-surface)] rounded-t-3xl lg:rounded-3xl shadow-2xl ring-1 ring-[var(--color-border)]">
            {(step === 1 || step === 2) ? (
              <div className="space-y-3 animate-fade-in my-auto">
                {/* Header Info */}
                <div className="space-y-2">
                  <Badge variant="accent" size="sm" className="px-2.5 py-0.5 text-[11px] font-bold tracking-wider uppercase">
                    <Sparkles className="h-3 w-3 animate-pulse text-[var(--color-accent)] shrink-0" />
                    {t('title')}
                  </Badge>
                  {/* Entrelinha abaixo de 1 e tracking negativo: e daqui que
                      vem a sensacao de titulo "puxado", nao de deformar a
                      fonte. Medido nos sites do showcase da GSAP — Kononenko
                      usa leading 0.70, TRIONN 0.90, ambos com tracking
                      negativo. Peso 800 so passou a valer depois de h1-h6 ir
                      para @layer base.

                      O corpo escala por ALTURA de viewport, nao por largura. O
                      painel nao pode rolar, e o que estoura a altura dele e este
                      titulo: em 40px ele ocupava 157px em quatro linhas, 27% do
                      espaco disponivel num viewport de 695px. Com vh ele fica
                      grande em tela alta e compacto em tela baixa, que e onde o
                      aperto existe. */}
                  <h1 className="text-[28px] sm:text-4xl lg:text-[clamp(22px,3.1vh,40px)] font-extrabold text-[var(--color-text)] leading-[1.02] tracking-[-0.03em]">
                    {t('heading')} <br />
                    <span className="gradient-ocean gradient-text">{t('subheading')}</span>
                  </h1>
                  <p className="text-[11.5px] text-[var(--color-text-secondary)] leading-snug">
                    {t('description')}
                  </p>
                </div>

                {/* Smart Form Panel */}
                {step === 1 ? (
                  /* STEP 1: Basic Route Options */
                  <div className="space-y-3">
                    {/* O card "O que oferecemos" saiu daqui. Eram 4 itens com
                        titulo E descricao — ~70 palavras de argumento
                        institucional (Cadastur, Zeladoria, Painel) empurrando a
                        primeira pergunta de verdade para o sexto bloco do
                        painel. Virou a faixa de selos no pe, so icone e rotulo.

                        A busca por destino tambem desceu, para depois do CTA: o
                        painel abre com "como voce viaja?", que e o que a POTI
                        faz de diferente. Quem ja sabe o destino acha o campo
                        logo abaixo. */}

                    {/* Travel Style Selection */}
                    <div className="space-y-1.5">
                      <label className="text-[11px] font-bold text-[var(--color-text-muted)] uppercase tracking-wider block">
                        {t('travelStyleLabel')}
                      </label>
                      <div className="flex flex-wrap gap-1.5">
                        {styles.map(s => {
                          const isActive = selectedStyle === s.id;
                          return (
                            <button
                              key={s.id}
                              type="button"
                              onClick={() => setSelectedStyle(s.id)}
                              title={s.desc}
                              className={cn(
                                "px-2.5 py-1 rounded-full border text-left transition-all duration-200 cursor-pointer flex items-center gap-1.5 select-none text-xs font-bold",
                                isActive
                                  ? "bg-[var(--color-primary)] border-[var(--color-primary)] text-white shadow-sm"
                                  : "bg-[var(--color-surface-alt)]/40 border-[var(--color-border-light)] text-[var(--color-text-secondary)] hover:border-[var(--color-primary)]/40 hover:text-[var(--color-text)]"
                              )}
                            >
                              <s.icon className="h-3.5 w-3.5 shrink-0" strokeWidth={1.75} />
                              {s.label}
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    {/* Duracao e transporte na MESMA linha. Empilhados eram dois
                        blocos de ~66px cada, e o painel nao pode rolar. Lado a
                        lado eles somam um: a duracao e um contador estreito e o
                        transporte cresce no espaco que sobra. */}
                    <div className="grid grid-cols-[auto_1fr] gap-2.5 items-end">
                      {/* Duration Selection (Plus/Minus Counter) */}
                      <div className="space-y-1.5">
                        <label className="text-[11px] font-bold text-[var(--color-text-muted)] uppercase tracking-wider block">
                          {t('durationLabel')}
                        </label>
                        <div className="flex items-center gap-1 bg-[var(--color-surface-alt)] p-1 rounded-xl border border-[var(--color-border-light)]">
                          <button
                            type="button"
                            onClick={() => setDurationDays(prev => Math.max(1, prev - 1))}
                            aria-label={t('durationMinus')}
                            className="h-7 w-7 rounded-lg bg-[var(--color-surface)] hover:bg-[var(--color-surface-hover)] border border-[var(--color-border)] text-sm font-bold flex items-center justify-center cursor-pointer select-none transition-all"
                          >
                            -
                          </button>
                          {/* Plural por ICU, nao por ternario com string fixa:
                              "3 Dias" aparecia em portugues no meio da UI em
                              ingles. */}
                          <span className="font-bold text-[11px] text-[var(--color-text)] tabular-nums text-center min-w-[46px]">
                            {t('daysCount', { count: durationDays })}
                          </span>
                          <button
                            type="button"
                            onClick={() => setDurationDays(prev => Math.min(MAX_ROUTE_DAYS, prev + 1))}
                            aria-label={t('durationPlus')}
                            className="h-7 w-7 rounded-lg bg-[var(--color-surface)] hover:bg-[var(--color-surface-hover)] border border-[var(--color-border)] text-sm font-bold flex items-center justify-center cursor-pointer select-none transition-all"
                          >
                            +
                          </button>
                        </div>
                      </div>

                      {/* Transport Selection */}
                      <div className="space-y-1.5 min-w-0">
                        <label className="text-[11px] font-bold text-[var(--color-text-muted)] uppercase tracking-wider block">
                          {t('transportLabel')}
                        </label>
                        <div className="flex bg-[var(--color-surface-alt)] p-1 rounded-xl border border-[var(--color-border-light)] gap-1">
                          {transports.map(tInfo => {
                            const isActive = selectedTransport === tInfo.id;
                            return (
                              <button
                                key={tInfo.id}
                                type="button"
                                onClick={() => setSelectedTransport(tInfo.id)}
                                title={tInfo.label}
                                className={cn(
                                  "flex-1 min-w-0 h-7 text-center rounded-lg font-bold text-[10.5px] transition-all cursor-pointer select-none border border-transparent flex items-center justify-center gap-1",
                                  isActive
                                    ? "bg-[var(--color-surface)] text-[var(--color-primary)] shadow-sm border-[var(--color-border)]/20"
                                    : "text-[var(--color-text-secondary)] hover:text-[var(--color-text)]"
                                )}
                              >
                                <tInfo.icon className="h-3.5 w-3.5 shrink-0" strokeWidth={1.75} />
                                <span className="truncate">{tInfo.label}</span>
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    </div>

                    {/* Proceed to Step 2 */}
                    <button
                      type="button"
                      onClick={() => setStep(2)}
                      className="w-full mt-3 py-2.5 bg-[var(--color-primary)] hover:bg-[var(--color-primary-hover)] text-white rounded-xl font-bold transition-all shadow-md hover:shadow-lg hover:shadow-[var(--color-primary)]/10 active:scale-[0.98] transform flex items-center justify-center gap-2 cursor-pointer text-xs"
                    >
                      <span>{t('nextStep')}</span>
                      <ArrowRight className="h-3.5 w-3.5 shrink-0" />
                    </button>

                    {/* Atalho para quem ja tem destino em mente. Fica DEPOIS do
                        CTA e sem label em caixa alta: e caminho alternativo, nao
                        campo do formulario. Enter leva a camera ao lugar. */}
                    <div>
                      {/* Rotulo e dica na MESMA linha: a dica ocupava uma linha
                          inteira embaixo do campo, e o painel nao pode rolar.
                          Aqui ela continua visivel — Enter e a unica forma de
                          disparar a busca — sem custar altura. */}
                      <div className="flex items-baseline justify-between gap-2 mb-1.5">
                        <label htmlFor="home-search" className="text-[11px] text-[var(--color-text-muted)]">
                          {t('searchNudge')}
                        </label>
                        <span id="home-search-hint" className="text-[10px] text-[var(--color-text-muted)] shrink-0">
                          {t('searchHint')}
                        </span>
                      </div>
                      <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-[var(--color-text-muted)] pointer-events-none" />
                        <input
                          id="home-search"
                          type="text"
                          value={searchQuery}
                          onChange={(e) => setSearchQuery(e.target.value)}
                          onKeyDown={handleSearchKeyDown}
                          placeholder={t('startPointPlaceholder')}
                          aria-describedby="home-search-hint"
                          className="w-full h-9 pl-9 pr-8 rounded-xl border border-[var(--color-border-light)] bg-[var(--color-surface-alt)]/40 text-xs text-[var(--color-text)] placeholder:text-[var(--color-text-muted)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-border-focus)]"
                        />
                        {searchQuery && (
                          <button
                            type="button"
                            onClick={() => { setSearchQuery(''); setFocusedDest(null); }}
                            aria-label={t('clearSearch')}
                            className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[var(--color-text-muted)] hover:text-[var(--color-text)] cursor-pointer"
                          >
                            <X className="h-3.5 w-3.5" />
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                ) : (
                  /* STEP 2: Advanced/Detailed Profile & Budget */
                  <div className="space-y-3 animate-fade-in">
                    {/* Traveler Profile Selection */}
                    <div className="space-y-1.5">
                      <label className="text-[11px] font-bold text-[var(--color-text-muted)] uppercase tracking-wider block">
                        {t('groupProfileLabel')}
                      </label>
                      <div className="flex flex-wrap gap-1.5">
                        {(['solo', 'couple', 'family', 'friends'] as const).map(profileId => {
                          const isActive = selectedGroupProfile === profileId;
                          const iconMap: Record<string, string> = {
                            solo: '👤',
                            couple: '👥',
                            family: '👨‍👩‍👧‍👦',
                            friends: '👫'
                          };
                          return (
                            <button
                              key={profileId}
                              type="button"
                              onClick={() => setSelectedGroupProfile(profileId)}
                              className={cn(
                                "px-2.5 py-1 rounded-full border transition-all duration-200 cursor-pointer flex items-center gap-1.5 select-none text-xs font-bold",
                                isActive
                                  ? "bg-[var(--color-primary)] border-[var(--color-primary)] text-white shadow-sm"
                                  : "bg-[var(--color-surface-alt)]/40 border-[var(--color-border-light)] text-[var(--color-text-secondary)] hover:border-[var(--color-primary)]/40 hover:text-[var(--color-text)]"
                              )}
                            >
                              <span>{iconMap[profileId]}</span> {t(`groupProfiles.${profileId}`)}
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    {/* Budget Selection */}
                    <div className="space-y-1.5">
                      <label className="text-[11px] font-bold text-[var(--color-text-muted)] uppercase tracking-wider block">
                        {t('budgetLabel')}
                      </label>
                      <div className="flex bg-[var(--color-surface-alt)] p-1 rounded-xl border border-[var(--color-border-light)] gap-1">
                        {['budget', 'moderate', 'luxury'].map(budgetId => {
                          const isActive = selectedBudget === budgetId;
                          return (
                            <button
                              key={budgetId}
                              type="button"
                              onClick={() => setSelectedBudget(budgetId)}
                              className={cn(
                                "flex-1 h-7 text-center rounded-lg font-bold text-[11px] transition-all cursor-pointer truncate select-none border border-transparent flex items-center justify-center",
                                isActive
                                  ? "bg-[var(--color-surface)] text-[var(--color-primary)] shadow-sm border-[var(--color-border)]/20"
                                  : "text-[var(--color-text-secondary)] hover:text-[var(--color-text)]"
                              )}
                            >
                              {t(`budgets.${budgetId}`)}
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    {/* Stay Preference Selection */}
                    <div className="space-y-1.5">
                      <label className="text-[11px] font-bold text-[var(--color-text-muted)] uppercase tracking-wider block">
                        {t('stayPreferenceLabel')}
                      </label>
                      <div className="flex flex-wrap gap-1.5">
                        {['inn', 'hotel', 'hostel', 'none'].map(stayId => {
                          const isActive = selectedStayPreference === stayId;
                          const iconMap: Record<string, string> = { inn: '🏡', hotel: '🏨', hostel: '🛏️', none: '🔓' };
                          return (
                            <button
                              key={stayId}
                              type="button"
                              onClick={() => setSelectedStayPreference(stayId)}
                              className={cn(
                                "px-2.5 py-1 rounded-full border transition-all duration-200 cursor-pointer flex items-center gap-1.5 select-none text-xs font-bold",
                                isActive
                                  ? "bg-[var(--color-primary)] border-[var(--color-primary)] text-white shadow-sm"
                                  : "bg-[var(--color-surface-alt)]/40 border-[var(--color-border-light)] text-[var(--color-text-secondary)] hover:border-[var(--color-primary)]/40 hover:text-[var(--color-text)]"
                              )}
                            >
                              {iconMap[stayId]} {t(`stayPreferences.${stayId}`)}
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex gap-2 mt-3 pt-1">
                      <button
                        type="button"
                        onClick={() => setStep(1)}
                        className="flex-1 py-2 border border-[var(--color-border)] hover:bg-[var(--color-surface-hover)] rounded-xl font-bold text-xs transition-all text-[var(--color-text)] cursor-pointer"
                      >
                        {t('prevStep')}
                      </button>
                      <button
                        type="button"
                        onClick={handleGenerateRoute}
                        className="flex-[2] py-2 bg-[var(--color-primary)] hover:bg-[var(--color-primary-hover)] text-white rounded-xl font-bold transition-all shadow-md hover:shadow-lg active:scale-[0.98] flex items-center justify-center gap-2 cursor-pointer text-xs"
                      >
                        <Sparkles className="h-3.5 w-3.5 shrink-0" />
                        {t('generateButton')}
                      </button>
                    </div>
                  </div>
                )}

                {/* Selos. Herdeiros do card "O que oferecemos" e do rodape de
                    certificacoes, que diziam a mesma coisa duas vezes ("100%
                    Cadastur" logo abaixo de "Guias com Cadastur"). Aqui provam
                    o diferencial sem gastar frase: icone e rotulo, e o
                    argumento longo fica para quem rolar a pagina. */}
                <div className="flex flex-wrap items-center gap-x-3 gap-y-1.5 pt-3 border-t border-[var(--color-border-light)]">
                  {[
                    { icon: Route, label: t('seals.ai') },
                    { icon: ShieldCheck, label: t('seals.cadastur') },
                    { icon: Leaf, label: t('seals.stewardship') },
                    { icon: BarChart3, label: t('seals.liveData') },
                  ].map(({ icon: Icon, label }) => (
                    <span
                      key={label}
                      className="flex items-center gap-1.5 text-[11px] font-semibold text-[var(--color-text-secondary)]"
                    >
                      <Icon className="h-3.5 w-3.5 shrink-0 text-[var(--color-primary)]" strokeWidth={1.75} />
                      {label}
                    </span>
                  ))}
                </div>
              </div>
            ) : (
              suggestedRoute && (
                <>
                  {/* STEP 3: Suggested Itinerary */}
                  {step === 3 && (
                    <div className="space-y-4 animate-fade-in h-full flex flex-col justify-between">
                      <div className="flex items-center justify-between border-b border-[var(--color-border)] pb-3 shrink-0">
                        <div className="min-w-0">
                          <Badge variant="accent" size="sm" className="px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider">
                            {t('optimizedItinerary')}
                          </Badge>
                          <h2 className="text-base sm:text-lg font-black text-[var(--color-text)] mt-1 leading-tight truncate pr-2">{suggestedRoute.title}</h2>
                        </div>
                        <button 
                          type="button"
                          onClick={() => { setStep(1); setSuggestedRoute(null); }}
                          className="shrink-0 flex items-center gap-1 text-[10px] font-bold text-[var(--color-primary)] hover:underline border border-[var(--color-primary)]/20 hover:border-[var(--color-primary)]/40 px-2.5 py-1.5 rounded-lg bg-[var(--color-primary-soft)] hover:bg-[var(--color-primary-soft)]/85 transition-all cursor-pointer shadow-sm"
                        >
                          {t('redo')}
                        </button>
                      </div>

                      <p className="text-xs text-[var(--color-text-secondary)] leading-relaxed bg-[var(--color-surface-alt)]/65 p-3 rounded-xl border border-[var(--color-border-light)] shrink-0 mt-1">
                        {suggestedRoute.description}
                      </p>

                      {/* Daily breakdown timeline */}
                      <div className="space-y-3 flex-1 overflow-y-auto pr-1 custom-scrollbar py-2">
                        <p className="text-[10px] uppercase font-bold text-[var(--color-text-muted)] tracking-wider">{t('itinerarySchedule')}</p>
                        
                        <div className="space-y-2.5">
                          {suggestedRoute.days.map((dayItem, dayIndex) => {
                            const isExpanded = expandedDay === dayItem.day;
                            
                            // Calculate legs/mobility details for this day
                            const legs: {
                              from: string;
                              to: string;
                              distance: number;
                              timeText: string;
                              isTooLongForWalking: boolean;
                            }[] = [];

                            // Find previous destination if any
                            let prevDest: typeof destinosInfo[0] | null = null;
                            if (dayIndex > 0) {
                              const prevDay = suggestedRoute.days[dayIndex - 1];
                              if (prevDay.destinations.length > 0) {
                                prevDest = prevDay.destinations[prevDay.destinations.length - 1];
                              }
                            }

                            // Build legs
                            let currentPrev = prevDest;
                            dayItem.destinations.forEach((dest) => {
                              if (currentPrev && currentPrev.nome !== dest.nome) {
                                const dist = haversineKm(
                                  currentPrev.latitude,
                                  currentPrev.longitude,
                                  dest.latitude,
                                  dest.longitude
                                );
                                
                                // Calculate travel time
                                let speed = 60; // default shuttle
                                let transportLabel = t('vanCar');
                                if (selectedTransport === 'hike') {
                                  speed = 4.5;
                                  transportLabel = t('hike');
                                } else if (selectedTransport === 'buggy') {
                                  speed = 30;
                                  transportLabel = t('buggy');
                                }

                                const timeHrs = dist / speed;
                                const timeMins = Math.round(timeHrs * 60);
                                let timeText = '';
                                if (timeMins < 60) {
                                  timeText = t('timeMin', { time: timeMins, transport: transportLabel });
                                } else {
                                  const hrs = Math.floor(timeMins / 60);
                                  const mins = timeMins % 60;
                                  if (mins > 0) {
                                    timeText = t('timeHr', { hours: hrs, minutes: mins, transport: transportLabel });
                                  } else {
                                    timeText = t('timeHrOnly', { hours: hrs, transport: transportLabel });
                                  }
                                }

                                legs.push({
                                  from: currentPrev.nome,
                                  to: dest.nome,
                                  distance: Number(dist.toFixed(1)),
                                  timeText,
                                  isTooLongForWalking: selectedTransport === 'hike' && dist > 5,
                                });
                              }
                              currentPrev = dest;
                            });

                            return (
                              <div 
                                key={dayItem.day} 
                                className={cn(
                                  "rounded-xl border transition-all duration-200 overflow-hidden",
                                  isExpanded 
                                    ? "bg-[var(--color-surface)] border-[var(--color-primary)]/60 shadow-md"
                                    : "bg-[var(--color-surface-alt)]/30 border-[var(--color-border-light)] hover:border-[var(--color-primary)]/20"
                                )}
                              >
                                {/* Header (always visible, clickable) */}
                                <button
                                  type="button"
                                  onClick={() => setExpandedDay(isExpanded ? null : dayItem.day)}
                                  className="w-full p-3.5 flex items-center justify-between text-left cursor-pointer focus:outline-none"
                                >
                                  <div className="flex items-center gap-3">
                                    <div className={cn(
                                      "h-7 w-7 rounded-lg flex items-center justify-center font-bold text-xs shrink-0",
                                      isExpanded 
                                        ? "bg-[var(--color-primary)] text-white shadow-sm" 
                                        : "bg-[var(--color-primary-soft)] text-[var(--color-primary)]"
                                    )}>
                                      {dayItem.day}
                                    </div>
                                    <div className="min-w-0">
                                      <h3 className="font-bold text-xs text-[var(--color-text)]">
                                        {t('day', { day: dayItem.day })}
                                      </h3>
                                      <p className="text-[9px] text-[var(--color-text-muted)] truncate max-w-[200px] sm:max-w-xs">
                                        {dayItem.destinations.map(d => d.nome).join(' ➔ ')}
                                      </p>
                                    </div>
                                  </div>
                                  <div className="text-[var(--color-text-muted)] shrink-0">
                                    {isExpanded ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
                                  </div>
                                </button>

                                {/* Body (collapsible) */}
                                {isExpanded && (
                                  <div className="p-3.5 border-t border-[var(--color-border-light)] space-y-3.5 text-xs bg-[var(--color-surface)] animate-fade-in-up">
                                    <p className="text-[11px] text-[var(--color-text-secondary)] leading-relaxed bg-[var(--color-surface-alt)]/40 p-2.5 rounded-lg border border-[var(--color-border-light)]/50">
                                      {dayItem.description}
                                    </p>

                                    {legs.length > 0 ? (
                                      <div className="space-y-2.5">
                                        <p className="font-bold text-[9px] uppercase text-[var(--color-text-muted)] tracking-wider flex items-center gap-1">
                                          {t('routeAndMobility')}
                                        </p>
                                        
                                        <div className="relative border-l border-dashed border-[var(--color-primary)]/35 pl-4 ml-2.5 space-y-3.5 my-1.5">
                                          {legs.map((leg, idx) => (
                                            <div key={idx} className="relative">
                                              {/* Bullet point */}
                                              <div className="absolute -left-[20.5px] top-1.5 h-2 w-2 rounded-full bg-[var(--color-primary)] border-2 border-[var(--color-surface)] shrink-0" />
                                              
                                              <div className="flex flex-col gap-0.5">
                                                <span className="text-[10px] text-[var(--color-text-secondary)]">
                                                  {t('from')} <strong className="text-[var(--color-text)]">{leg.from}</strong> {t('to')} <strong className="text-[var(--color-text)]">{leg.to}</strong>
                                                </span>
                                                <span className="text-[9px] text-[var(--color-text-muted)] flex items-center gap-2">
                                                  <span className="font-[var(--font-mono)]">{t('distance', { distance: leg.distance })}</span>
                                                  <span className="h-1 w-1 bg-[var(--color-border)]/50 rounded-full" />
                                                  <span className="flex items-center gap-0.5"><Clock className="h-2.5 w-2.5" /> {leg.timeText}</span>
                                                </span>
                                                {leg.isTooLongForWalking && (
                                                  <div className="mt-1 p-2 rounded-lg bg-amber-500/10 border border-amber-500/20 text-[9px] text-amber-600 flex items-start gap-1.5 leading-relaxed">
                                                    <ShieldAlert className="h-3.5 w-3.5 text-amber-600 shrink-0 mt-0.5" />
                                                    <span>
                                                      <strong>{t('warning')}</strong> {t('walkingWarning', { distance: leg.distance })}
                                                    </span>
                                                  </div>
                                                )}
                                              </div>
                                            </div>
                                          ))}
                                        </div>
                                      </div>
                                    ) : (
                                      <div className="p-2.5 rounded-lg bg-[var(--color-primary-soft)]/20 border border-[var(--color-primary)]/15 text-[9px] text-[var(--color-text-secondary)] flex items-center gap-2">
                                        <Info className="h-3.5 w-3.5 text-[var(--color-primary)] shrink-0" />
                                        <span>{t('localRoute')}</span>
                                      </div>
                                    )}

                                    <div className="space-y-2">
                                      <p className="font-bold text-[9px] uppercase text-[var(--color-text-muted)] tracking-wider">
                                        {t('detailedSchedule')}
                                      </p>
                                      
                                      <div className="space-y-2.5">
                                        {dayItem.destinations.map((dest) => (
                                          <div key={dest.nome} className="border border-[var(--color-border-light)] rounded-xl overflow-hidden bg-[var(--color-surface-alt)]/25">
                                            <div className="bg-[var(--color-surface-alt)]/55 px-3 py-1.5 flex items-center justify-between border-b border-[var(--color-border-light)]">
                                              <span className="font-extrabold text-[10px] text-[var(--color-text)] flex items-center gap-1">
                                                📍 {dest.nome}
                                              </span>
                                              <Link href={`/destino/${slugify(dest.nome)}`}>
                                                <span className="text-[9px] text-[var(--color-primary)] hover:underline flex items-center gap-0.5 font-bold">
                                                  {t('viewDestination')} <ArrowRight className="h-2.5 w-2.5" />
                                                </span>
                                              </Link>
                                            </div>

                                            {dest.atracoes && dest.atracoes.length > 0 ? (
                                              <div className="p-2 space-y-1.5 bg-[var(--color-surface)]">
                                                {dest.atracoes.map((act) => {
                                                  const partner = cadasturData.find(c => c.id === act.parceiroId);
                                                  return (
                                                    <div 
                                                      key={act.id} 
                                                      className="flex items-center justify-between py-1.5 px-2 border-b border-[var(--color-border-light)]/20 last:border-0 hover:bg-[var(--color-surface-hover)]/25 transition-all rounded-lg cursor-help group" 
                                                      title={act.descricao}
                                                    >
                                                      <div className="flex items-center gap-2 min-w-0">
                                                        <span className="text-[var(--color-primary)] font-bold text-xs shrink-0">✨</span>
                                                        <div className="min-w-0">
                                                          <span className="font-bold text-[11px] text-[var(--color-text)] block truncate">{act.nome}</span>
                                                          {partner && (
                                                            <span className="inline-flex items-center gap-0.5 mt-0.5 text-[7.5px] font-bold text-[var(--color-success)] bg-[var(--color-success)]/10 px-1 py-0.5 rounded border border-[var(--color-success)]/20">
                                                              🛡️ {partner.nome} ({partner.tipo})
                                                            </span>
                                                          )}
                                                        </div>
                                                      </div>
                                                      <span className="text-[9px] text-[var(--color-text-muted)] opacity-30 group-hover:opacity-100 transition-opacity shrink-0">ℹ️</span>
                                                    </div>
                                                  );
                                                })}
                                              </div>
                                            ) : (
                                              <div className="p-2 text-[9px] text-[var(--color-text-muted)] italic text-center bg-[var(--color-surface)]">
                                                {t('noAttractions')}
                                              </div>
                                            )}
                                          </div>
                                        ))}
                                      </div>
                                    </div>
                                  </div>
                                )}
                              </div>
                            );
                          })}
                        </div>
                      </div>

                      {/* Accept & Plan Sticky CTA */}
                      <div className="mt-2 flex items-center gap-2 shrink-0">
                        <button 
                          type="button"
                          onClick={() => { setStep(1); setSuggestedRoute(null); }}
                          className="px-3 py-2 text-[10px] font-bold text-[var(--color-text-muted)] hover:text-[var(--color-text)] border border-[var(--color-border-light)] rounded-lg cursor-pointer bg-transparent transition-all shrink-0"
                        >
                          ↺ {t('redo')}
                        </button>
                        <button 
                          type="button"
                          onClick={() => setStep(4)}
                          className="flex-1 py-2 bg-[var(--color-primary)] hover:bg-[var(--color-primary-hover)] text-white rounded-xl font-bold transition-all shadow-md hover:shadow-lg active:scale-[0.98] transform flex items-center justify-center gap-2 cursor-pointer text-[10.5px]"
                        >
                          <CheckCircle className="h-3.5 w-3.5 shrink-0" />
                          {t('acceptAndPlan')}
                        </button>
                      </div>
                    </div>
                  )}

                  {/* STEP 4: Choose Experiences & Trip Details Form */}
                  {step === 4 && (
                    <div className="space-y-4 animate-fade-in h-full flex flex-col justify-between">
                      {/* Header */}
                      <div className="border-b border-[var(--color-border)] pb-3 shrink-0">
                        <Badge variant="accent" size="sm" className="px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider">
                          {t('planTripTitle')}
                        </Badge>
                        <p className="text-[10px] text-[var(--color-text-secondary)] mt-1">{t('planTripDesc')}</p>
                      </div>

                      {/* Scrollable Customizer Form */}
                      <div className="space-y-4 flex-1 overflow-y-auto pr-1 custom-scrollbar py-2">
                        
                        {/* Seletor de Experiências */}
                        <div className="space-y-3">
                          <h3 className="text-xs font-bold text-[var(--color-text)] uppercase tracking-wider border-b border-[var(--color-border-light)] pb-1.5">
                            1. {t('selectExperiences')}
                          </h3>
                          
                          <div className="space-y-3">
                            {suggestedRoute.days.map((dayItem) => (
                              <div key={dayItem.day} className="space-y-2">
                                <span className="text-[10px] font-black text-[var(--color-primary)]">
                                  {t('day', { day: dayItem.day })}
                                </span>
                                
                                <div className="space-y-2 pl-2">
                                  {dayItem.destinations.map((dest) => {
                                    // Find Cadastur partners with experiences in this destination
                                    const partnersWithExps = cadasturData.filter(
                                      c => c.destino === dest.nome && c.regularizado && c.experiencias && c.experiencias.length > 0
                                    );
                                    
                                    return (
                                      <div key={dest.nome} className="p-3 rounded-xl border border-[var(--color-border-light)] bg-[var(--color-surface-alt)]/20 space-y-2.5">
                                        <span className="font-extrabold text-[10.5px] text-[var(--color-text)] block">
                                          📍 {dest.nome}
                                        </span>

                                        {/* Standard Attractions Checklist */}
                                        {dest.atracoes && dest.atracoes.length > 0 && (
                                          <div className="space-y-1.5">
                                            <span className="text-[9px] font-bold text-[var(--color-text-muted)] uppercase tracking-wider block">
                                              Atrações Locais
                                            </span>
                                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 pl-0.5">
                                              {dest.atracoes.map((act) => (
                                                <label key={act.id} className="flex items-center gap-2 p-2 rounded-xl hover:bg-[var(--color-surface-hover)]/30 cursor-pointer text-xs select-none group border border-[var(--color-border-light)]/40 bg-[var(--color-surface)]/40 hover:border-[var(--color-primary)]/20 transition-all" title={act.descricao}>
                                                  <input 
                                                    type="checkbox" 
                                                    checked={!!selectedExperiences[act.id]} 
                                                    onChange={(e) => {
                                                      setSelectedExperiences(prev => ({ ...prev, [act.id]: e.target.checked }));
                                                    }}
                                                    className="rounded border-[var(--color-border)] text-[var(--color-primary)] focus:ring-[var(--color-primary)]/20 h-3.5 w-3.5 shrink-0"
                                                  />
                                                  <span className="font-extrabold text-[10px] text-[var(--color-text)] truncate flex-1 leading-tight">{act.nome}</span>
                                                  <span className="text-[9px] text-[var(--color-text-muted)] opacity-35 group-hover:opacity-100 transition-opacity shrink-0">ℹ️</span>
                                                </label>
                                              ))}
                                            </div>
                                          </div>
                                        )}

                                        {/* Cadastur Certified Partner Experiences Checklist */}
                                        {partnersWithExps.length > 0 && (
                                          <div className="space-y-2 pt-2 border-t border-[var(--color-border-light)]/60">
                                            <span className="text-[9px] font-bold text-[var(--color-text-muted)] uppercase tracking-wider block">
                                              Experiências Cadastur Credenciadas
                                            </span>
                                              {partnersWithExps.map((partner) => {
                                                const isExpanded = !!expandedPartners[partner.id];
                                                return (
                                                  <div key={partner.id} className="space-y-2 border border-[var(--color-border-light)]/40 rounded-2xl overflow-hidden bg-[var(--color-surface)] shadow-sm">
                                                    {/* Collapsible Accordion Header */}
                                                    <button
                                                      type="button"
                                                      onClick={() => togglePartner(partner.id)}
                                                      className="w-full text-left py-2.5 px-3.5 bg-[var(--color-surface-alt)]/65 hover:bg-[var(--color-surface-hover)]/80 flex items-center justify-between cursor-pointer transition-all select-none border-b border-[var(--color-border-light)]/20"
                                                    >
                                                      <span className="text-[9.5px] sm:text-xs font-black text-[var(--color-text-secondary)] flex items-center gap-1.5">
                                                        🛡️ {partner.nome} ({partner.tipo})
                                                      </span>
                                                      <span className="text-[9px] text-[var(--color-primary)] font-bold">
                                                        {isExpanded ? 'Ocultar ▲' : 'Ver Experiências ▼'}
                                                      </span>
                                                    </button>
                                                    
                                                    {/* Expandable list of checkboxes */}
                                                    {isExpanded && (
                                                      <div className="p-3.5 pt-1.5 grid grid-cols-1 sm:grid-cols-2 gap-2 animate-fade-in">
                                                        {partner.experiencias?.map((exp, idx) => {
                                                          const expKey = `${partner.id}-exp-${idx}`;
                                                          return (
                                                            <label key={expKey} className="flex items-center gap-2 p-2 rounded-xl hover:bg-[var(--color-surface-hover)]/35 cursor-pointer text-xs select-none group border border-[var(--color-border-light)]/30 bg-[var(--color-surface-alt)]/30 hover:border-[var(--color-primary)]/20 transition-all" title={exp.descricao}>
                                                              <input 
                                                                type="checkbox" 
                                                                checked={!!selectedExperiences[expKey]} 
                                                                onChange={(e) => {
                                                                  setSelectedExperiences(prev => ({ ...prev, [expKey]: e.target.checked }));
                                                                }}
                                                                className="rounded border-[var(--color-border)] text-[var(--color-primary)] focus:ring-[var(--color-primary)]/20 h-3.5 w-3.5 shrink-0"
                                                              />
                                                              <span className="font-bold text-[9.5px] text-[var(--color-text)] truncate flex-1 leading-tight">{exp.titulo}</span>
                                                              <span className="text-[9px] text-[var(--color-text-muted)] opacity-35 group-hover:opacity-100 transition-opacity shrink-0">ℹ️</span>
                                                            </label>
                                                          );
                                                        })}
                                                      </div>
                                                    )}
                                                  </div>
                                                );
                                              })}
                                          </div>
                                        )}
                                      </div>
                                    );
                                  })}
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>

                        {/* Formulário de Informações */}
                        <div className="space-y-3 pt-2 border-t border-[var(--color-border-light)]">
                          <h3 className="text-xs font-bold text-[var(--color-text)] uppercase tracking-wider pb-1">
                            2. {t('tripDetails')}
                          </h3>

                          {/* Datas */}
                          <div className="grid grid-cols-2 gap-2.5">
                            <div className="space-y-1">
                              <label className="text-[9px] font-bold text-[var(--color-text-muted)] uppercase tracking-wider">
                                {t('startDate')}
                              </label>
                              <input 
                                type="date" 
                                value={startDate}
                                onChange={(e) => setStartDate(e.target.value)}
                                className="w-full bg-[var(--color-surface-alt)] border border-[var(--color-border)] rounded-xl py-1.5 px-3 text-xs text-[var(--color-text)] focus:outline-none focus:border-[var(--color-primary)] focus:ring-2 focus:ring-[var(--color-primary)]/25 transition-all"
                              />
                            </div>
                            <div className="space-y-1">
                              <label className="text-[9px] font-bold text-[var(--color-text-muted)] uppercase tracking-wider">
                                {t('endDate')}
                              </label>
                              <input 
                                type="date" 
                                value={endDate}
                                onChange={(e) => setEndDate(e.target.value)}
                                className="w-full bg-[var(--color-surface-alt)] border border-[var(--color-border)] rounded-xl py-1.5 px-3 text-xs text-[var(--color-text)] focus:outline-none focus:border-[var(--color-primary)] focus:ring-2 focus:ring-[var(--color-primary)]/25 transition-all"
                              />
                            </div>
                          </div>

                          {/* Nomes dos Viajantes */}
                          <div className="space-y-1">
                            <label className="text-[9px] font-bold text-[var(--color-text-muted)] uppercase tracking-wider">
                              {t('travelers')}
                            </label>
                            <textarea
                              rows={2}
                              value={travelerNames}
                              onChange={(e) => setTravelerNames(e.target.value)}
                              placeholder={t('travelersPlaceholder')}
                              className="w-full bg-[var(--color-surface-alt)] border border-[var(--color-border)] rounded-xl py-2 px-3 text-xs text-[var(--color-text)] placeholder-[var(--color-text-muted)] focus:outline-none focus:border-[var(--color-primary)] custom-scrollbar resize-none"
                            />
                          </div>

                          {/* Requisitos Especiais */}
                          <div className="space-y-1">
                            <label className="text-[9px] font-bold text-[var(--color-text-muted)] uppercase tracking-wider">
                              {t('specialRequirements')}
                            </label>
                            <textarea
                              rows={2}
                              value={specialRequirements}
                              onChange={(e) => setSpecialRequirements(e.target.value)}
                              placeholder={t('specialReqsPlaceholder')}
                              className="w-full bg-[var(--color-surface-alt)] border border-[var(--color-border)] rounded-xl py-2 px-3 text-xs text-[var(--color-text)] placeholder-[var(--color-text-muted)] focus:outline-none focus:border-[var(--color-primary)] custom-scrollbar resize-none"
                            />
                          </div>
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="flex gap-2 mt-2 pt-1 border-t border-[var(--color-border-light)] shrink-0">
                        <button
                          type="button"
                          onClick={() => setStep(3)}
                          className="flex-1 py-2 border border-[var(--color-border)] hover:bg-[var(--color-surface-hover)] rounded-xl font-bold text-[10.5px] transition-all text-[var(--color-text)] cursor-pointer bg-transparent"
                        >
                          {t('prevStep')}
                        </button>
                        <button
                          type="button"
                          onClick={() => setStep(5)}
                          className="flex-[2] py-2 bg-[var(--color-primary)] hover:bg-[var(--color-primary-hover)] text-white rounded-xl font-bold transition-all shadow-md hover:shadow-lg active:scale-[0.98] flex items-center justify-center gap-2 cursor-pointer text-[10.5px]"
                        >
                          <Sparkles className="h-3.5 w-3.5 shrink-0" />
                          {t('generateSummaryButton')}
                        </button>
                      </div>
                    </div>
                  )}

                  {/* STEP 5: Travel Dossier / Voucher summary */}
                  {step === 5 && (
                    <div className="space-y-6 animate-fade-in h-full flex flex-col justify-between print-container">
                      <style dangerouslySetInnerHTML={{__html: `
                        @media print {
                          body * {
                            visibility: hidden;
                          }
                          .print-container, .print-container * {
                            visibility: visible;
                          }
                          .print-container {
                            position: absolute;
                            left: 0;
                            top: 0;
                            width: 100%;
                            padding: 24px;
                            background: white !important;
                            color: black !important;
                          }
                          .no-print {
                            display: none !important;
                          }
                        }
                      `}} />

                      {/* Header Ticket Ribbon */}
                      <div className="bg-[var(--color-primary-soft)] border border-[var(--color-primary)]/35 rounded-2xl p-5 shrink-0 relative overflow-hidden">
                        <div className="absolute right-4 top-4 opacity-10 font-[var(--font-mono)] text-6xl font-black select-none pointer-events-none">
                          VCHR
                        </div>
                        <div className="flex items-center justify-between">
                          <div>
                            <Badge variant="accent" size="md" className="px-2.5 py-0.5 text-[10px] font-extrabold uppercase tracking-wider">
                              {t('travelDossier')}
                            </Badge>
                            <h2 className="text-base sm:text-lg font-black text-[var(--color-text)] mt-1.5 leading-tight">{suggestedRoute.title}</h2>
                          </div>
                        </div>
                        <div className="mt-4 flex items-center justify-between border-t border-dashed border-[var(--color-primary)]/25 pt-3 text-xs">
                          <div>
                            <span className="text-[10px] text-[var(--color-text-muted)] block uppercase font-bold tracking-wider">{t('bookingCode')}</span>
                            <strong className="font-[var(--font-mono)] text-[var(--color-primary)] text-sm font-black tracking-wider">DT-2026-X79B</strong>
                          </div>
                          {startDate && (
                            <div className="text-right">
                              <span className="text-[10px] text-[var(--color-text-muted)] block uppercase font-bold tracking-wider">Período</span>
                              <strong className="text-[var(--color-text)] font-bold text-xs sm:text-sm">
                                {new Date(startDate + 'T00:00:00').toLocaleDateString('pt-BR')} {endDate ? `➔ ${new Date(endDate + 'T00:00:00').toLocaleDateString('pt-BR')}` : ''}
                              </strong>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Scrollable Summary details */}
                      <div className="space-y-5 flex-1 overflow-y-auto pr-1.5 custom-scrollbar py-2">
                        
                        {/* Resumo do Planejamento */}
                        <div className="p-3 rounded-xl border border-[var(--color-border-light)] bg-[var(--color-surface-alt)]/25 space-y-2">
                          <h3 className="font-extrabold text-[10px] text-[var(--color-text-muted)] uppercase tracking-wider flex items-center gap-1.5">
                            📋 {t('routeSummary')}
                          </h3>
                          <div className="grid grid-cols-2 gap-x-4 gap-y-1.5 text-[10.5px]">
                            <div className="flex items-center gap-1">
                              <span className="text-[var(--color-text-muted)] shrink-0">{t('groupProfile')}:</span>{' '}
                              <strong className="text-[var(--color-text)] font-semibold truncate">{t(`groupProfiles.${selectedGroupProfile}`)}</strong>
                            </div>
                            <div className="flex items-center gap-1">
                              <span className="text-[var(--color-text-muted)] shrink-0">{t('budgetLevel')}:</span>{' '}
                              <strong className="text-[var(--color-text)] font-semibold truncate">{t(`budgets.${selectedBudget}`)}</strong>
                            </div>
                            <div className="flex items-center gap-1">
                              <span className="text-[var(--color-text-muted)] shrink-0">{t('transportLabel')}:</span>{' '}
                              <strong className="text-[var(--color-text)] font-semibold truncate">{t(`transports.${selectedTransport}.label`)}</strong>
                            </div>
                            <div className="flex items-center gap-1">
                              <span className="text-[var(--color-text-muted)] shrink-0">{t('stayPreference')}:</span>{' '}
                              <strong className="text-[var(--color-text)] font-semibold truncate">{t(`stayPreferences.${selectedStayPreference}`)}</strong>
                            </div>
                          </div>

                          {travelerNames.trim() && (
                            <div className="border-t border-[var(--color-border-light)]/60 pt-3 text-xs">
                              <span className="text-[var(--color-text-muted)] block font-semibold mb-1.5">{t('travelers')}:</span>
                              <div className="flex flex-wrap gap-2">
                                {travelerNames.split('\n').filter(Boolean).map((n, i) => (
                                  <span key={i} className="px-3 py-1 rounded-lg bg-[var(--color-surface-alt)] text-xs font-semibold border border-[var(--color-border-light)]">{n}</span>
                                ))}
                              </div>
                            </div>
                          )}

                          {specialRequirements.trim() && (
                            <div className="border-t border-[var(--color-border-light)]/60 pt-3 text-xs">
                              <span className="text-[var(--color-text-muted)] block font-semibold">{t('specialRequirements')}:</span>
                              <p className="text-xs text-[var(--color-text-secondary)] italic leading-relaxed mt-1">{specialRequirements}</p>
                            </div>
                          )}
                        </div>

                        {/* Roteiro Final Detalhado */}
                        <div className="space-y-4">
                          <h3 className="font-extrabold text-xs sm:text-sm text-[var(--color-text-secondary)] uppercase tracking-wider">
                            Itinerário de Experiências
                          </h3>

                          <div className="space-y-4">
                            {suggestedRoute.days.map((dayItem, dayIndex) => {
                              // Calculate legs/mobility
                              const legs: {
                                from: string;
                                to: string;
                                distance: number;
                                timeText: string;
                              }[] = [];

                              let prevDest: typeof destinosInfo[0] | null = null;
                              if (dayIndex > 0) {
                                const prevDay = suggestedRoute.days[dayIndex - 1];
                                if (prevDay.destinations.length > 0) {
                                  prevDest = prevDay.destinations[prevDay.destinations.length - 1];
                                }
                              }

                              let currentPrev = prevDest;
                              dayItem.destinations.forEach((dest) => {
                                if (currentPrev && currentPrev.nome !== dest.nome) {
                                  const dist = haversineKm(
                                    currentPrev.latitude,
                                    currentPrev.longitude,
                                    dest.latitude,
                                    dest.longitude
                                  );
                                  let speed = 60;
                                  let transportLabel = t('vanCar');
                                  if (selectedTransport === 'hike') {
                                    speed = 4.5;
                                    transportLabel = t('hike');
                                  } else if (selectedTransport === 'buggy') {
                                    speed = 30;
                                    transportLabel = t('buggy');
                                  }
                                  const timeHrs = dist / speed;
                                  const timeMins = Math.round(timeHrs * 60);
                                  let timeText = '';
                                  if (timeMins < 60) {
                                    timeText = t('timeMin', { time: timeMins, transport: transportLabel });
                                  } else {
                                    const hrs = Math.floor(timeMins / 60);
                                    const mins = timeMins % 60;
                                    if (mins > 0) {
                                      timeText = t('timeHr', { hours: hrs, minutes: mins, transport: transportLabel });
                                    } else {
                                      timeText = t('timeHrOnly', { hours: hrs, transport: transportLabel });
                                    }
                                  }
                                  legs.push({
                                    from: currentPrev.nome,
                                    to: dest.nome,
                                    distance: Number(dist.toFixed(1)),
                                    timeText,
                                  });
                                }
                                currentPrev = dest;
                              });

                              return (
                                <div key={dayItem.day} className="p-3 rounded-xl border border-[var(--color-border-light)] bg-[var(--color-surface)] space-y-2.5">
                                  <div className="flex items-center gap-2">
                                    <div className="h-5 w-5 rounded-md bg-[var(--color-primary)] text-white flex items-center justify-center text-[9px] font-black shrink-0">{dayItem.day}</div>
                                    <span className="text-[10.5px] font-black text-[var(--color-text)]">
                                      {t('day', { day: dayItem.day })}
                                    </span>
                                  </div>

                                  {legs.length > 0 && (
                                    <div className="bg-[var(--color-surface-alt)]/40 px-2.5 py-1.5 rounded-lg border border-[var(--color-border-light)]/60 space-y-1">
                                      {legs.map((leg, idx) => (
                                        <div key={idx} className="flex items-center gap-1 text-[9.5px] text-[var(--color-text-secondary)]">
                                          <span className="shrink-0">🚗</span>
                                          <span className="font-bold text-[var(--color-text)] truncate">{leg.from}</span>
                                          <span className="shrink-0 text-[var(--color-text-muted)]]">➔</span>
                                          <span className="font-bold text-[var(--color-text)] truncate">{leg.to}</span>
                                          <span className="ml-auto shrink-0 text-[9px] font-[var(--font-mono)] text-[var(--color-text-muted)]">{leg.distance}km • {leg.timeText}</span>
                                        </div>
                                      ))}
                                    </div>
                                  )}

                                  <div className="space-y-3 pt-1">
                                    {dayItem.destinations.map((dest) => {
                                      // Find enriched destination details
                                      const enrichedDest = destinations.find(d => d.nome === dest.nome) || { ...dest, isa: 0 };
                                      // Find selected local attractions
                                      const selectedLocalAtts = dest.atracoes?.filter(act => !!selectedExperiences[act.id]) || [];
                                      
                                      // Find selected Cadastur partner experiences
                                      const partnersWithExps = cadasturData.filter(c => c.destino === dest.nome && c.regularizado);
                                      const selectedPartnerExps: { partner: typeof cadasturData[0]; title: string; desc: string }[] = [];
                                      
                                      partnersWithExps.forEach(partner => {
                                        partner.experiencias?.forEach((exp, idx) => {
                                          if (selectedExperiences[`${partner.id}-exp-${idx}`]) {
                                            selectedPartnerExps.push({ partner, title: exp.titulo, desc: exp.descricao });
                                          }
                                        });
                                      });

                                      const hasSelectedExps = selectedLocalAtts.length > 0 || selectedPartnerExps.length > 0;

                                      return (
                                        <div key={dest.nome} className="pl-3 border-l-2 border-[var(--color-primary)]/45 py-1 space-y-2">
                                          <div className="flex items-center justify-between text-xs sm:text-sm">
                                            <strong className="text-[var(--color-text)] font-black">📍 {dest.nome}</strong>
                                            <span className="text-[9px] bg-[var(--color-primary-soft)] text-[var(--color-primary)] px-2 py-0.5 rounded font-[var(--font-mono)] font-extrabold">
                                              ISA {enrichedDest.isa}
                                            </span>
                                          </div>

                                          {hasSelectedExps ? (
                                            <div className="space-y-2.5 pl-1.5 text-xs">
                                              {/* Local Attractions */}
                                              {selectedLocalAtts.map(act => (
                                                <div key={act.id} className="flex items-start gap-2">
                                                  <span className="text-[var(--color-success)] shrink-0 font-bold text-sm">✔️</span>
                                                  <div>
                                                    <strong className="text-[var(--color-text)] font-bold text-xs sm:text-sm">{act.nome}</strong>
                                                    <span className="text-[11px] sm:text-xs text-[var(--color-text-secondary)] leading-relaxed block mt-0.5">{act.descricao}</span>
                                                  </div>
                                                </div>
                                              ))}

                                              {/* Partner Experiences */}
                                              {selectedPartnerExps.map((pExp, idx) => (
                                                <div key={idx} className="p-3 rounded-xl bg-[var(--color-primary-soft)]/20 border border-[var(--color-primary)]/10 space-y-1">
                                                  <div className="flex items-start gap-1.5">
                                                    <span className="text-[var(--color-primary)] shrink-0 font-bold">🛡️</span>
                                                    <div>
                                                      <strong className="text-[var(--color-text)] font-bold text-xs sm:text-sm">{pExp.title}</strong>
                                                      <span className="text-[11px] sm:text-xs text-[var(--color-text-secondary)] leading-relaxed block mt-0.5">{pExp.desc}</span>
                                                      <span className="text-[9.5px] text-[var(--color-text-muted)] block mt-1.5 font-medium">
                                                        Fornecido por: {pExp.partner.nome} • Tel: {pExp.partner.telefone}
                                                      </span>
                                                    </div>
                                                  </div>
                                                </div>
                                              ))}
                                            </div>
                                          ) : (
                                            <span className="text-xs text-[var(--color-text-muted)] italic pl-1.5 block">
                                              Nenhuma atividade selecionada. Aproveite para passear livremente.
                                            </span>
                                          )}
                                        </div>
                                      );
                                    })}
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        </div>

                        {/* Sustainability Compliance Shield */}
                        <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-xs sm:text-sm text-[var(--color-text-secondary)] flex items-start gap-3">
                          <Shield className="h-6 w-6 text-emerald-600 shrink-0 mt-0.5" />
                          <div>
                            <h4 className="font-extrabold text-xs text-emerald-800 uppercase tracking-wider">{t('sustainabilityShield')}</h4>
                            <p className="text-[11px] sm:text-xs text-emerald-700/90 leading-relaxed mt-1">
                              {t('sustainabilityText')}
                            </p>
                          </div>
                        </div>
                      </div>

                      {/* ═══ AVALIAÇÃO CTA BANNER ═══ */}
                      <div className="shrink-0 no-print">
                        <button
                          type="button"
                          onClick={() => setStep(6)}
                          className="w-full group relative overflow-hidden rounded-2xl border-2 border-[var(--color-accent)]/50 bg-gradient-to-r from-[var(--color-accent-soft)] via-[var(--color-primary-soft)] to-[var(--color-accent-soft)] p-4 text-left transition-all duration-300 hover:border-[var(--color-accent)] hover:shadow-lg hover:shadow-[var(--color-accent)]/10 cursor-pointer"
                        >
                          <div className="flex items-center gap-3">
                            <div className="relative shrink-0">
                              <div className="h-11 w-11 rounded-xl bg-[var(--color-accent)]/20 flex items-center justify-center">
                                <ClipboardCheck className="h-5 w-5 text-[var(--color-accent)]" />
                              </div>
                              <span className="absolute -top-1 -right-1 flex h-3 w-3">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[var(--color-accent)] opacity-75" />
                                <span className="relative inline-flex rounded-full h-3 w-3 bg-[var(--color-accent)]" />
                              </span>
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-[11px] font-black text-[var(--color-text)] uppercase tracking-wider">
                                ⭐ Já visitou os pontos do roteiro?
                              </p>
                              <p className="text-[9.5px] text-[var(--color-text-secondary)] mt-0.5 leading-relaxed">
                                Avalie agora e ajude o Observatório a monitorar a qualidade do turismo no RN.
                              </p>
                            </div>
                            <ArrowRight className="h-4 w-4 text-[var(--color-accent)] shrink-0 group-hover:translate-x-1 transition-transform" />
                          </div>
                        </button>
                      </div>

                      {/* Print/Share Actions */}
                      <div className="space-y-2 pt-2.5 border-t border-[var(--color-border-light)] shrink-0 no-print">
                        {/* Primary action row */}
                        <div className="flex gap-2">
                          <button
                            type="button"
                            onClick={() => handleShareWhatsApp(false)}
                            className="flex-1 py-2 bg-[#25D366] hover:bg-[#20ba59] text-white rounded-xl font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer border-0 text-[10.5px]"
                          >
                            <Share2 className="h-3.5 w-3.5" />
                            WhatsApp
                          </button>
                          <button
                            type="button"
                            onClick={() => handleShareWhatsApp(true)}
                            className="flex-1 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer border-0 text-[10.5px]"
                          >
                            <Share2 className="h-3.5 w-3.5" />
                            PDF + WhatsApp
                          </button>
                          <button
                            type="button"
                            onClick={() => window.print()}
                            className="px-3 py-2 bg-[var(--color-surface-alt)] hover:bg-[var(--color-surface-hover)] border border-[var(--color-border)] text-[var(--color-text-secondary)] rounded-xl font-bold transition-all flex items-center justify-center gap-1 cursor-pointer text-[10px]"
                            title={t('printItinerary')}
                          >
                            <Printer className="h-3.5 w-3.5" />
                          </button>
                        </div>
                        {/* Secondary row */}
                        <div className="flex gap-2">
                          <button
                            type="button"
                            onClick={() => setStep(4)}
                            className="flex-1 py-1.5 text-[9.5px] border border-[var(--color-border-light)] hover:bg-[var(--color-surface-hover)] rounded-lg font-bold text-[var(--color-text-muted)] cursor-pointer bg-transparent transition-all"
                          >
                            ← Editar Detalhes
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              setStep(1);
                              setSuggestedRoute(null);
                              setStartDate('');
                              setEndDate('');
                              setTravelerNames('');
                              setSpecialRequirements('');
                              setSelectedExperiences({});
                            }}
                            className="flex-1 py-1.5 text-[9.5px] bg-[var(--color-primary-soft)] hover:bg-[var(--color-primary-soft)]/85 text-[var(--color-primary)] border border-[var(--color-primary)]/15 rounded-lg font-bold transition-all text-center cursor-pointer"
                          >
                            ✦ {t('newPlanning')}
                          </button>
                        </div>
                        <p className="text-[9px] text-center text-[var(--color-text-muted)] opacity-70">
                          💡 No PDF: salve o roteiro como arquivo PDF e annexe no WhatsApp
                        </p>
                      </div>
                    </div>
                  )}

                  {/* STEP 6: Post-Visit Evaluation */}
                  {step === 6 && suggestedRoute && (() => {
                    const allDests = suggestedRoute.days.flatMap(d => d.destinations);
                    const uniqueDests = allDests.filter((d, i, arr) => arr.findIndex(x => x.nome === d.nome) === i);
                    const allSubmitted = uniqueDests.every(d => evalSubmittedDests[d.nome]);

                    return (
                      <div className="space-y-4 animate-fade-in h-full flex flex-col justify-between">
                        {/* Header */}
                        <div className="border-b border-[var(--color-border)] pb-3 shrink-0">
                          <Badge variant="accent" size="sm" className="px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider">
                            <ClipboardCheck className="h-3 w-3" />
                            Avaliação Pós-Visita
                          </Badge>
                          <h2 className="text-base font-black text-[var(--color-text)] mt-1 leading-tight">Conte como foi sua experiência</h2>
                          <p className="text-[9.5px] text-[var(--color-text-secondary)] mt-0.5 leading-relaxed">
                            Suas avaliações alimentam o Observatório e protegem o turismo sustentável do RN.
                          </p>
                        </div>

                        {allSubmitted ? (
                          /* All Submitted State */
                          <div className="flex-1 flex flex-col items-center justify-center text-center gap-4 py-8 animate-scale-in">
                            <div className="h-16 w-16 rounded-2xl bg-[var(--color-success)]/10 flex items-center justify-center">
                              <CheckCircle className="h-8 w-8 text-[var(--color-success)]" />
                            </div>
                            <div>
                              <h3 className="text-lg font-black text-[var(--color-text)]">Obrigado pela contribuição!</h3>
                              <p className="text-xs text-[var(--color-text-muted)] mt-1 max-w-xs">
                                Suas avaliações estão ajudando a manter o turismo sustentável e de qualidade no Rio Grande do Norte.
                              </p>
                            </div>
                            <div className="flex gap-2">
                              <button
                                type="button"
                                onClick={() => setStep(5)}
                                className="px-4 py-2 border border-[var(--color-border-light)] rounded-xl text-[10.5px] font-bold text-[var(--color-text-muted)] cursor-pointer bg-transparent hover:bg-[var(--color-surface-hover)] transition-all"
                              >
                                ← Ver Dossier
                              </button>
                              <button
                                type="button"
                                onClick={() => {
                                  setStep(1);
                                  setSuggestedRoute(null);
                                  setEvalRatings({});
                                  setEvalCriteriaByDest({});
                                  setEvalConformityByDest({});
                                  setEvalComments({});
                                  setEvalSubmittedDests({});
                                }}
                                className="px-4 py-2 bg-[var(--color-primary)] text-white rounded-xl text-[10.5px] font-bold cursor-pointer hover:bg-[var(--color-primary-hover)] transition-all"
                              >
                                ✦ Novo Roteiro
                              </button>
                            </div>
                          </div>
                        ) : (
                          /* Evaluation Cards */
                          <div className="flex-1 overflow-y-auto pr-1 custom-scrollbar space-y-3 py-1">
                            {uniqueDests.map((dest) => {
                              const submitted = evalSubmittedDests[dest.nome];
                              const rating = evalRatings[dest.nome] || 0;
                              const criteria = evalCriteriaByDest[dest.nome] || {};
                              const conformity = evalConformityByDest[dest.nome] || 'yes';
                              const comment = evalComments[dest.nome] || '';
                              const isLoading = evalLoadingDest === dest.nome;

                              return (
                                <div
                                  key={dest.nome}
                                  className={cn(
                                    "rounded-xl border overflow-hidden transition-all duration-300",
                                    submitted
                                      ? "border-[var(--color-success)]/40 bg-[var(--color-success)]/5"
                                      : "border-[var(--color-border-light)] bg-[var(--color-surface)]"
                                  )}
                                >
                                  {/* Dest Header */}
                                  <div className={cn(
                                    "px-3.5 py-2.5 flex items-center justify-between border-b border-[var(--color-border-light)]",
                                    submitted ? "bg-[var(--color-success)]/8" : "bg-[var(--color-surface-alt)]/40"
                                  )}>
                                    <span className="font-extrabold text-[10.5px] text-[var(--color-text)] flex items-center gap-1.5">
                                      📍 {dest.nome}
                                    </span>
                                    {submitted && (
                                      <span className="flex items-center gap-1 text-[9px] font-bold text-[var(--color-success)]">
                                        <CheckCircle className="h-3 w-3" /> Avaliado
                                      </span>
                                    )}
                                  </div>

                                  {submitted ? (
                                    /* Submitted Summary */
                                    <div className="px-3.5 py-2.5 flex items-center gap-3">
                                      <div className="flex gap-0.5">
                                        {[1,2,3,4,5].map(s => (
                                          <Star
                                            key={s}
                                            className={cn("h-3.5 w-3.5", s <= rating ? "text-amber-400 fill-amber-400" : "text-[var(--color-border)] fill-[var(--color-border)]")}
                                          />
                                        ))}
                                      </div>
                                      <span className="text-[9.5px] text-[var(--color-text-muted)]">
                                        {rating}/5 — Obrigado!
                                      </span>
                                    </div>
                                  ) : (
                                    /* Evaluation Form */
                                    <div className="p-3.5 space-y-3">
                                      {/* Star Rating */}
                                      <div className="space-y-1.5">
                                        <label className="text-[9px] font-bold text-[var(--color-text-muted)] uppercase tracking-wider block">Nota geral</label>
                                        <StarRating
                                          value={rating}
                                          onChange={(val) => setEvalRatings(prev => ({ ...prev, [dest.nome]: val }))}
                                          size="md"
                                        />
                                      </div>

                                      {/* Criteria chips */}
                                      <div className="space-y-1.5">
                                        <label className="text-[9px] font-bold text-[var(--color-text-muted)] uppercase tracking-wider block">O que você observou?</label>
                                        <div className="flex flex-wrap gap-1">
                                          {evalCriteria.map(c => {
                                            const active = !!criteria[c.key];
                                            return (
                                              <button
                                                key={c.key}
                                                type="button"
                                                onClick={() => setEvalCriteriaByDest(prev => ({
                                                  ...prev,
                                                  [dest.nome]: { ...(prev[dest.nome] || {}), [c.key]: !prev[dest.nome]?.[c.key] }
                                                }))}
                                                className={cn(
                                                  "inline-flex items-center gap-1 px-2 py-1 rounded-full text-[9px] font-bold border cursor-pointer transition-all",
                                                  active
                                                    ? c.negative
                                                      ? "bg-red-500/10 border-red-500/30 text-red-600"
                                                      : "bg-[var(--color-success)]/10 border-[var(--color-success)]/30 text-[var(--color-success)]"
                                                    : "bg-[var(--color-surface-alt)] border-[var(--color-border-light)] text-[var(--color-text-secondary)] hover:border-[var(--color-primary)]/40"
                                                )}
                                              >
                                                {c.emoji} {c.label}
                                              </button>
                                            );
                                          })}
                                        </div>
                                      </div>

                                      {/* Conformity */}
                                      <div className="space-y-1.5">
                                        <label className="text-[9px] font-bold text-[var(--color-text-muted)] uppercase tracking-wider block">
                                          🔍 A realidade condiz com o anunciado?
                                        </label>
                                        <div className="flex gap-1.5">
                                          <button
                                            type="button"
                                            onClick={() => setEvalConformityByDest(prev => ({ ...prev, [dest.nome]: 'yes' }))}
                                            className={cn(
                                              "flex-1 py-1.5 rounded-lg text-[9.5px] font-bold border flex items-center justify-center gap-1 cursor-pointer transition-colors",
                                              conformity === 'yes'
                                                ? "bg-[var(--color-success)]/10 border-[var(--color-success)]/40 text-[var(--color-success)]"
                                                : "bg-[var(--color-surface)] border-[var(--color-border-light)] text-[var(--color-text-secondary)]"
                                            )}
                                          >
                                            <ThumbsUp className="h-3 w-3" /> Sim, condiz
                                          </button>
                                          <button
                                            type="button"
                                            onClick={() => setEvalConformityByDest(prev => ({ ...prev, [dest.nome]: 'no' }))}
                                            className={cn(
                                              "flex-1 py-1.5 rounded-lg text-[9.5px] font-bold border flex items-center justify-center gap-1 cursor-pointer transition-colors",
                                              conformity === 'no'
                                                ? "bg-red-500/10 border-red-500/40 text-red-600"
                                                : "bg-[var(--color-surface)] border-[var(--color-border-light)] text-[var(--color-text-secondary)]"
                                            )}
                                          >
                                            <ThumbsDown className="h-3 w-3" /> Há divergências
                                          </button>
                                        </div>
                                      </div>

                                      {/* Comment */}
                                      <div className="space-y-1">
                                        <label className="text-[9px] font-bold text-[var(--color-text-muted)] uppercase tracking-wider block">Comentário (opcional)</label>
                                        <textarea
                                          rows={2}
                                          value={comment}
                                          onChange={(e) => setEvalComments(prev => ({ ...prev, [dest.nome]: e.target.value }))}
                                          placeholder="Conte como foi sua experiência..."
                                          className="w-full bg-[var(--color-surface-alt)] border border-[var(--color-border-light)] rounded-lg py-1.5 px-2.5 text-[10px] text-[var(--color-text)] placeholder-[var(--color-text-muted)] focus:outline-none focus:border-[var(--color-primary)] resize-none custom-scrollbar"
                                        />
                                      </div>

                                      {/* Submit */}
                                      <button
                                        type="button"
                                        disabled={rating === 0 || isLoading}
                                        onClick={() => handleEvalSubmitDest(dest.nome)}
                                        className={cn(
                                          "w-full py-2 rounded-xl font-bold text-[10.5px] flex items-center justify-center gap-1.5 transition-all",
                                          rating === 0
                                            ? "bg-[var(--color-surface-alt)] text-[var(--color-text-muted)] border border-[var(--color-border-light)] cursor-not-allowed"
                                            : "bg-[var(--color-primary)] text-white hover:bg-[var(--color-primary-hover)] cursor-pointer shadow-sm hover:shadow-md active:scale-[0.98]"
                                        )}
                                      >
                                        {isLoading ? (
                                          <span className="animate-spin h-3.5 w-3.5 border-2 border-white/30 border-t-white rounded-full" />
                                        ) : (
                                          <Send className="h-3.5 w-3.5" />
                                        )}
                                        {isLoading ? 'Enviando...' : 'Enviar Avaliação'}
                                      </button>
                                    </div>
                                  )}
                                </div>
                              );
                            })}
                          </div>
                        )}

                        {/* Back to dossier */}
                        {!allSubmitted && (
                          <div className="shrink-0 pt-2 border-t border-[var(--color-border-light)]">
                            <button
                              type="button"
                              onClick={() => setStep(5)}
                              className="w-full py-1.5 text-[9.5px] border border-[var(--color-border-light)] hover:bg-[var(--color-surface-hover)] rounded-lg font-bold text-[var(--color-text-muted)] cursor-pointer bg-transparent transition-all"
                            >
                              ← Voltar ao Dossier de Viagem
                            </button>
                          </div>
                        )}
                      </div>
                    );
                  })()}
                </>
              )
            )}
          </div>

          {/* Indicador de scroll: trilho fino com o ponto descendo, no lugar do
              desenho de mouse — a cena 3D ja e o elemento pesado do hero.
              Pousa sobre o satelite, entao usa branco proprio em vez dos tokens
              de superficie, que sumiriam na foto. */}
          <button
            type="button"
            onClick={() => document.getElementById('recommended-destinations')?.scrollIntoView({ behavior: 'smooth' })}
            className="absolute bottom-6 left-6 hidden lg:flex flex-col items-center gap-2.5 z-20 cursor-pointer group bg-transparent border-0 p-1 rounded-lg [text-shadow:0_1px_8px_rgba(0,0,0,0.6)] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-white"
          >
            <span className="text-[10px] font-bold uppercase tracking-[0.18em] text-white/80 group-hover:text-white transition-colors">
              Explorar Destinos
            </span>
            <span className="relative block h-10 w-px overflow-hidden bg-white/35 group-hover:bg-white/60 transition-colors">
              <span className="scroll-hint-dot absolute left-1/2 h-2.5 w-[3px] rounded-full bg-white/80 group-hover:bg-white transition-colors" />
            </span>
          </button>

      </section>

      {/* ═══ Popular Destinations (Larger Clickable Cards) ═══ */}
      <section id="recommended-destinations" className="max-w-7xl mx-auto px-4 py-6">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-3xl font-extrabold text-[var(--color-text)] tracking-tight">{t('recommendedDestinations')}</h2>
            <p className="text-sm text-[var(--color-text-muted)] mt-1">{t('recommendedSubtitle')}</p>
          </div>
          <Link
            href="/ranking"
            className="hidden sm:flex items-center gap-1.5 text-sm font-semibold text-[var(--color-primary)] hover:underline"
          >
            {t('viewFullRanking')} <ArrowRight className="h-4 w-4" />
          </Link>
        </div>

        {/* Larger Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 stagger-children">
          {topDestinations.map((dest, i) => {
            const badge = getISABadge(dest.isa, tRanking);
            return (
              <Link key={dest.nome} href={`/destino/${slugify(dest.nome)}`}>
                <Card variant="interactive" padding="none" className="overflow-hidden group h-[440px] flex flex-col justify-between">
                  
                  {/* Larger Image Section */}
                  <div className="relative h-64 w-full overflow-hidden">
                    <Image
                      src={dest.imagem || '/images/destinations/hero_ponta_negra.png'}
                      alt={dest.nome}
                      fill
                      className="object-cover transition-transform duration-500 group-hover:scale-105"
                      sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-transparent to-transparent" />
                    
                    {/* Position Label */}
                    <div className="absolute top-4 left-4">
                      <span className="inline-flex h-8 w-8 items-center justify-center rounded-xl bg-white/20 backdrop-blur-md text-white text-xs font-bold">
                        #{i + 1}
                      </span>
                    </div>

                    {/* Status Badge */}
                    <div className="absolute top-4 right-4">
                      <Badge variant={badge.variant} size="md">{badge.label}</Badge>
                    </div>

                    {/* Name & Location overlay */}
                    <div className="absolute bottom-4 left-4 right-4">
                      <h3 className="text-xl font-bold text-white leading-tight">{dest.nome}</h3>
                      <p className="text-xs text-white/80 flex items-center gap-1 mt-1">
                        <MapPin className="h-3 w-3 text-[var(--color-accent)]" /> {dest.municipio}
                      </p>
                    </div>
                  </div>

                  {/* Info details */}
                  <div className="p-5 flex-1 flex flex-col justify-between bg-[var(--color-surface)]">
                    <p className="text-xs text-[var(--color-text-secondary)] line-clamp-2 leading-relaxed">
                      {dest.descricao}
                    </p>

                    <div className="flex items-center justify-between border-t border-[var(--color-border)] pt-4 mt-3">
                      <div className="flex items-center gap-4">
                        <div className="text-center">
                          <p className="text-base font-extrabold text-[var(--color-primary)] font-[var(--font-mono)] leading-none">{dest.isa}</p>
                          <p className="text-[9px] text-[var(--color-text-muted)] uppercase tracking-wider mt-1">{t('isaScore')}</p>
                        </div>
                        <div className="h-6 w-px bg-[var(--color-border)]" />
                        <div className="text-center">
                          <p className="text-sm font-bold text-[var(--color-text)] leading-none">
                            {dest.fluxo ? (dest.fluxo.fluxo_visitantes_mes / 1000).toFixed(0) + 'k' : '—'}
                          </p>
                          <p className="text-[9px] text-[var(--color-text-muted)] uppercase tracking-wider mt-1">{t('monthlyTraffic')}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-1 text-xs font-bold text-[var(--color-text)]">
                        <Eye className="h-4 w-4 text-[var(--color-primary)]" />
                        <span>{t('viewDestinationLabel')}</span>
                      </div>
                    </div>
                  </div>

                </Card>
              </Link>
            );
          })}
        </div>

        <Link
          href="/ranking"
          className="sm:hidden flex items-center justify-center gap-1.5 mt-8 text-sm font-semibold text-[var(--color-primary)]"
        >
          {t('viewFullRanking')} <ArrowRight className="h-4 w-4" />
        </Link>
      </section>

      {/* ═══ All Destinations List ═══ */}
      <section className="max-w-7xl mx-auto px-4 pb-12">
        <h2 className="text-2xl font-bold text-[var(--color-text)] mb-6">{t('allDestinations')}</h2>
        <div className="space-y-4">
          {destinations.map((dest) => {
            const badge = getISABadge(dest.isa, tRanking);
            return (
              <Link
                key={dest.nome}
                href={`/destino/${slugify(dest.nome)}`}
                className="block group"
              >
                <div className="surface-card-interactive p-4 flex flex-col sm:flex-row items-center gap-4 text-left">
                  {/* Left: Image */}
                  <div className="relative h-20 w-20 sm:h-24 sm:w-24 rounded-2xl overflow-hidden flex-shrink-0">
                    <Image
                      src={dest.imagem || '/images/destinations/hero_ponta_negra.png'}
                      alt={dest.nome}
                      fill
                      className="object-cover transition-transform duration-300 group-hover:scale-105"
                      sizes="96px"
                    />
                  </div>

                  {/* Middle: Content */}
                  <div className="flex-1 min-w-0 space-y-1.5">
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="text-base font-bold text-[var(--color-text)] group-hover:text-[var(--color-primary)] transition-colors">
                        {dest.nome}
                      </h3>
                      <span className="text-[10px] text-[var(--color-text-secondary)] font-semibold flex items-center gap-0.5 bg-[var(--color-surface-alt)] px-2 py-0.5 rounded-lg border border-[var(--color-border-light)]">
                        <MapPin className="h-3 w-3 text-[var(--color-primary)] animate-bounce" />
                        {dest.municipio}
                      </span>
                    </div>
                    
                    <p className="text-xs text-[var(--color-text-secondary)] line-clamp-1 leading-relaxed">
                      {dest.descricao}
                    </p>

                    {/* Stats & Metadata */}
                    <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 pt-1 text-[10px] font-medium text-[var(--color-text-muted)]">
                      <span className="flex items-center gap-1">
                        <Users className="h-3.5 w-3.5 text-[var(--color-primary)]" />
                        {t('trafficLabel')} <strong className="text-[var(--color-text)]">{dest.fluxo ? (dest.fluxo.fluxo_visitantes_mes / 1000).toFixed(0) + 'k' : '0'}</strong>{t('monthly')}
                      </span>
                      <div className="hidden sm:block h-3 w-px bg-[var(--color-border-light)]" />
                      
                      {dest.fluxo && (
                        <>
                          <span className="flex items-center gap-1">
                            <span className={cn(
                              'h-1.5 w-1.5 rounded-full',
                              dest.fluxo.saturacao_turistica <= 50 ? 'bg-emerald-500' : dest.fluxo.saturacao_turistica <= 75 ? 'bg-amber-500' : 'bg-rose-500'
                            )} />
                            {t('crowdingLabel')} <strong className="text-[var(--color-text)]">
                              {dest.fluxo.saturacao_turistica <= 50 ? t('crowdingEasy') : dest.fluxo.saturacao_turistica <= 75 ? t('crowdingMedium') : t('crowdingHard')}
                            </strong>
                          </span>
                          <div className="hidden sm:block h-3 w-px bg-[var(--color-border-light)]" />
                          <span className="flex items-center gap-1">
                            <Clock className="h-3.5 w-3.5 text-indigo-400" />
                            {t('bestTimeLabel')} <strong className="text-[var(--color-text)]">
                              {dest.fluxo.saturacao_turistica <= 50 ? t('bestTimeAny') : dest.fluxo.saturacao_turistica <= 75 ? t('bestTimeOffPeak') : t('bestTimePeak')}
                            </strong>
                          </span>
                          <div className="hidden sm:block h-3 w-px bg-[var(--color-border-light)]" />
                        </>
                      )}

                      <span className="flex items-center gap-1">
                        <Shield className="h-3.5 w-3.5 text-[var(--color-success)]" />
                        {t('cadasturLabel')} <strong className="text-[var(--color-text)]">{dest.partners.length}</strong> {t('partnersLabel')}
                      </span>
                    </div>
                  </div>

                  {/* Right: ISA score ring & button */}
                  <div className="flex flex-row sm:flex-col items-center gap-3 sm:gap-2 sm:self-center flex-shrink-0 w-full sm:w-auto justify-between sm:justify-center border-t sm:border-t-0 border-[var(--color-border-light)] pt-3 sm:pt-0 mt-2 sm:mt-0">
                    <div className="flex items-center gap-2">
                      <div className="text-right">
                        <span className="text-[9px] text-[var(--color-text-muted)] uppercase tracking-wider block font-bold leading-none mb-0.5">{t('isaScore')}</span>
                        <div className="flex items-center gap-1 justify-end">
                          <span className={cn(
                            'h-1.5 w-1.5 rounded-full animate-pulse',
                            badge.variant === 'success' && 'bg-[var(--color-success)]',
                            badge.variant === 'warning' && 'bg-[var(--color-warning)]',
                            badge.variant === 'danger' && 'bg-[var(--color-danger)]',
                          )} />
                          <span className="text-xs font-black text-[var(--color-text)] font-[var(--font-mono)]">{dest.isa}</span>
                        </div>
                      </div>
                      <Badge variant={badge.variant} size="sm">
                        {badge.label}
                      </Badge>
                    </div>

                    <div className="flex items-center gap-1 text-xs font-bold text-[var(--color-primary)] group-hover:translate-x-1 transition-transform duration-200">
                      <span>{t('viewDestinationLabel')}</span>
                      <ArrowRight className="h-3.5 w-3.5" />
                    </div>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      </section>
    </div>
  );
}
