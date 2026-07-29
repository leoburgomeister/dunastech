'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { ChevronLeft, ChevronRight, X } from 'lucide-react';
import { LocalImage } from '@/components/ui/LocalImage';
import { type DestinoInfo, cadasturData } from '@/data/mockData';
import { cn } from '@/lib/utils';

/**
 * Destinos grandes chegam a 45 parceiros regularizados. Sem teto, a galeria
 * vira a lista do Cadastur — que ja esta na coluna da direita. Entram so os
 * mais bem avaliados, como complemento das fotos do proprio lugar.
 */
const MAX_PARTNER_PHOTOS = 4;

interface Photo {
  src: string;
  title: string;
  caption: string;
}

interface DestinationPhotosProps {
  destination: DestinoInfo;
}

export default function DestinationPhotos({ destination }: DestinationPhotosProps) {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const photos = useMemo<Photo[]>(() => {
    // A foto do destino abre a galeria: ela era o banner da pagina antes do
    // mapa assumir o topo, e continua sendo a imagem que representa o lugar.
    const lead: Photo = {
      src: destination.imagem,
      title: destination.nome,
      caption: `${destination.municipio}, Rio Grande do Norte`,
    };

    const attractions = destination.atracoes.map((a) => ({
      src: a.imagem,
      title: a.nome,
      caption: a.descricao,
    }));

    const partners = cadasturData
      .filter((b) => b.destino === destination.nome && b.regularizado)
      .sort((a, b) => b.nota - a.nota)
      .slice(0, MAX_PARTNER_PHOTOS)
      .map((b) => ({
        src: b.imagem,
        title: b.nome,
        caption: `${b.tipo} regularizada no Cadastur`,
      }));

    return [lead, ...attractions, ...partners].filter((p) => Boolean(p.src));
  }, [destination]);

  const close = useCallback(() => setOpenIndex(null), []);

  const step = useCallback(
    (delta: number) =>
      setOpenIndex((current) =>
        current === null ? current : (current + delta + photos.length) % photos.length
      ),
    [photos.length]
  );

  useEffect(() => {
    if (openIndex === null) return;

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') close();
      if (e.key === 'ArrowRight') step(1);
      if (e.key === 'ArrowLeft') step(-1);
    };

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    document.addEventListener('keydown', onKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener('keydown', onKeyDown);
    };
  }, [openIndex, close, step]);

  if (photos.length === 0) return null;

  const active = openIndex === null ? null : photos[openIndex];

  return (
    <section aria-labelledby="destination-photos" className="space-y-4">
      <div className="flex items-end justify-between gap-4">
        <div>
          <h2 id="destination-photos" className="text-2xl font-bold text-[var(--color-text)] tracking-tight">
            Galeria de Fotos
          </h2>
          <p className="text-sm text-[var(--color-text-muted)] mt-1">
            O destino, suas experiências e os parceiros que operam por lá.
          </p>
        </div>
        <span className="hidden sm:inline-flex shrink-0 items-center rounded-full border border-[var(--color-border)] px-3 py-1 text-[11px] font-bold uppercase tracking-wider text-[var(--color-text-muted)]">
          {photos.length} {photos.length === 1 ? 'foto' : 'fotos'}
        </span>
      </div>

      {/* A primeira foto ocupa 2x2 e as demais preenchem a coluna ao lado:
          com 1 atracao + 1 parceiro — o caso comum — o mosaico fecha exato. */}
      <div className="grid grid-cols-2 sm:grid-cols-3 auto-rows-[150px] sm:auto-rows-[170px] gap-3">
        {photos.map((photo, index) => {
          const isLead = index === 0;
          return (
            <button
              key={`${photo.src}-${index}`}
              type="button"
              onClick={() => setOpenIndex(index)}
              aria-label={`Abrir foto: ${photo.title}`}
              className={cn(
                'group relative overflow-hidden rounded-2xl border border-[var(--color-border-light)]',
                'cursor-pointer text-left focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-border-focus)]',
                isLead && 'col-span-2 row-span-2'
              )}
            >
              <LocalImage
                src={photo.src}
                alt={photo.title}
                fallbackLabel={photo.title}
                fill
                sizes={isLead ? '(max-width: 640px) 100vw, 60vw' : '(max-width: 640px) 50vw, 30vw'}
                className="object-cover transition-transform duration-500 ease-out group-hover:scale-[1.06]"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/10 to-transparent" />
              <div className={cn('absolute inset-x-0 bottom-0 p-3', isLead && 'p-4')}>
                <h3
                  className={cn(
                    'font-bold text-white leading-tight truncate',
                    isLead ? 'text-lg' : 'text-xs'
                  )}
                >
                  {photo.title}
                </h3>
                {isLead && (
                  <p className="text-xs text-white/75 mt-0.5 truncate">{photo.caption}</p>
                )}
              </div>
            </button>
          );
        })}
      </div>

      {active && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label={active.title}
          className="fixed inset-0 z-[2000] flex flex-col items-center justify-center bg-black/90 p-4 sm:p-8 animate-fade-in"
          onClick={close}
        >
          <button
            type="button"
            onClick={close}
            aria-label="Fechar galeria"
            className="absolute top-4 right-4 rounded-full bg-white/10 p-2 text-white hover:bg-white/20 transition-colors cursor-pointer"
          >
            <X className="h-5 w-5" />
          </button>

          {photos.length > 1 && (
            <>
              <button
                type="button"
                onClick={(e) => { e.stopPropagation(); step(-1); }}
                aria-label="Foto anterior"
                className="absolute left-3 sm:left-6 rounded-full bg-white/10 p-2.5 text-white hover:bg-white/20 transition-colors cursor-pointer"
              >
                <ChevronLeft className="h-5 w-5" />
              </button>
              <button
                type="button"
                onClick={(e) => { e.stopPropagation(); step(1); }}
                aria-label="Próxima foto"
                className="absolute right-3 sm:right-6 rounded-full bg-white/10 p-2.5 text-white hover:bg-white/20 transition-colors cursor-pointer"
              >
                <ChevronRight className="h-5 w-5" />
              </button>
            </>
          )}

          <div
            className="relative w-full max-w-4xl aspect-[16/10] rounded-2xl overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <LocalImage
              src={active.src}
              alt={active.title}
              fallbackLabel={active.title}
              fill
              sizes="100vw"
              className="object-contain"
            />
          </div>

          <div className="mt-4 max-w-4xl w-full text-center" onClick={(e) => e.stopPropagation()}>
            <h3 className="text-base font-bold text-white">{active.title}</h3>
            <p className="text-xs text-white/70 mt-1">{active.caption}</p>
            <p className="text-[11px] text-white/40 mt-2 font-mono">
              {(openIndex ?? 0) + 1} / {photos.length}
            </p>
          </div>
        </div>
      )}
    </section>
  );
}
