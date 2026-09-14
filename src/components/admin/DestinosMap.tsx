'use client';

import { useEffect, useRef, useState } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import maplibregl from 'maplibre-gl';
import { useTheme } from 'next-themes';
import { type DestinoInfo, type Feedback, fluxoData, calcularISA } from '@/data/mockData';
import { Badge } from '@/components/ui/Badge';
import { PlaceImage } from '@/components/ui/PlaceImage';
import { Users, Activity, MapPin } from 'lucide-react';
import { slugify } from '@/lib/utils';

/** Centro geográfico do Rio Grande do Norte, em [lng, lat] (ordem do MapLibre). */
const CENTER: [number, number] = [-36.2, -5.75];

function createIsaMarkerElement(isaScore: number): HTMLElement {
  let color = '#10B981'; // Green (Healthy >= 80)
  if (isaScore < 60) color = '#EF4444'; // Red (Critical < 60)
  else if (isaScore < 80) color = '#F59E0B'; // Orange (Warning 60-79)

  const el = document.createElement('div');
  el.style.cssText = `
    background-color: ${color};
    width: 30px;
    height: 30px;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    box-shadow: 0 4px 10px rgba(0,0,0,0.4);
    border: 2px solid white;
    cursor: pointer;
  `;
  const label = document.createElement('span');
  label.style.cssText = 'font-weight: 900; font-size: 10px; color: white; font-family: monospace;';
  label.textContent = String(isaScore);
  el.appendChild(label);
  return el;
}

interface DestinosMapProps {
  destinations: DestinoInfo[];
  feedbacks?: Feedback[];
}

interface PopupCardProps {
  destino: DestinoInfo;
  isa: number;
  fluxoVisitantesMes?: number;
  saturacaoTuristica?: number;
  slug: string;
}

function PopupCard({ destino, isa, fluxoVisitantesMes, saturacaoTuristica, slug }: PopupCardProps) {
  return (
    <div className="p-2 space-y-2 min-w-56 text-[var(--color-text)]">
      <div className="relative h-20 w-full rounded-lg overflow-hidden">
        <PlaceImage
          src={destino.imagem}
          alt={destino.nome}
          local={destino.nome}
          latitude={destino.latitude}
          longitude={destino.longitude}
          variant="thumb"
          fill
          sizes="224px"
          className="object-cover"
        />
        <div className="absolute top-1.5 right-1.5">
          <Badge variant={isa >= 80 ? 'success' : isa >= 60 ? 'warning' : 'danger'} size="sm">
            ISA: {isa}
          </Badge>
        </div>
      </div>

      <div>
        <h4 className="font-extrabold text-sm leading-tight text-[var(--color-text)] m-0">{destino.nome}</h4>
        <span className="text-[10px] text-[var(--color-text-muted)] font-semibold flex items-center gap-0.5 mt-0.5">
          <MapPin className="w-3 h-3 text-[var(--color-primary)]" />
          {destino.municipio}
        </span>
      </div>

      <div className="grid grid-cols-2 gap-1.5 pt-1.5 border-t border-[var(--color-border-light)] text-[10px]">
        <div>
          <span className="text-[9px] text-[var(--color-text-muted)] uppercase block font-bold">Fluxo/Mês</span>
          <span className="font-bold flex items-center gap-0.5 mt-0.5 text-[var(--color-text)]">
            <Users className="w-3 h-3 text-[var(--color-primary)]" />
            {fluxoVisitantesMes ? (fluxoVisitantesMes / 1000).toFixed(0) + 'k' : '—'}
          </span>
        </div>
        <div>
          <span className="text-[9px] text-[var(--color-text-muted)] uppercase block font-bold">Saturação</span>
          <span className="font-bold flex items-center gap-0.5 mt-0.5 text-[var(--color-text)]">
            <Activity className="w-3 h-3 text-[var(--color-accent)]" />
            {saturacaoTuristica !== undefined ? saturacaoTuristica + '%' : '—'}
          </span>
        </div>
      </div>

      <div className="pt-1.5 text-right border-t border-[var(--color-border-light)]">
        <a
          href={`#${slug}`}
          className="inline-flex items-center gap-0.5 text-xs font-bold text-[var(--color-primary)] hover:underline cursor-pointer"
          onClick={(e) => {
            e.preventDefault();
            const el = document.getElementById(slug);
            if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
          }}
        >
          Focar Detalhes &darr;
        </a>
      </div>
    </div>
  );
}

export default function DestinosMap({ destinations, feedbacks = [] }: DestinosMapProps) {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const [mapInstance, setMapInstance] = useState<maplibregl.Map | null>(null);
  /**
   * Popup renderizado via React root separado (o MapLibre monta o conteúdo
   * fora da árvore do componente). `unmount` some com o ref antes do
   * elemento sair do DOM, então cada marcador guarda a própria raiz para
   * desmontar no cleanup — senão a próxima renderização do popup vazaria.
   */
  const markersRef = useRef<{ marker: maplibregl.Marker; root: Root }[]>([]);
  const [mounted, setMounted] = useState(false);
  const { resolvedTheme } = useTheme();

  useEffect(() => {
    setTimeout(() => {
      setMounted(true);
    }, 0);
  }, []);

  const styleUrl = resolvedTheme === 'dark'
    ? 'https://basemaps.cartocdn.com/gl/dark-matter-gl-style/style.json'
    : 'https://basemaps.cartocdn.com/gl/voyager-gl-style/style.json';

  const cleanupMarkers = () => {
    markersRef.current.forEach(({ marker, root }) => {
      try {
        marker.remove();
      } catch {
        // Mapa já destruído: o próprio marcador não precisa mais ser removido dele.
      }
      // Adiado: desmontar a raiz durante o cleanup síncrono de outro efeito
      // dispara o aviso do React de unmount no meio de uma renderização.
      setTimeout(() => root.unmount());
    });
    markersRef.current = [];
  };

  // O estilo GL do Carto é um JSON completo, não um tile que dá para trocar
  // por cima do mapa existente — troca de tema recria o mapa inteiro.
  useEffect(() => {
    const container = mapContainerRef.current;
    if (!mounted || !container) return;

    const map = new maplibregl.Map({
      container,
      style: styleUrl,
      center: CENTER,
      zoom: 8,
      scrollZoom: false,
    });

    setMapInstance(map);

    return () => {
      // Antes de derrubar o mapa: um marcador que tenta se remover de um
      // mapa já destruído estoura.
      cleanupMarkers();
      map.remove();
      setMapInstance(null);
    };
  }, [mounted, styleUrl]);

  useEffect(() => {
    const map = mapInstance;
    if (!map) return;

    cleanupMarkers();

    destinations.forEach((d) => {
      const isa = calcularISA(d.nome, feedbacks);
      const fluxo = fluxoData.find((f) => f.destino === d.nome);
      const slug = slugify(d.nome);

      const popupContainer = document.createElement('div');
      const root = createRoot(popupContainer);
      root.render(
        <PopupCard
          destino={d}
          isa={isa}
          fluxoVisitantesMes={fluxo?.fluxo_visitantes_mes}
          saturacaoTuristica={fluxo?.saturacao_turistica}
          slug={slug}
        />
      );

      const popup = new maplibregl.Popup({ offset: 25 }).setDOMContent(popupContainer);

      const marker = new maplibregl.Marker({ element: createIsaMarkerElement(isa) })
        .setLngLat([d.longitude, d.latitude])
        .setPopup(popup)
        .addTo(map);

      markersRef.current.push({ marker, root });
    });

    return cleanupMarkers;
  }, [mapInstance, destinations, feedbacks]);

  if (!mounted || destinations.length === 0) {
    return (
      <div className="w-full h-80 bg-[var(--color-surface-alt)] rounded-2xl flex items-center justify-center text-[var(--color-text-muted)] text-sm border border-[var(--color-border)]">
        Carregando mapa dos destinos...
      </div>
    );
  }

  return (
    <div className="relative w-full h-[360px] rounded-2xl overflow-hidden border border-[var(--color-border)] shadow-xl z-10">
      <div ref={mapContainerRef} className="w-full h-full" />
    </div>
  );
}
