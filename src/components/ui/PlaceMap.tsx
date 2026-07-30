import { MapPin } from 'lucide-react';
import { cn } from '@/lib/utils';
import { RN_OUTLINE_PATH, RN_VIEWBOX, projectToOutline } from '@/data/rnOutline';

export type PlaceMapVariant = 'thumb' | 'card' | 'hero';

interface PlaceMapProps {
  latitude: number;
  longitude: number;
  /** Município ou referência exibida junto ao mapa. Ignorado no variant thumb. */
  label?: string;
  /** Ajusta densidade de informação conforme o espaço disponível. */
  variant?: PlaceMapVariant;
  /**
   * Mostra o rodapé "Sem foto verificada" com município e coordenadas.
   * Desligue onde o card já tem overlay de texto próprio, para o mapa
   * não competir com ele. Por padrão sai em tudo menos no thumb.
   */
  showLabel?: boolean;
  className?: string;
}

/** Malha de fundo — dá textura sem competir com o contorno. */
function Grid({ fina }: { fina: boolean }) {
  return (
    <div
      aria-hidden
      className="absolute inset-0 opacity-50"
      style={{
        backgroundImage:
          'linear-gradient(to right, var(--color-border-light) 1px, transparent 1px), linear-gradient(to bottom, var(--color-border-light) 1px, transparent 1px)',
        backgroundSize: fina ? '10px 10px' : '28px 28px',
      }}
    />
  );
}

/**
 * Marcador de localização exibido no lugar da foto.
 *
 * Entra sempre que não existe imagem aprovada na curadoria para aquele
 * local e aquele tamanho (ver `src/data/photoCuration.ts`).
 *
 * Desenhado como SVG a partir do contorno pré-projetado em
 * `src/data/rnOutline.ts`: nenhuma requisição de rede, nenhum tile
 * externo, funciona offline. O pitch não pode depender de conexão.
 *
 * No variant `thumb` o contorno do estado é trocado por um pin simples —
 * a 48px a silhueta fica ilegível, igual em todos os pontos, e ainda
 * pesaria um SVG de ~2,8 KB por miniatura.
 */
export function PlaceMap({
  latitude,
  longitude,
  label,
  variant = 'card',
  showLabel,
  className,
}: PlaceMapProps) {
  const isThumb = variant === 'thumb';
  const isHero = variant === 'hero';
  const comRodape = showLabel ?? !isThumb;

  const ariaLabel = label
    ? `Localização no mapa do Rio Grande do Norte: ${label}`
    : 'Localização no mapa do Rio Grande do Norte';

  const base = cn(
    'relative flex h-full w-full items-center justify-center overflow-hidden',
    'bg-[var(--color-surface-alt)]',
    className
  );

  if (isThumb) {
    return (
      <div className={base} role="img" aria-label={ariaLabel}>
        <Grid fina />
        <MapPin
          className="relative h-1/2 w-1/2 text-[var(--color-accent)]"
          strokeWidth={2.25}
          aria-hidden
        />
      </div>
    );
  }

  const { x, y } = projectToOutline(longitude, latitude);

  return (
    <div className={base} role="img" aria-label={ariaLabel}>
      <Grid fina={false} />

      <svg
        viewBox={`0 0 ${RN_VIEWBOX.width} ${RN_VIEWBOX.height}`}
        // h-full + meet garante que o contorno caiba sem estourar o
        // container, seja num card de 176px ou num hero de 384px.
        className={cn('relative h-full w-full p-5', isHero && 'max-w-2xl')}
        preserveAspectRatio="xMidYMid meet"
      >
        <path
          d={RN_OUTLINE_PATH}
          className="fill-[var(--color-primary)]/10 stroke-[var(--color-primary)]/45"
          strokeWidth={3}
          strokeLinejoin="round"
        />

        {/* Halo, anel e ponto do local */}
        <circle cx={x} cy={y} r={29} className="fill-[var(--color-accent)]/20" />
        <circle
          cx={x}
          cy={y}
          r={19}
          className="fill-none stroke-[var(--color-accent)]/60"
          strokeWidth={2.5}
        />
        <circle cx={x} cy={y} r={12} className="fill-[var(--color-accent)]" />
      </svg>

      {comRodape && (
        <div className="absolute inset-x-0 bottom-0 flex flex-col gap-0.5 bg-gradient-to-t from-[var(--color-surface)] via-[var(--color-surface)]/85 to-transparent px-4 pb-3 pt-8 text-left">
          <span
            className={cn(
              'font-semibold uppercase tracking-wider text-[var(--color-text-muted)]',
              isHero ? 'text-[11px]' : 'text-[9px]'
            )}
          >
            Sem foto verificada
          </span>
          {label && (
            <span
              className={cn(
                'font-bold leading-tight text-[var(--color-text)]',
                isHero ? 'text-base' : 'text-xs'
              )}
            >
              {label}
            </span>
          )}
          <span
            className={cn(
              'font-[var(--font-mono)] text-[var(--color-text-secondary)]',
              isHero ? 'text-xs' : 'text-[10px]'
            )}
          >
            {latitude.toFixed(4)}, {longitude.toFixed(4)}
          </span>
        </div>
      )}
    </div>
  );
}
