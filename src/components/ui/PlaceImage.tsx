import Image from 'next/image';
import { cn } from '@/lib/utils';
import { creditoDaFoto, fotoAprovadaPara } from '@/data/photoCuration';
import { PlaceMap, type PlaceMapVariant } from './PlaceMap';

interface PlaceImageProps {
  /** Caminho da imagem candidata. Só é usada se passar na curadoria. */
  src?: string | null;
  alt: string;
  /**
   * Nome do local ao qual a imagem se refere, exatamente como em
   * mockData.ts. É o que valida a foto: uma imagem aprovada para um
   * destino não passa em outro.
   */
  local: string;
  latitude: number;
  longitude: number;
  /** Referência mostrada no mapa quando não há foto (normalmente o município). */
  mapLabel?: string;
  variant?: PlaceMapVariant;
  /**
   * Repassado ao <PlaceMap>. Desligue onde o card já tem overlay de
   * texto próprio sobre a imagem.
   */
  showMapLabel?: boolean;
  fill?: boolean;
  sizes?: string;
  priority?: boolean;
  className?: string;
}

/**
 * Exibe a foto do local quando ela passa na curadoria; caso contrário,
 * mostra o ponto no mapa.
 *
 * Toda imagem de destino, atração ou parceiro deve passar por aqui —
 * é o ponto onde a regra "nenhuma foto que não seja o lugar" é aplicada.
 * Ver `src/data/photoCuration.ts` para os vereditos e os motivos.
 *
 * Quando a foto entra, o crédito do fotógrafo é sobreposto: o acervo de
 * origem exige atribuição, e ela não pode depender de alguém lembrar.
 */
export function PlaceImage({
  src,
  alt,
  local,
  latitude,
  longitude,
  mapLabel,
  variant = 'card',
  showMapLabel,
  fill,
  sizes,
  priority,
  className,
}: PlaceImageProps) {
  if (fotoAprovadaPara(src, local, variant)) {
    const credito = creditoDaFoto(src);
    const imagem = (
      <Image
        src={src as string}
        alt={alt}
        fill={fill}
        sizes={sizes}
        priority={priority}
        className={className}
      />
    );

    // No thumb não cabe crédito legível; a atribuição fica nos tamanhos
    // em que o texto é de fato lido.
    if (!credito || variant === 'thumb') return imagem;

    return (
      <>
        {imagem}
        <span
          className={cn(
            'pointer-events-none absolute bottom-0 right-0 z-10 max-w-full truncate',
            'rounded-tl-md bg-black/45 px-1.5 py-0.5 font-medium text-white/85 backdrop-blur-[2px]',
            variant === 'hero' ? 'text-[10px]' : 'text-[9px]'
          )}
        >
          {credito}
        </span>
      </>
    );
  }

  return (
    <PlaceMap
      latitude={latitude}
      longitude={longitude}
      label={mapLabel}
      variant={variant}
      showLabel={showMapLabel}
      className={cn(fill && 'absolute inset-0')}
    />
  );
}
