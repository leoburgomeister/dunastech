'use client';

import { useState, useMemo } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import dynamic from 'next/dynamic';
import { 
  MapPin, Star, Users, TrendingUp, ArrowRight, Shield, Sparkles, 
  Map, Award, Calendar, Compass, ShieldAlert, CheckCircle, Navigation, Eye,
  ChevronDown, ChevronUp, Clock, Info
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

function getHaversineDistance(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371; // km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

export default function TouristHomePage() {
  // Questionnaire States
  const [step, setStep] = useState<1 | 2 | 3 | 4>(1);
  const [selectedStyle, setSelectedStyle] = useState('adventure');
  const [selectedDuration, setSelectedDuration] = useState('1day');
  const [selectedTransport, setSelectedTransport] = useState('buggy');
  const [expandedDay, setExpandedDay] = useState<number | null>(1);

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
      if (selectedTransport === 'hike') {
        title = 'Trilha Ecológica de Genipabu & Pitangui';
        description = 'Uma caminhada cheia de aventura cruzando as famosas dunas de Genipabu até chegar à lagoa de Pitangui.';
        selectedDestNames = ['Dunas de Genipabu', 'Lagoa de Pitangui'];
      } else if (selectedTransport === 'buggy') {
        title = 'Roteiro Buggy Litoral Norte Emoção';
        description = 'Roteiro clássico de buggy pelas dunas móveis de Genipabu, lagoa de Pitangui e mergulho nos parrachos.';
        selectedDestNames = ['Dunas de Genipabu', 'Lagoa de Pitangui', 'Parrachos de Maracajaú'];
      } else {
        title = 'Rota de Aventura Litoral Sul & Norte';
        description = 'Roteiro completo de van/translado conectando a famosa Ponta Negra, as dunas de Genipabu e as falésias de Pipa.';
        selectedDestNames = ['Ponta Negra e Morro do Careca', 'Dunas de Genipabu', 'Praia da Pipa'];
      }
    } else if (selectedStyle === 'relax') {
      if (selectedTransport === 'hike') {
        title = 'Trilha das Falésias & Praia do Madeiro';
        description = 'Caminhada relaxante à beira-mar de Pipa até a Praia do Madeiro com grande chance de avistar golfinhos.';
        selectedDestNames = ['Praia da Pipa', 'Praia do Madeiro'];
      } else if (selectedTransport === 'buggy') {
        title = 'Rota das Dunas Calmas & Litoral Norte';
        description = 'Roteiro relaxante de buggy passando pelas piscinas naturais de Maracajaú e a charmosa Gostoso.';
        selectedDestNames = ['Parrachos de Maracajaú', 'São Miguel do Gostoso'];
      } else {
        title = 'Rota das Águas Calmas & Península Isolada';
        description = 'Perfeito para relaxar nas piscinas de Maracajaú, na lagoa de Galinhos e nas praias calmas de Gostoso.';
        selectedDestNames = ['Parrachos de Maracajaú', 'Galinhos', 'São Miguel do Gostoso'];
      }
    } else if (selectedStyle === 'culture') {
      if (selectedTransport === 'hike') {
        title = 'Caminhada Histórica do Morro à Barreira';
        description = 'Explore a pé a praia de Ponta Negra e caminhe até o centro de lançamento histórico da Barreira do Inferno.';
        selectedDestNames = ['Ponta Negra e Morro do Careca', 'Barreira do Inferno'];
      } else if (selectedTransport === 'buggy') {
        title = 'Rota Histórica & Buggy Litoral Norte';
        description = 'Descubra a história do Forte dos Reis Magos e aventure-se pelas dunas de Genipabu de buggy.';
        selectedDestNames = ['Forte dos Reis Magos', 'Dunas de Genipabu'];
      } else {
        title = 'Grande Rota Histórica e Arqueológica';
        description = 'Viagem de van/translado explorando o Forte colonial em Natal, a Cidade Histórica de Mossoró e o Lajedo de Soledade.';
        selectedDestNames = ['Forte dos Reis Magos', 'Cidade Histórica de Mossoró', 'Lajedo de Soledade'];
      }
    } else { // gastronomy
      if (selectedTransport === 'hike') {
        title = 'Caminhada Gastronômica da Pipa ao Madeiro';
        description = 'Caminhe pela praia saboreando petiscos regionais, drinks tropicais e o melhor da culinária de Pipa.';
        selectedDestNames = ['Praia da Pipa', 'Praia do Madeiro'];
      } else if (selectedTransport === 'buggy') {
        title = 'Roteiro de Buggy Gastronômico Litoral Sul';
        description = 'Deguste os melhores caranguejos e frutos do mar entre as falésias de Pipa e Barra de Cunhaú.';
        selectedDestNames = ['Praia da Pipa', 'Barra de Cunhaú'];
      } else {
        title = 'Circuito dos Sabores Potiguares Litoral Sul';
        description = 'Aproveite a rica culinária praiana de Ponta Negra, Pipa e os manguezais gastronômicos de Cunhaú.';
        selectedDestNames = ['Ponta Negra e Morro do Careca', 'Praia da Pipa', 'Barra de Cunhaú'];
      }
    }

    const matchedDestinations = selectedDestNames
      .map(name => destinosInfo.find(d => d.nome === name))
      .filter(Boolean) as typeof destinosInfo;
    
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
      days: routeDays.filter(day => day.destinations.length > 0),
    };

    setSuggestedRoute(generated);
    setExpandedDay(1); // Auto-expand Day 1 on route generation

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
                      <div className="mt-4 space-y-3 animate-fade-in">
                        <p className="text-[10px] uppercase font-bold text-[var(--color-text-muted)] tracking-wider">Cronograma do Roteiro</p>
                        
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
                                const dist = getHaversineDistance(
                                  currentPrev.latitude,
                                  currentPrev.longitude,
                                  dest.latitude,
                                  dest.longitude
                                );
                                
                                // Calculate travel time
                                let speed = 60; // default shuttle
                                let transportLabel = 'van/carro';
                                if (selectedTransport === 'hike') {
                                  speed = 4.5;
                                  transportLabel = 'caminhada';
                                } else if (selectedTransport === 'buggy') {
                                  speed = 30;
                                  transportLabel = 'buggy';
                                }

                                const timeHrs = dist / speed;
                                const timeMins = Math.round(timeHrs * 60);
                                let timeText = '';
                                if (timeMins < 60) {
                                  timeText = `${timeMins} min de ${transportLabel}`;
                                } else {
                                  const hrs = Math.floor(timeMins / 60);
                                  const mins = timeMins % 60;
                                  timeText = `${hrs}h${mins > 0 ? ` ${mins}min` : ''} de ${transportLabel}`;
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
                                  "rounded-xl border transition-all overflow-hidden",
                                  isExpanded 
                                    ? "bg-[var(--color-surface)] border-[var(--color-primary)] shadow-md"
                                    : "bg-[var(--color-surface-alt)] border-[var(--color-border-light)] hover:border-[var(--color-primary)]/40"
                                )}
                              >
                                {/* Header (always visible, clickable) */}
                                <button
                                  type="button"
                                  onClick={() => setExpandedDay(isExpanded ? null : dayItem.day)}
                                  className="w-full p-3 flex items-center justify-between text-left cursor-pointer focus:outline-none"
                                >
                                  <div className="flex items-center gap-3">
                                    <div className={cn(
                                      "h-7 w-7 rounded-lg flex items-center justify-center font-bold text-xs shrink-0",
                                      isExpanded 
                                        ? "bg-[var(--color-primary)] text-white" 
                                        : "bg-[var(--color-primary-soft)] text-[var(--color-primary)]"
                                    )}>
                                      {dayItem.day}
                                    </div>
                                    <div className="min-w-0">
                                      <h3 className="font-bold text-xs text-[var(--color-text)]">
                                        Dia {dayItem.day}
                                      </h3>
                                      <p className="text-[9px] text-[var(--color-text-muted)] truncate max-w-[220px] sm:max-w-xs">
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
                                  <div className="p-3.5 border-t border-[var(--color-border-light)] space-y-3.5 text-xs animate-fade-in-up">
                                    {/* Description */}
                                    <p className="text-[var(--color-text-secondary)] leading-relaxed bg-[var(--color-surface-alt)]/50 p-3 rounded-lg border border-[var(--color-border-light)]/60">
                                      {dayItem.description}
                                    </p>

                                    {/* Legs / Travel distances */}
                                    {legs.length > 0 ? (
                                      <div className="space-y-2">
                                        <p className="font-semibold text-[9px] uppercase text-[var(--color-text-muted)] tracking-wider">
                                          🚗 Trajeto & Locomoção
                                        </p>
                                        <div className="space-y-2 pl-1">
                                          {legs.map((leg, idx) => (
                                            <div key={idx} className="flex flex-col gap-1 bg-[var(--color-surface-alt)] p-2.5 rounded-lg border border-[var(--color-border-light)]">
                                              <div className="flex items-center gap-2 text-[10px]">
                                                <Navigation className="h-3 w-3 text-[var(--color-primary)] rotate-45 shrink-0" />
                                                <span className="text-[var(--color-text-secondary)]">
                                                  De <strong className="text-[var(--color-text)]">{leg.from}</strong> para <strong className="text-[var(--color-text)]">{leg.to}</strong>
                                                </span>
                                              </div>
                                              <div className="flex items-center gap-3 text-[9px] text-[var(--color-text-muted)] pl-5">
                                                <span className="flex items-center gap-1 font-[var(--font-mono)]">
                                                  📍 {leg.distance} km
                                                </span>
                                                <span className="h-1 w-1 bg-[var(--color-border)] rounded-full" />
                                                <span className="flex items-center gap-1">
                                                  <Clock className="h-3 w-3" /> {leg.timeText}
                                                </span>
                                              </div>
                                              {leg.isTooLongForWalking && (
                                                <div className="mt-1 p-2 rounded bg-amber-500/10 border border-amber-500/20 text-[9px] text-amber-600 flex items-start gap-1.5 leading-relaxed">
                                                  <ShieldAlert className="h-3.5 w-3.5 text-amber-600 shrink-0 mt-0.5" />
                                                  <span>
                                                    <strong>Aviso de Caminhada:</strong> A distância é de {leg.distance} km, o que é muito longo para ir a pé. Considere alugar um buggy ou contratar um translado credenciado.
                                                  </span>
                                                </div>
                                              )}
                                            </div>
                                          ))}
                                        </div>
                                      </div>
                                    ) : (
                                      <div className="p-2.5 rounded-lg bg-[var(--color-primary-soft)]/20 border border-[var(--color-primary)]/20 text-[9px] text-[var(--color-text-secondary)] flex items-center gap-2">
                                        <Info className="h-3.5 w-3.5 text-[var(--color-primary)] shrink-0" />
                                        <span>Roteiro local. Não exige deslocamento rodoviário entre destinos neste dia.</span>
                                      </div>
                                    )}

                                    {/* Destinations & Attractions */}
                                    <div className="space-y-2">
                                      <p className="font-semibold text-[9px] uppercase text-[var(--color-text-muted)] tracking-wider">
                                        🚩 Programação detalhada
                                      </p>
                                      
                                      <div className="space-y-2.5">
                                        {dayItem.destinations.map((dest) => (
                                          <div key={dest.nome} className="border border-[var(--color-border-light)] rounded-lg overflow-hidden bg-[var(--color-surface)]">
                                            {/* Destination mini header */}
                                            <div className="bg-[var(--color-surface-alt)]/80 p-2 flex items-center justify-between border-b border-[var(--color-border-light)]">
                                              <span className="font-bold text-[10px] text-[var(--color-text)] flex items-center gap-1">
                                                📍 {dest.nome}
                                              </span>
                                              <Link href={`/destino/${slugify(dest.nome)}`}>
                                                <span className="text-[9px] text-[var(--color-primary)] hover:underline flex items-center gap-0.5 font-semibold">
                                                  Ver destino <ArrowRight className="h-2.5 w-2.5" />
                                                </span>
                                              </Link>
                                            </div>

                                            {/* Attractions in this destination */}
                                            {dest.atracoes && dest.atracoes.length > 0 ? (
                                              <div className="divide-y divide-[var(--color-border-light)]/60">
                                                {dest.atracoes.map((act) => {
                                                  const partner = cadasturData.find(c => c.id === act.parceiroId);
                                                  return (
                                                    <div key={act.id} className="p-2.5 flex gap-2.5 items-start">
                                                      {act.imagem && (
                                                        <div className="relative h-12 w-16 rounded overflow-hidden shrink-0 border border-[var(--color-border-light)]/50">
                                                          <Image 
                                                            src={act.imagem} 
                                                            alt={act.nome} 
                                                            fill
                                                            className="object-cover"
                                                            sizes="64px"
                                                          />
                                                        </div>
                                                      )}
                                                      <div className="space-y-0.5 flex-1 min-w-0">
                                                        <h4 className="font-bold text-[10px] text-[var(--color-text)] truncate">
                                                          {act.nome}
                                                        </h4>
                                                        <p className="text-[9px] text-[var(--color-text-secondary)] leading-relaxed">
                                                          {act.descricao}
                                                        </p>
                                                        {partner && (
                                                          <div className="flex items-center gap-1.5 pt-0.5">
                                                            <span className="inline-flex items-center gap-0.5 px-1 py-0.5 rounded text-[7px] font-semibold bg-[var(--color-success)]/10 text-[var(--color-success)] border border-[var(--color-success)]/20">
                                                              🛡️ Cadastur: {partner.nome} ({partner.tipo})
                                                            </span>
                                                          </div>
                                                        )}
                                                      </div>
                                                    </div>
                                                  );
                                                })}
                                              </div>
                                            ) : (
                                              <div className="p-3 text-[9px] text-[var(--color-text-muted)] italic text-center">
                                                Nenhuma atração específica listada. Aproveite para explorar o local livremente!
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
