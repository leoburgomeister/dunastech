'use client';

import { useState, useMemo } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import dynamic from 'next/dynamic';
import { useTranslations } from 'next-intl';
import { 
  MapPin, Star, Users, TrendingUp, ArrowRight, Shield, Sparkles, 
  Map, Award, Calendar, Compass, ShieldAlert, CheckCircle, Navigation, Eye,
  ChevronDown, ChevronUp, Clock, Info, Printer, Share2
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

function getISABadge(score: number, t: (key: string) => string) {
  if (score >= 80) return { label: t('ranking.healthy'), variant: 'success' as const };
  if (score >= 60) return { label: t('ranking.attention'), variant: 'warning' as const };
  return { label: t('ranking.critical'), variant: 'danger' as const };
}

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
  const t = useTranslations('planner');

  // Questionnaire Options
  const styles = useMemo(() => [
    { id: 'adventure', label: t('styles.adventure.label'), desc: t('styles.adventure.desc') },
    { id: 'relax', label: t('styles.relax.label'), desc: t('styles.relax.desc') },
    { id: 'culture', label: t('styles.culture.label'), desc: t('styles.culture.desc') },
    { id: 'gastronomy', label: t('styles.gastronomy.label'), desc: t('styles.gastronomy.desc') },
  ], [t]);

  const durations = useMemo(() => [
    { id: '1day', label: t('durations.1day.label') },
    { id: 'weekend', label: t('durations.weekend.label') },
    { id: '1week', label: t('durations.1week.label') },
  ], [t]);

  const transports = useMemo(() => [
    { id: 'buggy', label: t('transports.buggy.label') },
    { id: 'shuttle', label: t('transports.shuttle.label') },
    { id: 'hike', label: t('transports.hike.label') },
  ], [t]);

  // Questionnaire States
  const [step, setStep] = useState<1 | 2 | 3 | 4 | 5>(1);
  const [selectedStyle, setSelectedStyle] = useState('adventure');
  const [selectedDuration, setSelectedDuration] = useState('1day');
  const [selectedTransport, setSelectedTransport] = useState('buggy');
  const [expandedDay, setExpandedDay] = useState<number | null>(1);
  const [searchQuery, setSearchQuery] = useState('');

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
    let selectedDestNames: string[] = [];

    if (selectedStyle === 'adventure') {
      if (selectedTransport === 'hike') {
        selectedDestNames = ['Dunas de Genipabu', 'Lagoa de Pitangui'];
      } else if (selectedTransport === 'buggy') {
        selectedDestNames = ['Dunas de Genipabu', 'Lagoa de Pitangui', 'Parrachos de Maracajaú'];
      } else {
        selectedDestNames = ['Ponta Negra e Morro do Careca', 'Dunas de Genipabu', 'Praia da Pipa'];
      }
    } else if (selectedStyle === 'relax') {
      if (selectedTransport === 'hike') {
        selectedDestNames = ['Praia da Pipa', 'Praia do Madeiro'];
      } else if (selectedTransport === 'buggy') {
        selectedDestNames = ['Parrachos de Maracajaú', 'São Miguel do Gostoso'];
      } else {
        selectedDestNames = ['Parrachos de Maracajaú', 'Galinhos', 'São Miguel do Gostoso'];
      }
    } else if (selectedStyle === 'culture') {
      if (selectedTransport === 'hike') {
        selectedDestNames = ['Ponta Negra e Morro do Careca', 'Barreira do Inferno'];
      } else if (selectedTransport === 'buggy') {
        selectedDestNames = ['Forte dos Reis Magos', 'Dunas de Genipabu'];
      } else {
        selectedDestNames = ['Forte dos Reis Magos', 'Cidade Histórica de Mossoró', 'Lajedo de Soledade'];
      }
    } else { // gastronomy
      if (selectedTransport === 'hike') {
        selectedDestNames = ['Praia da Pipa', 'Praia do Madeiro'];
      } else if (selectedTransport === 'buggy') {
        selectedDestNames = ['Praia da Pipa', 'Barra de Cunhaú'];
      } else {
        selectedDestNames = ['Ponta Negra e Morro do Careca', 'Praia da Pipa', 'Barra de Cunhaú'];
      }
    }

    const transportKey = selectedTransport === 'buggy' ? 'buggy' : selectedTransport === 'hike' ? 'hike' : 'shuttle';
    let title = t(`routes.${selectedStyle}.${transportKey}.title`);
    const description = t(`routes.${selectedStyle}.${transportKey}.description`);

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
        title = `${title} ${t('with')} ${cleanName}`;
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
        description: t('durations.1day.description'),
      });
    } else if (selectedDuration === 'weekend') {
      routeDays.push({
        day: 1,
        destinations: [matchedDestinations[0]].filter(Boolean),
        description: t('durations.weekend.day1'),
      });
      routeDays.push({
        day: 2,
        destinations: matchedDestinations.slice(1),
        description: t('durations.weekend.day2'),
      });
    } else {
      // 1 week - 3 distinct days of schedules
      routeDays.push({
        day: 1,
        destinations: [matchedDestinations[0]].filter(Boolean),
        description: t('durations.1week.day1'),
      });
      routeDays.push({
        day: 2,
        destinations: [matchedDestinations[1]].filter(Boolean),
        description: t('durations.1week.day2'),
      });
      routeDays.push({
        day: 3,
        destinations: matchedDestinations.slice(2),
        description: t('durations.1week.day3'),
      });
    }

    const generated = {
      title,
      description,
      destinations: matchedDestinations,
      days: routeDays.filter(day => day.destinations.length > 0),
    };

    // Pre-select default attractions
    const initialExps: Record<string, boolean> = {};
    matchedDestinations.forEach(dest => {
      dest.atracoes?.forEach(act => {
        initialExps[act.id] = true;
      });
    });
    setSelectedExperiences(initialExps);

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
          
          {/* Left Column: Flat, unblurred, 100% visible active Map */}
          <div className="lg:col-span-7 relative h-[380px] lg:h-full w-full bg-[var(--color-surface-alt)] order-2 lg:order-1 border-b lg:border-b-0 lg:border-r border-[var(--color-border)]">
            <HomeRouteMap 
              destinations={mapDestinations} 
              activeDay={expandedDay} 
              isInteractive={true}
            />
          </div>

          {/* Right Column: Title + Smart Unified Form OR Generated Itinerary */}
          <div className="lg:col-span-5 flex flex-col p-6 sm:p-8 lg:p-10 overflow-y-auto max-h-full custom-scrollbar z-10 justify-between bg-[var(--color-surface)] order-1 lg:order-2">
            {(step === 1 || step === 2) ? (
              <div className="space-y-6 animate-fade-in my-auto">
                {/* Header Info */}
                <div className="space-y-2.5">
                  <Badge variant="accent" size="sm" className="px-2.5 py-0.5 text-[9px] font-bold tracking-wider uppercase">
                    <Sparkles className="h-3 w-3 animate-pulse text-[var(--color-accent)] shrink-0" />
                    {t('title')}
                  </Badge>
                  <h1 className="text-2xl sm:text-3xl lg:text-[32px] font-black text-[var(--color-text)] leading-[1.15] tracking-tight">
                    {t('heading')} <br />
                    <span className="gradient-ocean gradient-text">{t('subheading')}</span>
                  </h1>
                  <p className="text-xs text-[var(--color-text-secondary)] leading-relaxed">
                    {t('description')}
                  </p>
                </div>

                {/* Smart Form Panel */}
                {step === 1 ? (
                  /* STEP 1: Basic Route Options */
                  <div className="space-y-4">
                    {/* Smart Search Bar */}
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-bold text-[var(--color-text-muted)] uppercase tracking-wider block">
                        {t('startPointLabel')}
                      </label>
                      <div className="relative group">
                        <input
                          type="text"
                          value={searchQuery}
                          onChange={(e) => setSearchQuery(e.target.value)}
                          placeholder={t('startPointPlaceholder')}
                          className="w-full bg-[var(--color-surface-alt)] border border-[var(--color-border)] rounded-xl py-2 pl-9 pr-4 text-xs text-[var(--color-text)] placeholder-[var(--color-text-muted)] focus:outline-none focus:border-[var(--color-primary)] focus:ring-4 focus:ring-[var(--color-primary)]/10 transition-all duration-300 hover:border-[var(--color-primary)]/30"
                        />
                        <MapPin className="absolute left-3 top-2.5 h-3.5 w-3.5 text-[var(--color-text-muted)] group-focus-within:text-[var(--color-primary)] transition-colors" />
                      </div>
                    </div>

                    {/* Travel Style Selection */}
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-bold text-[var(--color-text-muted)] uppercase tracking-wider block">
                        {t('travelStyleLabel')}
                      </label>
                      <div className="grid grid-cols-2 gap-2">
                        {styles.map(s => {
                          const isActive = selectedStyle === s.id;
                          return (
                            <button
                              key={s.id}
                              type="button"
                              onClick={() => setSelectedStyle(s.id)}
                              className={cn(
                                "p-3 rounded-xl border text-left transition-all duration-200 cursor-pointer flex flex-col justify-between h-[68px] relative overflow-hidden group select-none",
                                isActive
                                  ? "bg-[var(--color-primary-soft)] border-[var(--color-primary)] text-[var(--color-primary)] shadow-sm shadow-[var(--color-primary)]/5"
                                  : "bg-[var(--color-surface-alt)]/40 border-[var(--color-border-light)] hover:border-[var(--color-primary)]/30 hover:bg-[var(--color-surface-hover)]/30"
                              )}
                            >
                              <span className="font-extrabold text-[11px] leading-tight block">{s.label}</span>
                              <span className="text-[9px] text-[var(--color-text-secondary)] line-clamp-1 block mt-0.5 leading-normal">{s.desc}</span>
                              {isActive && (
                                <div className="absolute right-2 top-2 h-1.5 w-1.5 rounded-full bg-[var(--color-primary)]" />
                              )}
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    {/* Duration Selection */}
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-bold text-[var(--color-text-muted)] uppercase tracking-wider block">
                        {t('durationLabel')}
                      </label>
                      <div className="flex bg-[var(--color-surface-alt)] p-1 rounded-xl border border-[var(--color-border-light)] gap-1">
                        {durations.map(d => {
                          const isActive = selectedDuration === d.id;
                          return (
                            <button
                              key={d.id}
                              type="button"
                              onClick={() => setSelectedDuration(d.id)}
                              className={cn(
                                "flex-1 py-1.5 text-center rounded-lg font-extrabold text-[10px] transition-all cursor-pointer truncate select-none border border-transparent",
                                isActive
                                  ? "bg-[var(--color-surface)] text-[var(--color-primary)] shadow-sm border-[var(--color-border)]/20"
                                  : "text-[var(--color-text-secondary)] hover:text-[var(--color-text)]"
                              )}
                            >
                              {d.label}
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    {/* Transport Selection */}
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-bold text-[var(--color-text-muted)] uppercase tracking-wider block">
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
                              className={cn(
                                "flex-1 py-1.5 text-center rounded-lg font-extrabold text-[10px] transition-all cursor-pointer truncate select-none border border-transparent",
                                isActive
                                  ? "bg-[var(--color-surface)] text-[var(--color-primary)] shadow-sm border-[var(--color-border)]/20"
                                  : "text-[var(--color-text-secondary)] hover:text-[var(--color-text)]"
                              )}
                            >
                              {tInfo.label}
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    {/* Proceed to Step 2 */}
                    <button
                      type="button"
                      onClick={() => setStep(2)}
                      className="w-full mt-4 py-3 bg-[var(--color-primary)] hover:bg-[var(--color-primary-hover)] text-white rounded-xl font-bold transition-all shadow-md hover:shadow-lg hover:shadow-[var(--color-primary)]/10 active:scale-[0.98] transform flex items-center justify-center gap-2 cursor-pointer text-xs"
                    >
                      <span>{t('nextStep')}</span>
                      <ArrowRight className="h-4 w-4 shrink-0" />
                    </button>
                  </div>
                ) : (
                  /* STEP 2: Advanced/Detailed Profile & Budget */
                  <div className="space-y-4 animate-fade-in">
                    {/* Traveler Profile Selection */}
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-bold text-[var(--color-text-muted)] uppercase tracking-wider block">
                        {t('groupProfileLabel')}
                      </label>
                      <div className="grid grid-cols-2 gap-2">
                        {['solo', 'couple', 'family', 'friends'].map(profileId => {
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
                                "p-3 rounded-xl border text-left transition-all duration-200 cursor-pointer flex flex-col justify-center h-[56px] relative overflow-hidden group select-none",
                                isActive
                                  ? "bg-[var(--color-primary-soft)] border-[var(--color-primary)] text-[var(--color-primary)] shadow-sm"
                                  : "bg-[var(--color-surface-alt)]/40 border-[var(--color-border-light)] hover:border-[var(--color-primary)]/30 hover:bg-[var(--color-surface-hover)]/30"
                              )}
                            >
                              <span className="font-extrabold text-[11px] leading-tight block">
                                {iconMap[profileId]} {t(`groupProfiles.${profileId}`)}
                              </span>
                              {isActive && (
                                <div className="absolute right-2 top-2 h-1.5 w-1.5 rounded-full bg-[var(--color-primary)]" />
                              )}
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    {/* Budget Selection */}
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-bold text-[var(--color-text-muted)] uppercase tracking-wider block">
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
                                "flex-1 py-1.5 text-center rounded-lg font-extrabold text-[10px] transition-all cursor-pointer truncate select-none border border-transparent",
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
                      <label className="text-[10px] font-bold text-[var(--color-text-muted)] uppercase tracking-wider block">
                        {t('stayPreferenceLabel')}
                      </label>
                      <div className="grid grid-cols-2 gap-2">
                        {['inn', 'hotel', 'hostel', 'none'].map(stayId => {
                          const isActive = selectedStayPreference === stayId;
                          return (
                            <button
                              key={stayId}
                              type="button"
                              onClick={() => setSelectedStayPreference(stayId)}
                              className={cn(
                                "p-3 rounded-xl border text-left transition-all duration-200 cursor-pointer flex flex-col justify-center h-[56px] relative overflow-hidden group select-none",
                                isActive
                                  ? "bg-[var(--color-primary-soft)] border-[var(--color-primary)] text-[var(--color-primary)] shadow-sm"
                                  : "bg-[var(--color-surface-alt)]/40 border-[var(--color-border-light)] hover:border-[var(--color-primary)]/30"
                              )}
                            >
                              <span className="font-extrabold text-[10px] leading-tight block">
                                {t(`stayPreferences.${stayId}`)}
                              </span>
                              {isActive && (
                                <div className="absolute right-2 top-2 h-1.5 w-1.5 rounded-full bg-[var(--color-primary)]" />
                              )}
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex gap-2.5 mt-4 pt-1">
                      <button
                        type="button"
                        onClick={() => setStep(1)}
                        className="flex-1 py-3 border border-[var(--color-border)] hover:bg-[var(--color-surface-hover)] rounded-xl font-bold text-xs transition-all text-[var(--color-text)] cursor-pointer"
                      >
                        {t('prevStep')}
                      </button>
                      <button
                        type="button"
                        onClick={handleGenerateRoute}
                        className="flex-[2] py-3 bg-[var(--color-primary)] hover:bg-[var(--color-primary-hover)] text-white rounded-xl font-bold transition-all shadow-md hover:shadow-lg active:scale-[0.98] flex items-center justify-center gap-2 cursor-pointer text-xs"
                      >
                        <Sparkles className="h-4 w-4 shrink-0" />
                        {t('generateButton')}
                      </button>
                    </div>
                  </div>
                )}

                {/* Footer Certifications */}
                <div className="flex items-center gap-4 text-[10px] text-[var(--color-text-muted)] justify-center pt-2">
                  <span className="flex items-center gap-1"><Shield className="h-3.5 w-3.5 text-[var(--color-success)]" /> {t('cadasturCert')}</span>
                  <span className="flex items-center gap-1"><Navigation className="h-3.5 w-3.5 text-[var(--color-primary)]" /> {t('activeGps')}</span>
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
                                const dist = getHaversineDistance(
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
                                              <div className="divide-y divide-[var(--color-border-light)]/40">
                                                {dest.atracoes.map((act) => {
                                                  const partner = cadasturData.find(c => c.id === act.parceiroId);
                                                  return (
                                                    <div key={act.id} className="p-2.5 flex gap-2.5 items-start hover:bg-[var(--color-surface-hover)]/30 transition-colors">
                                                      {act.imagem && (
                                                        <div className="relative h-11 w-15 rounded-lg overflow-hidden shrink-0 border border-[var(--color-border-light)]/60 shadow-sm">
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
                                                        <h4 className="font-extrabold text-[10px] text-[var(--color-text)] truncate">
                                                          {act.nome}
                                                        </h4>
                                                        <p className="text-[9px] text-[var(--color-text-secondary)] leading-normal">
                                                          {act.descricao}
                                                        </p>
                                                        {partner && (
                                                          <div className="flex items-center gap-1.5 pt-0.5">
                                                            <span className="inline-flex items-center gap-0.5 px-1 py-0.5 rounded text-[7px] font-bold bg-[var(--color-success)]/10 text-[var(--color-success)] border border-[var(--color-success)]/20">
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
                      <div className="mt-2 space-y-2 shrink-0">
                        <button 
                          type="button"
                          onClick={() => setStep(4)}
                          className="w-full py-3 bg-[var(--color-primary)] hover:bg-[var(--color-primary-hover)] text-white rounded-xl font-bold transition-all shadow-md hover:shadow-lg active:scale-[0.98] transform flex items-center justify-center gap-2 cursor-pointer text-xs"
                        >
                          {t('acceptAndPlan')}
                        </button>
                        <div className="flex items-center justify-between text-[9px] text-[var(--color-text-muted)] px-1">
                          <button 
                            type="button"
                            onClick={() => { setStep(1); setSuggestedRoute(null); }}
                            className="hover:underline text-[var(--color-primary)] font-bold cursor-pointer bg-transparent border-0"
                          >
                            ↺ {t('redo')}
                          </button>
                          <Link href="/avaliar" className="hover:underline text-[var(--color-text-secondary)]">
                            {t('doneThisRoute')} <span className="text-[var(--color-primary)] font-bold">{t('rateRouteButton')}</span>
                          </Link>
                        </div>
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
                                            <div className="space-y-1 pl-1">
                                              {dest.atracoes.map((act) => (
                                                <label key={act.id} className="flex items-start gap-2 p-1.5 rounded-lg hover:bg-[var(--color-surface-hover)]/30 cursor-pointer text-xs select-none">
                                                  <input 
                                                    type="checkbox" 
                                                    checked={!!selectedExperiences[act.id]} 
                                                    onChange={(e) => {
                                                      setSelectedExperiences(prev => ({ ...prev, [act.id]: e.target.checked }));
                                                    }}
                                                    className="mt-0.5 rounded border-[var(--color-border)] text-[var(--color-primary)] focus:ring-[var(--color-primary)]/20 h-3.5 w-3.5"
                                                  />
                                                  <div className="min-w-0">
                                                    <span className="font-extrabold text-[10px] text-[var(--color-text)] block leading-tight">{act.nome}</span>
                                                    <span className="text-[8.5px] text-[var(--color-text-secondary)] leading-normal block">{act.descricao}</span>
                                                  </div>
                                                </label>
                                              ))}
                                            </div>
                                          </div>
                                        )}

                                        {/* Cadastur Certified Partner Experiences Checklist */}
                                        {partnersWithExps.length > 0 && (
                                          <div className="space-y-2 pt-1 border-t border-[var(--color-border-light)]/60">
                                            <span className="text-[9px] font-bold text-[var(--color-text-muted)] uppercase tracking-wider block">
                                              Experiências Cadastur Credenciadas
                                            </span>
                                            <div className="space-y-2 pl-1">
                                              {partnersWithExps.map((partner) => (
                                                <div key={partner.id} className="space-y-1 border-l-2 border-[var(--color-primary)]/20 pl-2 ml-1">
                                                  <span className="text-[8.5px] font-bold text-[var(--color-text-secondary)] block">
                                                    🛡️ {partner.nome} ({partner.tipo})
                                                  </span>
                                                  {partner.experiencias?.map((exp, idx) => {
                                                    const expKey = `${partner.id}-exp-${idx}`;
                                                    return (
                                                      <label key={expKey} className="flex items-start gap-2 p-1 rounded hover:bg-[var(--color-surface-hover)]/35 cursor-pointer text-xs select-none">
                                                        <input 
                                                          type="checkbox" 
                                                          checked={!!selectedExperiences[expKey]} 
                                                          onChange={(e) => {
                                                            setSelectedExperiences(prev => ({ ...prev, [expKey]: e.target.checked }));
                                                          }}
                                                          className="mt-0.5 rounded border-[var(--color-border)] text-[var(--color-primary)] focus:ring-[var(--color-primary)]/20 h-3.5 w-3.5"
                                                        />
                                                        <div className="min-w-0">
                                                          <span className="font-bold text-[9.5px] text-[var(--color-text)] block leading-tight">{exp.titulo}</span>
                                                          <span className="text-[8.5px] text-[var(--color-text-muted)] leading-normal block">{exp.descricao}</span>
                                                        </div>
                                                      </label>
                                                    );
                                                  })}
                                                </div>
                                              ))}
                                            </div>
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
                      <div className="flex gap-2.5 mt-2 pt-1 border-t border-[var(--color-border-light)] shrink-0">
                        <button
                          type="button"
                          onClick={() => setStep(3)}
                          className="flex-1 py-3 border border-[var(--color-border)] hover:bg-[var(--color-surface-hover)] rounded-xl font-bold text-xs transition-all text-[var(--color-text)] cursor-pointer bg-transparent"
                        >
                          {t('prevStep')}
                        </button>
                        <button
                          type="button"
                          onClick={() => setStep(5)}
                          className="flex-[2] py-3 bg-[var(--color-primary)] hover:bg-[var(--color-primary-hover)] text-white rounded-xl font-bold transition-all shadow-md hover:shadow-lg active:scale-[0.98] flex items-center justify-center gap-2 cursor-pointer text-xs"
                        >
                          {t('generateSummaryButton')}
                        </button>
                      </div>
                    </div>
                  )}

                  {/* STEP 5: Travel Dossier / Voucher summary */}
                  {step === 5 && (
                    <div className="space-y-4 animate-fade-in h-full flex flex-col justify-between print-container">
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
                            padding: 20px;
                            background: white !important;
                            color: black !important;
                          }
                          .no-print {
                            display: none !important;
                          }
                        }
                      `}} />

                      {/* Header Ticket Ribbon */}
                      <div className="bg-[var(--color-primary-soft)] border border-[var(--color-primary)]/30 rounded-2xl p-4 shrink-0 relative overflow-hidden">
                        <div className="absolute right-3 top-3 opacity-10 font-[var(--font-mono)] text-5xl font-black select-none pointer-events-none">
                          VCHR
                        </div>
                        <div className="flex items-center justify-between">
                          <div>
                            <Badge variant="accent" size="sm" className="px-2 py-0.5 text-[8px] font-extrabold uppercase">
                              {t('travelDossier')}
                            </Badge>
                            <h2 className="text-sm sm:text-base font-black text-[var(--color-text)] mt-1">{suggestedRoute.title}</h2>
                          </div>
                        </div>
                        <div className="mt-3 flex items-center justify-between border-t border-dashed border-[var(--color-primary)]/20 pt-2.5 text-[10px]">
                          <div>
                            <span className="text-[9px] text-[var(--color-text-muted)] block uppercase font-bold tracking-wider">{t('bookingCode')}</span>
                            <strong className="font-[var(--font-mono)] text-[var(--color-primary)] text-xs">DT-2026-X79B</strong>
                          </div>
                          {startDate && (
                            <div className="text-right">
                              <span className="text-[9px] text-[var(--color-text-muted)] block uppercase font-bold tracking-wider">Período</span>
                              <strong className="text-[var(--color-text)] font-semibold">
                                {new Date(startDate + 'T00:00:00').toLocaleDateString('pt-BR')} {endDate ? `➔ ${new Date(endDate + 'T00:00:00').toLocaleDateString('pt-BR')}` : ''}
                              </strong>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Scrollable Summary details */}
                      <div className="space-y-4 flex-1 overflow-y-auto pr-1 custom-scrollbar py-2">
                        
                        {/* Resumo do Planejamento */}
                        <div className="p-3.5 rounded-xl border border-[var(--color-border-light)] bg-[var(--color-surface-alt)]/25 space-y-2.5 text-xs">
                          <h3 className="font-extrabold text-[10px] text-[var(--color-text)] uppercase tracking-wider border-b border-[var(--color-border-light)] pb-1 flex items-center gap-1">
                            📋 {t('routeSummary')}
                          </h3>
                          <div className="grid grid-cols-2 gap-2 text-[10px]">
                            <div>
                              <span className="text-[var(--color-text-muted)]">{t('groupProfile')}:</span>{' '}
                              <strong className="text-[var(--color-text)]">{t(`groupProfiles.${selectedGroupProfile}`)}</strong>
                            </div>
                            <div>
                              <span className="text-[var(--color-text-muted)]">{t('budgetLevel')}:</span>{' '}
                              <strong className="text-[var(--color-text)]">{t(`budgets.${selectedBudget}`)}</strong>
                            </div>
                            <div>
                              <span className="text-[var(--color-text-muted)]">{t('transportLabel')}:</span>{' '}
                              <strong className="text-[var(--color-text)]">{t(`transports.${selectedTransport}.label`)}</strong>
                            </div>
                            <div>
                              <span className="text-[var(--color-text-muted)]">{t('stayPreference')}:</span>{' '}
                              <strong className="text-[var(--color-text)]">{t(`stayPreferences.${selectedStayPreference}`)}</strong>
                            </div>
                          </div>

                          {travelerNames.trim() && (
                            <div className="border-t border-[var(--color-border-light)]/60 pt-2 text-[10px]">
                              <span className="text-[var(--color-text-muted)] block font-semibold">{t('travelers')}:</span>
                              <div className="flex flex-wrap gap-1.5 mt-1">
                                {travelerNames.split('\n').filter(Boolean).map((n, i) => (
                                  <span key={i} className="px-2 py-0.5 rounded bg-[var(--color-surface-alt)] text-[9px] font-semibold border border-[var(--color-border-light)]">{n}</span>
                                ))}
                              </div>
                            </div>
                          )}

                          {specialRequirements.trim() && (
                            <div className="border-t border-[var(--color-border-light)]/60 pt-2 text-[10px]">
                              <span className="text-[var(--color-text-muted)] block font-semibold">{t('specialRequirements')}:</span>
                              <p className="text-[9px] text-[var(--color-text-secondary)] italic leading-relaxed mt-0.5">{specialRequirements}</p>
                            </div>
                          )}
                        </div>

                        {/* Roteiro Final Detalhado */}
                        <div className="space-y-3">
                          <h3 className="font-extrabold text-[10px] text-[var(--color-text-muted)] uppercase tracking-wider">
                            Itinerário de Experiências
                          </h3>

                          <div className="space-y-3">
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
                                  const dist = getHaversineDistance(
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
                                <div key={dayItem.day} className="p-3 rounded-xl border border-[var(--color-border-light)] bg-[var(--color-surface)] space-y-2">
                                  <span className="text-[10px] font-black text-[var(--color-primary)]">
                                    {t('day', { day: dayItem.day })}
                                  </span>

                                  {legs.length > 0 && (
                                    <div className="bg-[var(--color-surface-alt)]/35 p-2 rounded-lg border border-[var(--color-border-light)]/45 text-[9px] text-[var(--color-text-secondary)] space-y-1">
                                      {legs.map((leg, idx) => (
                                        <div key={idx}>
                                          🚗 {leg.from} ➔ {leg.to} ({leg.distance} km • {leg.timeText})
                                        </div>
                                      ))}
                                    </div>
                                  )}

                                  <div className="space-y-2 pt-1">
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
                                        <div key={dest.nome} className="pl-2 border-l-2 border-[var(--color-primary)]/40 py-0.5 space-y-1.5">
                                          <div className="flex items-center justify-between text-[10px]">
                                            <strong className="text-[var(--color-text)]">📍 {dest.nome}</strong>
                                            <span className="text-[8px] bg-[var(--color-primary-soft)] text-[var(--color-primary)] px-1.5 py-0.5 rounded font-[var(--font-mono)] font-bold">
                                              ISA {enrichedDest.isa}
                                            </span>
                                          </div>

                                          {hasSelectedExps ? (
                                            <div className="space-y-1.5 pl-1.5 text-[9px]">
                                              {/* Local Attractions */}
                                              {selectedLocalAtts.map(act => (
                                                <div key={act.id} className="flex items-start gap-1">
                                                  <span className="text-[var(--color-success)] shrink-0">✓</span>
                                                  <div>
                                                    <strong className="text-[var(--color-text)]">{act.nome}</strong>
                                                    <span className="text-[var(--color-text-secondary)] block">{act.descricao}</span>
                                                  </div>
                                                </div>
                                              ))}

                                              {/* Partner Experiences */}
                                              {selectedPartnerExps.map((pExp, idx) => (
                                                <div key={idx} className="flex items-start gap-1 p-1 rounded bg-[var(--color-primary-soft)]/10 border border-[var(--color-primary)]/5">
                                                  <span className="text-[var(--color-primary)] shrink-0 font-bold">🛡️</span>
                                                  <div>
                                                    <strong className="text-[var(--color-text)]">{pExp.title}</strong>
                                                    <span className="text-[var(--color-text-secondary)] block">{pExp.desc}</span>
                                                    <span className="text-[7.5px] text-[var(--color-text-muted)] block mt-0.5">
                                                      Fornecido por: {pExp.partner.nome} • Tel: {pExp.partner.telefone}
                                                    </span>
                                                  </div>
                                                </div>
                                              ))}
                                            </div>
                                          ) : (
                                            <span className="text-[9px] text-[var(--color-text-muted)] italic pl-1.5 block">
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
                        <div className="p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-xs text-[var(--color-text-secondary)] flex items-start gap-3">
                          <Shield className="h-5 w-5 text-emerald-600 shrink-0 mt-0.5" />
                          <div>
                            <h4 className="font-extrabold text-[10px] text-emerald-800 uppercase tracking-wider">{t('sustainabilityShield')}</h4>
                            <p className="text-[9px] text-emerald-700/90 leading-relaxed mt-0.5">
                              {t('sustainabilityText')}
                            </p>
                          </div>
                        </div>
                      </div>

                      {/* Print/Share Actions */}
                      <div className="space-y-2 pt-2 border-t border-[var(--color-border-light)] shrink-0 no-print">
                        <div className="grid grid-cols-2 gap-2 text-xs">
                          <button
                            type="button"
                            onClick={() => window.print()}
                            className="py-2.5 bg-[var(--color-surface-alt)] hover:bg-[var(--color-surface-hover)] border border-[var(--color-border)] text-[var(--color-text)] rounded-xl font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer bg-transparent"
                          >
                            <Printer className="h-3.5 w-3.5" />
                            {t('printItinerary')}
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              const tripSummaryText = `*DunasTech - Roteiro de Viagem*\nCódigo: *DT-2026-X79B*\nPeríodo: ${startDate} a ${endDate}\nEstilo: *${suggestedRoute.title}*\nPassageiros: ${travelerNames.split('\n').join(', ')}\n\nGerado de forma sustentável e 100% regularizada no RN.`;
                              window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(tripSummaryText)}`, '_blank');
                            }}
                            className="py-2.5 bg-[#25D366] hover:bg-[#20ba59] text-white rounded-xl font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer border-0"
                          >
                            <Share2 className="h-3.5 w-3.5" />
                            {t('shareWhatsApp')}
                          </button>
                        </div>
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
                          className="w-full py-2.5 bg-[var(--color-primary-soft)] hover:bg-[var(--color-primary-soft)]/85 text-[var(--color-primary)] border border-[var(--color-primary)]/15 rounded-xl font-bold transition-all text-center cursor-pointer text-xs"
                        >
                          {t('newPlanning')}
                        </button>
                      </div>
                    </div>
                  )}
                </>
              )
            )}
          </div>

        </div>
      </section>

      {/* ═══ Popular Destinations (Larger Clickable Cards) ═══ */}
      <section className="max-w-7xl mx-auto px-4 py-6">
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
            const badge = getISABadge(dest.isa, t);
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
            const badge = getISABadge(dest.isa, t);
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
