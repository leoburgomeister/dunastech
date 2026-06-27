'use client';

import { useState, useMemo } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import dynamic from 'next/dynamic';
import { 
  MapPin, Star, Users, TrendingUp, ArrowRight, Shield, Sparkles, 
  Map, Award, Calendar, Compass, ShieldAlert, CheckCircle, Navigation, Eye
} from 'lucide-react';
import { cn, slugify } from '@/lib/utils';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { destinosInfo, fluxoData, cadasturData, calcularISA } from '@/data/mockData';
import type { Feedback } from '@/data/mockData';

// Dynamically load Map component to prevent SSR window error on homepage
const HomeRouteMap = dynamic(
  () => import('./HomeRouteMap'),
  { ssr: false }
);

function getISABadge(score: number) {
  if (score >= 80) return { label: 'Saudável', variant: 'success' as const };
  if (score >= 60) return { label: 'Atenção', variant: 'warning' as const };
  return { label: 'Crítico', variant: 'danger' as const };
}

// Questionnaire Options
const styles = [
  { id: 'adventure', label: 'Aventura & Dunas 🏄‍♂️', desc: 'Para quem busca adrenalina, passeios de buggy e dunas móveis.' },
  { id: 'relax', label: 'Relaxar & Natureza 🐚', desc: 'Praias desertas, piscinas naturais e lagoas de água doce calma.' },
  { id: 'culture', label: 'História & Cultura 🏰', desc: 'Forte colonial, casarões históricos e centros de artesanato.' },
  { id: 'gastronomy', label: 'Gastronomia 🦐', desc: 'Restaurantes de frutos do mar, culinária sertaneja e drinks regionais.' },
];

const durations = [
  { id: '1day', label: '1 Dia (Bate-volta) 📅' },
  { id: 'weekend', label: 'Fim de Semana 🌅' },
  { id: '1week', label: '1 Semana ou mais backpack 🎒' },
];

const transports = [
  { id: 'buggy', label: 'Buggy / 4x4 🚗' },
  { id: 'shuttle', label: 'Translado / Vans 🚌' },
  { id: 'hike', label: 'Caminhada / Trilha 🥾' },
];

interface RouteDay {
  day: number;
  destinations: typeof destinosInfo;
  description: string;
}

export default function TouristHomePage() {
  // Questionnaire States
  const [step, setStep] = useState<1 | 2 | 3 | 4>(1);
  const [selectedStyle, setSelectedStyle] = useState('adventure');
  const [selectedDuration, setSelectedDuration] = useState('1day');
  const [selectedTransport, setSelectedTransport] = useState('buggy');

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

  // Process questionnaire answers and suggest a route
  const handleGenerateRoute = () => {
    let title = '';
    let description = '';
    let selectedDestNames: string[] = [];

    if (selectedStyle === 'adventure') {
      title = 'Rota Emoção & Dunas Móveis';
      description = 'Roteiro de aventura focado nas dunas do litoral norte, lagoas de Pitangui e passeios de buggy.';
      selectedDestNames = ['Dunas de Genipabu', 'Lagoa de Pitangui', 'Ponta Negra e Morro do Careca'];
    } else if (selectedStyle === 'relax') {
      title = 'Rota das Águas Calmas & Piscinas Naturais';
      description = 'Roteiro perfeito para relaxar nas piscinas de Maracajaú e na lagoa tranquila de Galinhos.';
      selectedDestNames = ['Parrachos de Maracajaú', 'Galinhos', 'São Miguel do Gostoso'];
    } else if (selectedStyle === 'culture') {
      title = 'Rota dos Fortes & História Potiguar';
      description = 'Caminhada cultural explorando o Forte dos Reis Magos, a Cidade Histórica de Mossoró e marcos do descobrimento.';
      selectedDestNames = ['Forte dos Reis Magos', 'Cidade Histórica de Mossoró', 'Barreira do Inferno'];
    } else {
      title = 'Rota dos Sabores Potiguares';
      description = 'Aproveite a rica culinária praiana de Ponta Negra e as falésias culinárias da Praia da Pipa.';
      selectedDestNames = ['Ponta Negra e Morro do Careca', 'Praia da Pipa', 'Praia do Madeiro'];
    }

    const matchedDestinations = destinosInfo.filter(d => selectedDestNames.includes(d.nome));
    
    // Create day-by-day itineraries based on duration selected
    const routeDays: RouteDay[] = [];
    if (selectedDuration === '1day') {
      routeDays.push({
        day: 1,
        destinations: matchedDestinations.slice(0, 2),
        description: 'Exploração dos principais pontos turísticos do destino em um roteiro bate-volta.',
      });
    } else if (selectedDuration === 'weekend') {
      routeDays.push({
        day: 1,
        destinations: [matchedDestinations[0]].filter(Boolean),
        description: 'Chegada, check-in em parceiro certificado e visitação inicial ao cartão-postal principal.',
      });
      routeDays.push({
        day: 2,
        destinations: matchedDestinations.slice(1),
        description: 'Dia de aventura guiada e retorno no final da tarde com pôr-do-sol espetacular.',
      });
    } else {
      // 1 week - 3 distinct days of schedules
      routeDays.push({
        day: 1,
        destinations: [matchedDestinations[0]].filter(Boolean),
        description: 'Dia de aclimatação, passeios curtos e relaxamento nas proximidades.',
      });
      routeDays.push({
        day: 2,
        destinations: [matchedDestinations[1]].filter(Boolean),
        description: 'Dia reservado para esportes ecológicos e mergulho livre guiado.',
      });
      routeDays.push({
        day: 3,
        destinations: matchedDestinations.slice(2),
        description: 'Tour cultural e compras de artesanato certificado no centro histórico.',
      });
    }

    const generated = {
      title,
      description,
      destinations: matchedDestinations,
      days: routeDays,
    };

    setSuggestedRoute(generated);

    // Save generated route to search/route history in local storage
    if (typeof window !== 'undefined') {
      const historyStr = localStorage.getItem('dunastech_route_history');
      const history = historyStr ? JSON.parse(historyStr) : [];
      const newHistoryItem = {
        id: `route-${Date.now()}`,
        title,
        style: selectedStyle,
        duration: selectedDuration,
        transport: selectedTransport,
        date: new Date().toLocaleDateString('pt-BR'),
        destinations: matchedDestinations.map(d => d.nome),
      };
      localStorage.setItem('dunastech_route_history', JSON.stringify([newHistoryItem, ...history].slice(0, 10)));
    }

    setStep(4);
  };

  return (
    <div className="animate-fade-in space-y-12">
      {/* ═══ Questionnaire / Route Suggestion Hero Section ═══ */}
      <section className="relative bg-gradient-to-br from-[#0A6EBD]/10 via-[var(--color-bg)] to-[var(--color-bg)] py-16 border-b border-[var(--color-border)]">
        <div className="max-w-6xl mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            
            {/* Left Header info */}
            <div className="lg:col-span-5 space-y-5">
              <Badge variant="accent" size="md">
                <Sparkles className="h-3 w-3" />
                DunasTech Roteador IA
              </Badge>
              <h1 className="text-3xl sm:text-5xl font-extrabold text-[var(--color-text)] leading-tight tracking-tight">
                Planeje Sua Rota <br />
                <span className="gradient-ocean gradient-text">Segura e Sustentável</span>
              </h1>
              <p className="text-sm sm:text-base text-[var(--color-text-secondary)] leading-relaxed">
                Responda a 3 perguntas rápidas para receber um roteiro personalizado com atrativos descritos e parceiros recomendados com selo Cadastur.
              </p>
              
              <div className="flex items-center gap-4 text-xs text-[var(--color-text-muted)] pt-2">
                <span className="flex items-center gap-1"><Shield className="h-3.5 w-3.5 text-[var(--color-success)]" /> 100% Cadastur</span>
                <span className="flex items-center gap-1"><Navigation className="h-3.5 w-3.5 text-[var(--color-primary)]" /> GPS Ativo</span>
              </div>
            </div>

            {/* Right Questionnaire wizard */}
            <div className="lg:col-span-7">
              <Card className="border-2 border-[var(--color-primary)]/10 shadow-xl overflow-hidden relative min-h-[380px] flex flex-col justify-between">
                
                {/* Step 1: Travel Style */}
                {step === 1 && (
                  <div className="space-y-4 animate-fade-in-up flex-1 flex flex-col justify-between">
                    <div>
                      <span className="text-[10px] font-bold text-[var(--color-primary)] uppercase tracking-wider">Passo 1 de 3</span>
                      <h2 className="text-lg font-bold text-[var(--color-text)] mt-1">Qual é o seu estilo preferido de viagem?</h2>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-4">
                        {styles.map(s => (
                          <button
                            key={s.id}
                            type="button"
                            onClick={() => setSelectedStyle(s.id)}
                            className={cn(
                              "p-3 rounded-xl border text-left transition-all cursor-pointer",
                              selectedStyle === s.id
                                ? "bg-[var(--color-primary-soft)] border-[var(--color-primary)] text-[var(--color-primary)] ring-2 ring-[var(--color-primary)]/20"
                                : "bg-[var(--color-surface)] border-[var(--color-border)] hover:border-[var(--color-primary)]/50"
                            )}
                          >
                            <p className="font-bold text-sm">{s.label}</p>
                            <p className="text-[10px] text-[var(--color-text-muted)] mt-1">{s.desc}</p>
                          </button>
                        ))}
                      </div>
                    </div>
                    <Button 
                      className="self-end mt-4" 
                      onClick={() => setStep(2)}
                      iconRight={ArrowRight}
                    >
                      Avançar
                    </Button>
                  </div>
                )}

                {/* Step 2: Duration */}
                {step === 2 && (
                  <div className="space-y-4 animate-fade-in-up flex-1 flex flex-col justify-between">
                    <div>
                      <span className="text-[10px] font-bold text-[var(--color-primary)] uppercase tracking-wider">Passo 2 de 3</span>
                      <h2 className="text-lg font-bold text-[var(--color-text)] mt-1">Quanto tempo você tem disponível?</h2>
                      <div className="space-y-3 mt-4">
                        {durations.map(d => (
                          <button
                            key={d.id}
                            type="button"
                            onClick={() => setSelectedDuration(d.id)}
                            className={cn(
                              "w-full p-4 rounded-xl border text-left transition-all cursor-pointer flex items-center justify-between",
                              selectedDuration === d.id
                                ? "bg-[var(--color-primary-soft)] border-[var(--color-primary)] text-[var(--color-primary)]"
                                : "bg-[var(--color-surface)] border-[var(--color-border)] hover:border-[var(--color-primary)]/50"
                            )}
                          >
                            <span className="font-bold text-sm">{d.label}</span>
                          </button>
                        ))}
                      </div>
                    </div>
                    <div className="flex justify-between mt-4">
                      <Button variant="secondary" onClick={() => setStep(1)}>Voltar</Button>
                      <Button onClick={() => setStep(3)} iconRight={ArrowRight}>Avançar</Button>
                    </div>
                  </div>
                )}

                {/* Step 3: Transport */}
                {step === 3 && (
                  <div className="space-y-4 animate-fade-in-up flex-1 flex flex-col justify-between">
                    <div>
                      <span className="text-[10px] font-bold text-[var(--color-primary)] uppercase tracking-wider">Passo 3 de 3</span>
                      <h2 className="text-lg font-bold text-[var(--color-text)] mt-1">Como você pretende se deslocar?</h2>
                      <div className="space-y-3 mt-4">
                        {transports.map(t => (
                          <button
                            key={t.id}
                            type="button"
                            onClick={() => setSelectedTransport(t.id)}
                            className={cn(
                              "w-full p-4 rounded-xl border text-left transition-all cursor-pointer flex items-center justify-between",
                              selectedTransport === t.id
                                ? "bg-[var(--color-primary-soft)] border-[var(--color-primary)] text-[var(--color-primary)]"
                                : "bg-[var(--color-surface)] border-[var(--color-border)] hover:border-[var(--color-primary)]/50"
                            )}
                          >
                            <span className="font-bold text-sm">{t.label}</span>
                          </button>
                        ))}
                      </div>
                    </div>
                    <div className="flex justify-between mt-4">
                      <Button variant="secondary" onClick={() => setStep(2)}>Voltar</Button>
                      <Button onClick={handleGenerateRoute} icon={Navigation}>Gerar Minha Rota</Button>
                    </div>
                  </div>
                )}

                {/* Step 4: Suggested Route & Map view */}
                {step === 4 && suggestedRoute && (
                  <div className="space-y-4 animate-fade-in-up flex-1 flex flex-col justify-between">
                    <div>
                      <div className="flex items-center justify-between border-b border-[var(--color-border)] pb-3">
                        <div>
                          <Badge variant="accent" size="sm">Rota Sugerida</Badge>
                          <h2 className="text-base font-extrabold text-[var(--color-text)] mt-1">{suggestedRoute.title}</h2>
                        </div>
                        <Button variant="ghost" size="sm" onClick={() => { setStep(1); setSuggestedRoute(null); }}>
                          Refazer
                        </Button>
                      </div>

                      {/* Map component */}
                      <div className="my-3 rounded-xl overflow-hidden h-44">
                        <HomeRouteMap destinations={suggestedRoute.destinations} />
                      </div>

                      <p className="text-xs text-[var(--color-text-secondary)] mt-2 leading-relaxed">
                        {suggestedRoute.description}
                      </p>

                      {/* Daily breakdowns for longer stays */}
                      <div className="mt-4 space-y-3">
                        <p className="text-[10px] uppercase font-bold text-[var(--color-text-muted)] tracking-wider">Cronograma do Roteiro</p>
                        
                        <div className="space-y-2">
                          {suggestedRoute.days.map((dayItem) => (
                            <div key={dayItem.day} className="p-3 rounded-lg bg-[var(--color-surface-alt)] border border-[var(--color-border-light)] text-xs">
                              <p className="font-bold text-[var(--color-primary)] flex items-center gap-1.5 mb-1">
                                <Calendar className="h-3.5 w-3.5" /> Dia {dayItem.day}
                              </p>
                              <p className="text-[var(--color-text-secondary)] mb-2">{dayItem.description}</p>
                              
                              <div className="flex flex-wrap gap-1.5">
                                {dayItem.destinations.map(d => (
                                  <Link key={d.nome} href={`/destino/${slugify(d.nome)}`}>
                                    <Badge variant="primary" className="cursor-pointer hover:bg-[var(--color-primary)] hover:text-white transition-colors" size="sm">
                                      📍 {d.nome}
                                    </Badge>
                                  </Link>
                                ))}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Link to satisfaction survey instead of loading the form directly */}
                      <div className="mt-4 p-3 rounded-xl bg-[var(--color-primary-soft)]/20 border border-[var(--color-primary)]/20 text-xs text-[var(--color-text-secondary)] flex items-center justify-between gap-3">
                        <div>
                          <p className="font-bold text-[var(--color-text)]">Já realizou este roteiro?</p>
                          <p className="text-[10px] text-[var(--color-text-muted)]">Faça a avaliação de satisfação e auditoria de conformidade.</p>
                        </div>
                        <Link href="/avaliar">
                          <Button size="sm">Avaliar Rota</Button>
                        </Link>
                      </div>
                    </div>
                  </div>
                )}

              </Card>
            </div>

          </div>
        </div>
      </section>

      {/* ═══ Popular Destinations (Larger Clickable Cards) ═══ */}
      <section className="max-w-7xl mx-auto px-4 py-6">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-3xl font-extrabold text-[var(--color-text)] tracking-tight">Destinos Recomendados</h2>
            <p className="text-sm text-[var(--color-text-muted)] mt-1">Classificados pela saúde do atrativo e conformidade das descrições</p>
          </div>
          <Link
            href="/ranking"
            className="hidden sm:flex items-center gap-1.5 text-sm font-semibold text-[var(--color-primary)] hover:underline"
          >
            Ver ranking completo <ArrowRight className="h-4 w-4" />
          </Link>
        </div>

        {/* Larger Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 stagger-children">
          {topDestinations.map((dest, i) => {
            const badge = getISABadge(dest.isa);
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
                          <p className="text-[9px] text-[var(--color-text-muted)] uppercase tracking-wider mt-1">Pontuação ISA</p>
                        </div>
                        <div className="h-6 w-px bg-[var(--color-border)]" />
                        <div className="text-center">
                          <p className="text-sm font-bold text-[var(--color-text)] leading-none">
                            {dest.fluxo ? (dest.fluxo.fluxo_visitantes_mes / 1000).toFixed(0) + 'k' : '—'}
                          </p>
                          <p className="text-[9px] text-[var(--color-text-muted)] uppercase tracking-wider mt-1">Fluxo/mês</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-1 text-xs font-bold text-[var(--color-text)]">
                        <Eye className="h-4 w-4 text-[var(--color-primary)]" />
                        <span>Ver Destino</span>
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
          Ver ranking completo <ArrowRight className="h-4 w-4" />
        </Link>
      </section>

      {/* ═══ All Destinations Grid ═══ */}
      <section className="max-w-7xl mx-auto px-4 pb-12">
        <h2 className="text-2xl font-bold text-[var(--color-text)] mb-6">Todos os Destinos</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
          {destinations.map((dest) => {
            const badge = getISABadge(dest.isa);
            return (
              <Link
                key={dest.nome}
                href={`/destino/${slugify(dest.nome)}`}
                className="group"
              >
                <div className="surface-card-interactive p-4 text-center flex flex-col items-center">
                  <div className="relative h-24 w-24 rounded-2xl overflow-hidden mb-3">
                    <Image
                      src={dest.imagem || '/images/destinations/hero_ponta_negra.png'}
                      alt={dest.nome}
                      fill
                      className="object-cover transition-transform duration-300 group-hover:scale-110"
                      sizes="96px"
                    />
                  </div>
                  <p className="text-xs font-bold text-[var(--color-text)] truncate max-w-full">{dest.nome}</p>
                  <div className="flex items-center justify-center gap-1 mt-1.5">
                    <span className={cn(
                      'h-1.5 w-1.5 rounded-full',
                      badge.variant === 'success' && 'bg-[var(--color-success)]',
                      badge.variant === 'warning' && 'bg-[var(--color-warning)]',
                      badge.variant === 'danger' && 'bg-[var(--color-danger)]',
                    )} />
                    <span className="text-[10px] text-[var(--color-text-muted)] font-[var(--font-mono)]">{dest.isa}</span>
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
