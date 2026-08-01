'use client';

import { useState, useMemo, useCallback } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import dynamic from 'next/dynamic';
import {
  MapPin, Star, Lock, CheckCircle, Send,
  ArrowLeft, ArrowRight, ShieldAlert, Award, Compass, ThumbsUp, ThumbsDown
} from 'lucide-react';
import { Card, CardHeader, CardTitle } from '@/components/ui/Card';
import DestinationPhotos from './DestinationPhotos';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { PlaceImage } from '@/components/ui/PlaceImage';
import { type DestinoInfo, cadasturData, fluxoData } from '@/data/mockData';
import { useAuth } from '@/providers/AuthProvider';
import { addFeedback } from '@/lib/firebase';
import { cn } from '@/lib/utils';

// Dynamically load Map components to prevent SSR window error
const DestinationMap = dynamic(
  () => import('./DestinationMap'),
  { ssr: false }
);

const DestinationHeroMap = dynamic(
  () => import('./DestinationHeroMap'),
  { ssr: false }
);

interface DestinationDetailPageProps {
  destination: DestinoInfo;
}

export default function DestinationDetailPage({ destination }: DestinationDetailPageProps) {
  const { isAuthenticated } = useAuth();
  const pathname = usePathname();

  // Custom states for Description Conformity Audit
  const [infraMatches, setInfraMatches] = useState<string>('yes');
  const [naturalMatches, setNaturalMatches] = useState<string>('yes');
  const [servicesMatch, setServicesMatch] = useState<string>('yes');
  const [comments, setComments] = useState('');
  const [isAudited, setIsAudited] = useState(false);
  const [loading, setLoading] = useState(false);
  // A foto fica atras do mapa ate a cena carregar: sem isso o topo da pagina
  // pisca cinza enquanto os tiles chegam.
  const [heroMapReady, setHeroMapReady] = useState(false);
  const handleHeroMapReady = useCallback(() => setHeroMapReady(true), []);

  const auditQuestions: { key: string; label: string; value: string; setValue: (v: string) => void }[] = [
    { key: 'infra', label: 'Infraestrutura condiz com o anunciado?', value: infraMatches, setValue: setInfraMatches },
    { key: 'natural', label: 'Natureza está preservada como descrito?', value: naturalMatches, setValue: setNaturalMatches },
    { key: 'services', label: 'Serviços e segurança adequados?', value: servicesMatch, setValue: setServicesMatch },
  ];

  const partners = useMemo(() => {
    return cadasturData.filter(b => b.destino === destination.nome && b.regularizado);
  }, [destination]);

  const stats = useMemo(() => {
    return fluxoData.find(f => f.destino === destination.nome);
  }, [destination]);

  const capacityLimit = useMemo(() => {
    const name = destination.nome;
    if (name.includes("Ponta Negra")) return "4.500 p/dia";
    if (name.includes("Pipa")) return "2.000 p/dia";
    if (name.includes("Cajueiro")) return "1.500 p/dia";
    if (name.includes("Genipabu")) return "1.800 p/dia";
    if (name.includes("Gostoso")) return "1.000 p/dia";
    if (name.includes("Forte")) return "800 p/dia";
    if (name.includes("Maracajaú")) return "600 p/dia";
    if (name.includes("Galinhos")) return "500 p/dia";
    if (name.includes("Soledade")) return "300 p/dia";
    if (name.includes("Macau")) return "400 p/dia";
    return "700 p/dia";
  }, [destination]);

  const recommendedPermanence = useMemo(() => {
    const name = destination.nome;
    if (name.includes("Ponta Negra") || name.includes("Pipa") || name.includes("Gostoso")) return "Dia Inteiro";
    if (name.includes("Cajueiro") || name.includes("Forte") || name.includes("Soledade")) return "2 a 3 horas";
    if (name.includes("Genipabu") || name.includes("Maracajaú")) return "4 a 5 horas";
    return "Meio Dia (4h)";
  }, [destination]);

  const handleAuditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // We will save this conformity audit as a specialized feedback document
      const auditSummary = `Auditoria de Conformidade: Infraestrutura: ${infraMatches}, Natural: ${naturalMatches}, Serviços: ${servicesMatch}. Observações: ${comments}`;
      
      await addFeedback({
        destino: destination.nome,
        nota_geral: infraMatches === 'yes' && naturalMatches === 'yes' && servicesMatch === 'yes' ? 5 : 3,
        limpo: naturalMatches === 'yes',
        sinalizado: infraMatches === 'yes',
        preservado: naturalMatches === 'yes',
        acessibilidade: infraMatches === 'yes',
        seguranca: servicesMatch === 'yes',
        custo_beneficio: true,
        conservacao: infraMatches === 'yes',
        superlotado: false,
        comentario: auditSummary,
      });

      setIsAudited(true);
    } catch (err) {
      console.error('Error submitting audit:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 space-y-8 animate-fade-in-up">
      {/* Back button */}
      <div>
        {/* py + -my: cresce a area de toque de 20px para 36px sem mexer no
            espacamento visual. O link tem tamanho de texto, nao de botao. */}
        <Link
          href="/"
          className="inline-flex items-center gap-2 py-2 -my-2 text-sm text-[var(--color-text-secondary)] hover:text-[var(--color-primary)] transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          Voltar para Explorar
        </Link>
      </div>

      {/* Header Banner — cena 3D mergulhando do estado ate o destino */}
      <div className="relative h-96 sm:h-[460px] w-full rounded-3xl overflow-hidden shadow-xl bg-slate-900">
        <PlaceImage
          src={destination.imagem}
          alt={destination.nome}
          local={destination.nome}
          latitude={destination.latitude}
          longitude={destination.longitude}
          mapLabel={destination.municipio}
          variant="hero"
          showMapLabel={false}
          fill
          sizes="100vw"
          className={cn(
            'object-cover brightness-[0.85] transition-opacity duration-700',
            heroMapReady ? 'opacity-0' : 'opacity-100'
          )}
          priority
        />
        <DestinationHeroMap destination={destination} onReady={handleHeroMapReady} />
        <div className="absolute inset-0 pointer-events-none bg-gradient-to-t from-black/80 via-black/25 to-black/10" />
        <div className="absolute bottom-6 left-6 right-6 flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
          <div className="space-y-2 text-left">
            <Badge variant="accent" size="md">
              <Award className="h-3 w-3" />
              Sustentabilidade Certificada
            </Badge>
            <h1 className="text-3xl sm:text-5xl font-extrabold text-white tracking-tight">
              {destination.nome}
            </h1>
            <p className="text-sm text-white/80 flex items-center gap-1.5">
              <MapPin className="h-4 w-4 text-[var(--color-accent)]" />
              {destination.municipio}, Rio Grande do Norte
            </p>
          </div>
          {stats && (
            <div className="flex flex-wrap gap-4 bg-black/50 backdrop-blur-md p-4 rounded-2xl border border-white/10 text-white self-start sm:self-auto text-left">
              <div className="text-left min-w-[70px]">
                <p className="text-xs text-white/60 uppercase font-bold tracking-wider leading-none mb-1">Lotação</p>
                <p className="text-sm font-black flex items-center gap-1.5 leading-tight">
                  <span className={cn(
                    'h-2 w-2 rounded-full animate-pulse',
                    stats.saturacao_turistica <= 50 ? 'bg-emerald-400' : stats.saturacao_turistica <= 75 ? 'bg-amber-400' : 'bg-rose-500'
                  )} />
                  {stats.saturacao_turistica <= 50 ? 'Tranquilo' : stats.saturacao_turistica <= 75 ? 'Moderado' : 'Intenso'}
                </p>
              </div>
              
              <div className="w-px h-8 bg-white/20" />
              
              <div className="text-left min-w-[70px]">
                <p className="text-xs text-white/60 uppercase font-bold tracking-wider leading-none mb-1">Fluxo/Mês</p>
                <p className="text-sm font-black font-[var(--font-mono)] leading-tight">
                  {(stats.fluxo_visitantes_mes / 1000).toFixed(0)}k
                </p>
              </div>

              <div className="w-px h-8 bg-white/20" />

              <div className="text-left min-w-[80px]">
                <p className="text-xs text-white/60 uppercase font-bold tracking-wider leading-none mb-1">Permanência</p>
                <p className="text-xs font-bold leading-tight">
                  {recommendedPermanence}
                </p>
              </div>

              <div className="w-px h-8 bg-white/20" />

              <div className="text-left min-w-[90px]">
                <p className="text-xs text-white/60 uppercase font-bold tracking-wider leading-none mb-1">Carga Ecológica</p>
                <p className="text-xs font-bold leading-tight text-[var(--color-accent)]">
                  {capacityLimit}
                </p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Fotos do destino, logo abaixo da cena */}
      <DestinationPhotos destination={destination} />

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left 2 Columns */}
        <div className="lg:col-span-2 space-y-8">
          {/* About & Description */}
          <Card>
            <CardHeader>
              <CardTitle className="text-xl flex items-center gap-2">
                <Compass className="h-5 w-5 text-[var(--color-primary)]" />
                Sobre o Destino
              </CardTitle>
            </CardHeader>
            <p className="text-[var(--color-text-secondary)] leading-relaxed">
              {destination.descricao}
            </p>
          </Card>

          {/* Dynamic Map suggested route */}
          <Card>
            <CardHeader className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <CardTitle className="text-xl">Rota Turística Inteligente</CardTitle>
                <p className="text-xs text-[var(--color-text-muted)] mt-1">Conectando parceiros certificados e seguros com selo Cadastur</p>
              </div>
              <Badge variant="success" size="md">Seguro</Badge>
            </CardHeader>
            <DestinationMap destination={destination} />
          </Card>

          {/* Attractions */}
          <div className="space-y-4">
            <h2 className="text-2xl font-bold text-[var(--color-text)]">Principais Experiências</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {destination.atracoes.map((act) => (
                <Card key={act.id} className="overflow-hidden !p-0 flex flex-col h-full hover:shadow-lg transition-shadow">
                  <div className="relative h-44 w-full">
                    <PlaceImage
                      src={act.imagem}
                      alt={act.nome}
                      local={act.nome}
                      latitude={destination.latitude}
                      longitude={destination.longitude}
                      mapLabel={destination.municipio}
                      variant="card"
                      fill
                      className="object-cover"
                    />
                  </div>
                  <div className="p-4 flex-1 flex flex-col justify-between space-y-2">
                    <div>
                      <h3 className="font-bold text-base text-[var(--color-text)]">{act.nome}</h3>
                      <p className="text-xs text-[var(--color-text-secondary)] mt-1">{act.descricao}</p>
                    </div>
                    {act.parceiroId && (
                      <Link 
                        href={`/vitrine/${act.parceiroId}`}
                        className="text-xs font-bold text-[var(--color-primary)] hover:underline inline-flex items-center gap-1 self-start py-2.5 -my-2.5"
                      >
                        Ver Operadora <ArrowRight className="h-3 w-3" />
                      </Link>
                    )}
                  </div>
                </Card>
              ))}
            </div>
          </div>
        </div>

        {/* Sidebar right Column */}
        <div className="space-y-8">
          {/* Certified Partners */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Parceiros Cadastur</CardTitle>
              <Badge variant="success" size="sm">
                {partners.length} ativos
              </Badge>
            </CardHeader>
            <div className="space-y-3 max-h-[550px] overflow-y-auto pr-1 custom-scrollbar">
              {partners.length === 0 ? (
                <div className="text-center py-6 text-[var(--color-text-muted)] text-sm">
                  Nenhum parceiro registrado para este destino.
                </div>
              ) : (
                partners.map((partner) => (
                  <div 
                    key={partner.id} 
                    className="flex items-center gap-3 p-3 rounded-xl bg-[var(--color-surface-alt)] border border-[var(--color-border-light)] hover:border-[var(--color-primary)]/40 transition-all duration-200"
                  >
                    <div className="relative h-12 w-12 rounded-lg overflow-hidden flex-shrink-0">
                      <PlaceImage
                        src={partner.imagem}
                        alt={partner.nome}
                        local={partner.nome}
                        latitude={partner.latitude}
                        longitude={partner.longitude}
                        variant="thumb"
                        fill
                        className="object-cover"
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <h4 className="font-bold text-xs text-[var(--color-text)] truncate">{partner.nome}</h4>
                        <span className="text-[10px] text-[var(--color-accent)] font-semibold flex items-center gap-0.5">
                          <Star className="h-3 w-3 fill-current" />
                          {partner.nota}
                        </span>
                      </div>
                      <p className="text-[10px] text-[var(--color-text-muted)] uppercase mt-0.5">{partner.tipo}</p>
                      <Link 
                        href={`/vitrine/${partner.id}`}
                        className="text-[10px] font-bold text-[var(--color-primary)] hover:underline flex items-center gap-0.5 mt-1"
                      >
                        Visitar Vitrine <ArrowRight className="h-2.5 w-2.5" />
                      </Link>
                    </div>
                  </div>
                ))
              )}
            </div>
          </Card>

          {/* Description Conformity Auditing */}
          <Card className="border border-[var(--color-primary)]/20 bg-[var(--color-primary-soft)]/10">
            <CardHeader>
              <CardTitle className="text-sm flex items-center gap-2">
                <ShieldAlert className="h-4 w-4 text-[var(--color-primary)]" />
                Auditoria Pós-Visita
              </CardTitle>
            </CardHeader>

            {!isAuthenticated ? (
              <div className="space-y-3">
                <p className="text-xs text-[var(--color-text-secondary)] leading-relaxed">
                  Já visitou este local? Faça login para colaborar com o observatório de turismo auditando a conformidade deste destino.
                </p>
                <Link href={`/login?redirect=${encodeURIComponent(pathname)}`} className="block w-full">
                  <Button size="sm" variant="secondary" className="w-full justify-center" icon={Lock}>
                    Entrar para Auditar
                  </Button>
                </Link>
              </div>
            ) : isAudited ? (
              <div className="flex flex-col items-center text-center gap-2 py-2">
                <CheckCircle className="h-8 w-8 text-emerald-500" />
                <p className="text-sm font-bold text-[var(--color-text)]">Auditoria enviada!</p>
                <p className="text-xs text-[var(--color-text-secondary)]">
                  Obrigado por colaborar com o observatório de turismo.
                </p>
              </div>
            ) : (
              <form onSubmit={handleAuditSubmit} className="space-y-4">
                <p className="text-xs text-[var(--color-text-secondary)] leading-relaxed">
                  Já visitou este local? Colabore com o observatório de turismo respondendo a auditoria de conformidade pós-visita.
                </p>

                {auditQuestions.map((q) => (
                  <div key={q.key} className="space-y-1.5">
                    <p className="text-xs font-semibold text-[var(--color-text)]">{q.label}</p>
                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={() => q.setValue('yes')}
                        className={cn(
                          'flex-1 flex items-center justify-center gap-1.5 h-8 rounded-lg text-xs font-bold border transition-all cursor-pointer',
                          q.value === 'yes'
                            ? 'bg-emerald-500 border-emerald-500 text-white'
                            : 'bg-[var(--color-surface)] border-[var(--color-border)] text-[var(--color-text-secondary)] hover:border-emerald-500'
                        )}
                      >
                        <ThumbsUp className="h-3 w-3" /> Sim
                      </button>
                      <button
                        type="button"
                        onClick={() => q.setValue('no')}
                        className={cn(
                          'flex-1 flex items-center justify-center gap-1.5 h-8 rounded-lg text-xs font-bold border transition-all cursor-pointer',
                          q.value === 'no'
                            ? 'bg-rose-500 border-rose-500 text-white'
                            : 'bg-[var(--color-surface)] border-[var(--color-border)] text-[var(--color-text-secondary)] hover:border-rose-500'
                        )}
                      >
                        <ThumbsDown className="h-3 w-3" /> Não
                      </button>
                    </div>
                  </div>
                ))}

                <div className="space-y-1.5">
                  <label htmlFor="audit-comments" className="text-xs font-semibold text-[var(--color-text)]">
                    Observações (opcional)
                  </label>
                  <textarea
                    id="audit-comments"
                    value={comments}
                    onChange={(e) => setComments(e.target.value)}
                    rows={2}
                    placeholder="Conte mais sobre o que encontrou no local..."
                    className="w-full rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] p-2 text-xs text-[var(--color-text)] placeholder:text-[var(--color-text-muted)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-border-focus)] resize-none"
                  />
                </div>

                <Button type="submit" size="sm" className="w-full justify-center" icon={Send} loading={loading}>
                  Enviar Auditoria
                </Button>
              </form>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
}
