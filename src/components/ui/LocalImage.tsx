'use client';

import { useState } from 'react';
import Image, { type ImageProps } from 'next/image';
import { cn } from '@/lib/utils';
import { ImageIcon } from 'lucide-react';

/**
 * Gradientes decorativos para placeholders — cada nome gera uma cor diferente
 * baseada no hash simples da string, garantindo consistência visual.
 */
const gradients = [
  'from-cyan-500/70 to-blue-600/70',
  'from-emerald-500/70 to-teal-600/70',
  'from-amber-500/70 to-orange-600/70',
  'from-violet-500/70 to-purple-600/70',
  'from-rose-500/70 to-pink-600/70',
  'from-sky-500/70 to-indigo-600/70',
  'from-lime-500/70 to-green-600/70',
  'from-fuchsia-500/70 to-pink-600/70',
];

function getGradient(name: string): string {
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  return gradients[Math.abs(hash) % gradients.length];
}

interface LocalImageProps extends Omit<ImageProps, 'onError'> {
  /** Nome exibido no placeholder caso a imagem não carregue */
  fallbackLabel?: string;
  /** Classes CSS extras para o container do placeholder */
  placeholderClassName?: string;
}

/**
 * Componente de imagem com fallback elegante.
 * 
 * Quando a imagem local não existe ou falha ao carregar, exibe um placeholder
 * com gradiente e o nome da entidade — perfeito para quando as imagens reais
 * ainda não foram adicionadas à pasta.
 * 
 * Uso:
 * ```tsx
 * <LocalImage
 *   src="/images/destinos/pipa.png"
 *   alt="Praia da Pipa"
 *   fallbackLabel="Praia da Pipa"
 *   fill
 *   className="object-cover"
 * />
 * ```
 */
export function LocalImage({
  src,
  alt,
  fallbackLabel,
  placeholderClassName,
  className,
  fill,
  width,
  height,
  ...rest
}: LocalImageProps) {
  const [hasError, setHasError] = useState(false);
  const label = fallbackLabel || (typeof alt === 'string' ? alt : 'Imagem');
  const gradient = getGradient(label);

  if (hasError || !src) {
    return (
      <div
        className={cn(
          'relative flex flex-col items-center justify-center gap-2 bg-gradient-to-br',
          gradient,
          fill ? 'absolute inset-0' : '',
          placeholderClassName || className
        )}
        style={
          !fill && width && height
            ? { width: typeof width === 'number' ? `${width}px` : width, height: typeof height === 'number' ? `${height}px` : height }
            : undefined
        }
        role="img"
        aria-label={label}
      >
        <ImageIcon className="w-8 h-8 text-white/60" strokeWidth={1.5} />
        <span className="text-white/80 text-xs font-medium text-center px-3 max-w-[80%] leading-tight">
          {label}
        </span>
      </div>
    );
  }

  return (
    <Image
      src={src}
      alt={alt}
      className={className}
      fill={fill}
      width={fill ? undefined : width}
      height={fill ? undefined : height}
      onError={() => setHasError(true)}
      {...rest}
    />
  );
}
