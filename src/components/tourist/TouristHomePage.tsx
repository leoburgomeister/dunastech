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
  const [searchQuery, setSearchQuery] = useState('');

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

    // Smart search query injection
    let matchedQueryDest: string | null = null;
    if (searchQuery.trim() !== '') {
      const q = searchQuery.toLowerCase();
      const match = destinosInfo.find(d => 
        d.nome.toLowerCase().includes(q) || 
        d.municipio.toLowerCase().includes(q)
      );
      if (match) {
        matchedQueryDest = match.nome;
      }
    }

    if (matchedQueryDest && !selectedDestNames.includes(matchedQueryDest)) {
      if (selectedDestNames.length >= 3) {
        selectedDestNames[selectedDestNames.length - 1] = matchedQueryDest;
      } else {
        selectedDestNames.push(matchedQueryDest);
      }
      
      const cleanName = matchedQueryDest.replace(/ e .*/g, '').replace(/ e Morro.*/g, '');
      if (!title.includes(cleanName)) {
        title = `${title} com ${cleanName}`;
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
    } else if (selectedStyle === 'culture') {
      filtered = filtered.filter(d => 
        d.nome.includes('Forte') || d.nome.includes('Mossoró') || d.nome.includes('Lajedo') || d.nome.includes('Barreira') || d.nome.includes('Santa Rita')
      );
    } else if (selectedStyle === 'gastronomy') {
      filtered = filtered.filter(d => 
        d.nome.includes('Pipa') || d.nome.includes('Cunhaú') || d.nome.includes('Ponta Negra')
      );
    }

    // Fallback: if filters result in empty list, show first 4 monitored destinations so the map is not empty
    if (filtered.length === 0) {
      return destinations.filter(d => d.monitorado).slice(0, 4);
    }

    return filtered;
  }, [suggestedRoute, expandedDay, destinations, selectedStyle, searchQuery]);

  return (
    <div className="animate-fade-in space-y-12">
      {/* ═══ Smart Route Planner & Map Split-Pane Hero Section ═══ */}
      <section className="relative w-full border-b border-[var(--color-border)] bg-[var(--color-bg)] overflow-hidden">
        <div className="grid grid-cols-1 lg:grid-cols-12 min-h-[600px] lg:h-[720px] w-full">
          
          {/* Left Column: Title + Smart Unified Form OR Generated Itinerary */}
          <div className="lg:col-span-5 flex flex-col p-6 sm:p-8 lg:p-10 overflow-y-auto max-h-full custom-scrollbar z-10 justify-between bg-[var(--color-surface)]">
            {step !== 4 ? (
              <div className="space-y-6 animate-fade-in my-auto">
                {/* Header Info */}
                <div className="space-y-3">
                  <Badge variant="accent" size="sm">
                    <Sparkles className="h-3 w-3 animate-pulse" />
                    DunasTech Roteador IA
                  </Badge>
                  <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-[var(--color-text)] leading-tight tracking-tight">
                    Planeje Sua Rota <br />
                    <span className="gradient-ocean gradient-text">Segura e Sustentável</span>
                  </h1>
                  <p className="text-xs sm:text-sm text-[var(--color-text-secondary)] leading-relaxed">
                    Configure suas preferências ou busque um destino para criar um roteiro otimizado com atrativos e parceiros certificados Cadastur.
                  </p>
                </div>

                {/* Smart Form Panel */}
                <Card className="border border-[var(--color-border)]/50 shadow-md p-5 bg-[var(--color-surface)] rounded-xl space-y-4">
                  {/* Smart Search Bar */}
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-[var(--color-text-muted)] uppercase tracking-wider block">
                      📍 Buscar Destino Foco (Opcional)
                    </label>
                    <div className="relative">
                      <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="Buscar por local ou palavra-chave (ex: Pipa, dunas...)"
                        className="w-full bg-[var(--color-surface-alt)] border border-[var(--color-border)] rounded-xl py-2 pl-9 pr-4 text-xs text-[var(--color-text)] placeholder-[var(--color-text-muted)] focus:outline-none focus:border-[var(--color-primary)] focus:ring-1 focus:ring-[var(--color-primary)] transition-all"
                      />
                      <MapPin className="absolute left-3 top-2.5 h-3.5 w-3.5 text-[var(--color-text-muted)]" />
                    </div>
                  </div>

                  {/* Travel Style Selection */}
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-[var(--color-text-muted)] uppercase tracking-wider block">
                      🎭 Estilo de Viagem
                    </label>
                    <div className="grid grid-cols-2 gap-2">
                      {styles.map(s => (
                        <button
                          key={s.id}
                          type="button"
                          onClick={() => setSelectedStyle(s.id)}
                          className={cn(
                            "p-2.5 rounded-lg border text-left transition-all cursor-pointer flex flex-col justify-between h-[66px]",
                            selectedStyle === s.id
                              ? "bg-[var(--color-primary-soft)] border-[var(--color-primary)] text-[var(--color-primary)] ring-1 ring-[var(--color-primary)]/20"
                              : "bg-[var(--color-surface-alt)]/50 border-[var(--color-border-light)] hover:border-[var(--color-primary)]/30"
                          )}
                        >
                          <span className="font-bold text-[11px] leading-tight block">{s.label}</span>
                          <span className="text-[9px] text-[var(--color-text-secondary)] line-clamp-1 block mt-0.5">{s.desc}</span>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Duration Selection */}
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-[var(--color-text-muted)] uppercase tracking-wider block">
                      📅 Duração da Viagem
                    </label>
                    <div className="grid grid-cols-3 gap-2">
                      {durations.map(d => (
                        <button
                          key={d.id}
                          type="button"
                          onClick={() => setSelectedDuration(d.id)}
                          className={cn(
                            "py-2 px-1 rounded-lg border text-center transition-all cursor-pointer font-bold text-[10px] truncate",
                            selectedDuration === d.id
                              ? "bg-[var(--color-primary-soft)] border-[var(--color-primary)] text-[var(--color-primary)]"
                              : "bg-[var(--color-surface-alt)]/50 border-[var(--color-border-light)] hover:border-[var(--color-primary)]/30"
                          )}
                        >
                          {d.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Transport Selection */}
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-[var(--color-text-muted)] uppercase tracking-wider block">
                      🚗 Meio de Transporte
                    </label>
                    <div className="grid grid-cols-3 gap-2">
                      {transports.map(t => (
                        <button
                          key={t.id}
                          type="button"
                          onClick={() => setSelectedTransport(t.id)}
                          className={cn(
                            "py-2 px-1 rounded-lg border text-center transition-all cursor-pointer font-bold text-[10px] truncate",
                            selectedTransport === t.id
                              ? "bg-[var(--color-primary-soft)] border-[var(--color-primary)] text-[var(--color-primary)]"
                              : "bg-[var(--color-surface-alt)]/50 border-[var(--color-border-light)] hover:border-[var(--color-primary)]/30"
                          )}
                        >
                          {t.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Submit CTA */}
                  <Button 
                    className="w-full mt-2" 
                    onClick={handleGenerateRoute}
                    icon={Sparkles}
                  >
                    Gerar Roteiro Personalizado ✨
                  </Button>
                </Card>

                {/* Footer Certifications */}
                <div className="flex items-center gap-4 text-[10px] text-[var(--color-text-muted)] justify-center pt-2">
                  <span className="flex items-center gap-1"><Shield className="h-3.5 w-3.5 text-[var(--color-success)]" /> 100% Cadastur</span>
                  <span className="flex items-center gap-1"><Navigation className="h-3.5 w-3.5 text-[var(--color-primary)]" /> GPS Ativo</span>
                </div>
              </div>
            ) : (
              suggestedRoute && (
                <div className="space-y-4 animate-fade-in h-full flex flex-col justify-between">
                  <div className="flex items-center justify-between border-b border-[var(--color-border)] pb-2 shrink-0">
                    <div>
                      <Badge variant="accent" size="sm">Rota Sugerida</Badge>
                      <h2 className="text-base font-extrabold text-[var(--color-text)] mt-0.5 leading-snug">{suggestedRoute.title}</h2>
                    </div>
                    <Button variant="ghost" size="sm" onClick={() => { setStep(1); setSuggestedRoute(null); }}>
                      Refazer
                    </Button>
                  </div>

                  <p className="text-xs text-[var(--color-text-secondary)] leading-relaxed bg-[var(--color-surface-alt)] p-2.5 rounded-lg border border-[var(--color-border)]/40 shrink-0">
                    {suggestedRoute.description}
                  </p>

                  {/* Daily breakdown timeline */}
                  <div className="space-y-3 flex-1 overflow-y-auto pr-1 custom-scrollbar py-2">
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
                                : "bg-[var(--color-surface-alt)]/60 border-[var(--color-border-light)] hover:border-[var(--color-primary)]/40"
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
                              <div className="p-3 border-t border-[var(--color-border-light)] space-y-3 text-xs bg-[var(--color-surface)] animate-fade-in-up">
                                <p className="text-[var(--color-text-secondary)] leading-relaxed bg-[var(--color-surface-alt)]/50 p-2.5 rounded-lg border border-[var(--color-border-light)]/60">
                                  {dayItem.description}
                                </p>

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
                                  <div className="p-2 rounded-lg bg-[var(--color-primary-soft)]/20 border border-[var(--color-primary)]/20 text-[9px] text-[var(--color-text-secondary)] flex items-center gap-2">
                                    <Info className="h-3.5 w-3.5 text-[var(--color-primary)] shrink-0" />
                                    <span>Roteiro local. Não exige deslocamento rodoviário entre destinos neste dia.</span>
                                  </div>
                                )}

                                <div className="space-y-2">
                                  <p className="font-semibold text-[9px] uppercase text-[var(--color-text-muted)] tracking-wider">
                                    🚩 Programação detalhada
                                  </p>
                                  
                                  <div className="space-y-2.5">
                                    {dayItem.destinations.map((dest) => (
                                      <div key={dest.nome} className="border border-[var(--color-border-light)] rounded-lg overflow-hidden bg-[var(--color-surface)]">
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

                                        {dest.atracoes && dest.atracoes.length > 0 ? (
                                          <div className="divide-y divide-[var(--color-border-light)]/60">
                                            {dest.atracoes.map((act) => {
                                              const partner = cadasturData.find(c => c.id === act.parceiroId);
                                              return (
                                                <div key={act.id} className="p-2 flex gap-2 items-start">
                                                  {act.imagem && (
                                                    <div className="relative h-10 w-14 rounded overflow-hidden shrink-0 border border-[var(--color-border-light)]/50">
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
                                                    <p className="text-[9px] text-[var(--color-text-secondary)] leading-normal">
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
                                          <div className="p-2 text-[9px] text-[var(--color-text-muted)] italic text-center">
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

                  {/* Feedback Action Link */}
                  <div className="mt-2 p-3 rounded-xl bg-[var(--color-primary-soft)]/20 border border-[var(--color-primary)]/20 text-xs text-[var(--color-text-secondary)] flex items-center justify-between gap-3 shrink-0">
                    <div>
                      <p className="font-bold text-[var(--color-text)] text-[11px]">Já realizou este roteiro?</p>
                      <p className="text-[9px] text-[var(--color-text-muted)] leading-tight">Faça a avaliação de satisfação e auditoria de conformidade.</p>
                    </div>
                    <Link href="/avaliar">
                      <Button size="sm" className="text-[10px] px-2.5 py-1.5">Avaliar Rota</Button>
                    </Link>
                  </div>
                </div>
              )
            )}
          </div>

          {/* Right Column: Flat, unblurred, 100% visible active Map */}
          <div className="lg:col-span-7 relative h-[380px] lg:h-full w-full bg-[var(--color-surface-alt)] border-t lg:border-t-0 lg:border-l border-[var(--color-border)]">
            <HomeRouteMap 
              destinations={mapDestinations} 
              activeDay={expandedDay} 
              isInteractive={true}
            />
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

      {/* ═══ All Destinations List ═══ */}
      <section className="max-w-7xl mx-auto px-4 pb-12">
        <h2 className="text-2xl font-bold text-[var(--color-text)] mb-6">Todos os Destinos</h2>
        <div className="space-y-4">
          {destinations.map((dest) => {
            const badge = getISABadge(dest.isa);
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
                        Fluxo: <strong className="text-[var(--color-text)]">{dest.fluxo ? (dest.fluxo.fluxo_visitantes_mes / 1000).toFixed(0) + 'k' : '0'}</strong>/mês
                      </span>
                      <div className="hidden sm:block h-3 w-px bg-[var(--color-border-light)]" />
                      
                      {dest.fluxo && (
                        <>
                          <span className="flex items-center gap-1">
                            <span className={cn(
                              'h-1.5 w-1.5 rounded-full',
                              dest.fluxo.saturacao_turistica <= 50 ? 'bg-emerald-500' : dest.fluxo.saturacao_turistica <= 75 ? 'bg-amber-500' : 'bg-rose-500'
                            )} />
                            Lotação: <strong className="text-[var(--color-text)]">
                              {dest.fluxo.saturacao_turistica <= 50 ? 'Tranquilo' : dest.fluxo.saturacao_turistica <= 75 ? 'Moderado' : 'Intenso'}
                            </strong>
                          </span>
                          <div className="hidden sm:block h-3 w-px bg-[var(--color-border-light)]" />
                          <span className="flex items-center gap-1">
                            <Clock className="h-3.5 w-3.5 text-indigo-400" />
                            Melhor Horário: <strong className="text-[var(--color-text)]">
                              {dest.fluxo.saturacao_turistica <= 50 ? 'Qualquer horário' : dest.fluxo.saturacao_turistica <= 75 ? 'Fora de pico (11h-14h)' : 'Início da manhã / fim de tarde'}
                            </strong>
                          </span>
                          <div className="hidden sm:block h-3 w-px bg-[var(--color-border-light)]" />
                        </>
                      )}

                      <span className="flex items-center gap-1">
                        <Shield className="h-3.5 w-3.5 text-[var(--color-success)]" />
                        Cadastur: <strong className="text-[var(--color-text)]">{dest.partners.length}</strong> parceiros
                      </span>
                    </div>
                  </div>

                  {/* Right: ISA score ring & button */}
                  <div className="flex flex-row sm:flex-col items-center gap-3 sm:gap-2 sm:self-center flex-shrink-0 w-full sm:w-auto justify-between sm:justify-center border-t sm:border-t-0 border-[var(--color-border-light)] pt-3 sm:pt-0 mt-2 sm:mt-0">
                    <div className="flex items-center gap-2">
                      <div className="text-right">
                        <span className="text-[9px] text-[var(--color-text-muted)] uppercase tracking-wider block font-bold leading-none mb-0.5">Índice ISA</span>
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
                      <span>Ver Destino</span>
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
