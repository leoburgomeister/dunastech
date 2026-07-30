'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { ArrowLeft, Maximize2, Minimize2 } from 'lucide-react';
import { PotiLogo } from '@/components/ui/PotiLogo';

/**
 * Página rosto — CONETUR, 30/07.
 *
 * Slide único projetado enquanto o apresentador fala a abertura (~0:00–0:20).
 * Aos 0:20 ele troca para dunastech.com.br e a demo ao vivo assume o resto.
 *
 * Um slide só, de propósito: o orador é o conteúdo, o slide é identidade.
 * Fundo claro porque projetor lava preto — mesma escolha do deck existente.
 * Tecla F ou o botão entram em tela cheia; os controles somem na projeção.
 */

const FALA =
  'Bom dia, conselheiros. É um prazer estar aqui. Eu sou o Leonardo, da DunasTech. ' +
  'O Rio Grande do Norte tem hoje 11 polos turísticos e 81 municípios no mapa do turismo. ' +
  'O estado decidiu interiorizar — e está estruturando a governança regional para isso. ' +
  'Toda política pública boa esbarra na mesma pergunta: como a gente prova que está funcionando?';

export default function AberturaPage() {
  const [cheia, setCheia] = useState(false);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'f' || e.key === 'F') setCheia((c) => !c);
      if (e.key === 'Escape' && document.fullscreenElement) setCheia(false);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  useEffect(() => {
    if (cheia && !document.fullscreenElement) {
      document.documentElement.requestFullscreen?.().catch(() => {});
    } else if (!cheia && document.fullscreenElement) {
      document.exitFullscreen?.().catch(() => {});
    }
  }, [cheia]);

  useEffect(() => {
    const onFs = () => setCheia(!!document.fullscreenElement);
    document.addEventListener('fullscreenchange', onFs);
    return () => document.removeEventListener('fullscreenchange', onFs);
  }, []);

  return (
    <div className="h-screen w-screen overflow-hidden bg-[#F7F4EE] text-[#0E2325] font-[family-name:var(--font-inter)] flex flex-col select-none">
      {!cheia && (
        <header className="shrink-0 h-12 px-4 flex items-center justify-between border-b border-[#0E3B3F]/10">
          <Link
            href="../pitch"
            className="inline-flex items-center gap-1.5 text-[11px] font-bold text-[#7E9798] hover:text-[#0F6B6D] transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            Deck
          </Link>
          <button
            onClick={() => setCheia(true)}
            className="inline-flex items-center gap-1.5 text-[10px] font-black uppercase tracking-wider text-[#0F6B6D] hover:text-[#0E3B3F] transition-colors"
          >
            <Maximize2 className="w-3.5 h-3.5" />
            Tela cheia
            <span className="text-[#7E9798] font-bold normal-case tracking-normal">(F)</span>
          </button>
        </header>
      )}

      {/* Palco */}
      {/*
        Dimensionamento em vmin, não vw: o palco é limitado pela ALTURA, e
        projetor pode ser 1080p ou 768p. Com vw o conteúdo estoura embaixo em
        tela baixa; vmin usa a menor dimensão e o slide sempre cabe inteiro.
      */}
      <main className="flex-1 min-h-0 flex flex-col items-center justify-center px-8 py-4 text-center">
        <p className="font-[family-name:var(--font-jetbrains)] text-[clamp(0.6rem,1.5vmin,0.95rem)] font-bold uppercase tracking-[0.42em] text-[#7E9798] mb-[3vmin]">
          DunasTech
        </p>

        <PotiLogo className="h-[7vmin] w-[7vmin] min-h-10 min-w-10 mb-[3vmin]" />

        <h1 className="font-[family-name:var(--font-poppins)] text-[clamp(3.2rem,17vmin,10rem)] font-black leading-[0.85] tracking-tight text-[#0E3B3F]">
          POTI
        </h1>

        <p className="mt-[2.5vmin] text-[clamp(0.85rem,2.6vmin,1.45rem)] font-semibold text-[#0F6B6D] max-w-3xl">
          Plataforma de Observação do Turismo Inteligente
        </p>

        {/* Gancho: os dois números que abrem a fala */}
        <div className="mt-[7vmin] flex items-stretch justify-center gap-[8vmin]">
          <div>
            <p className="font-[family-name:var(--font-poppins)] text-[clamp(2.2rem,9vmin,5rem)] font-black leading-[0.9] text-[#0E3B3F]">
              11
            </p>
            <p className="mt-[1vmin] font-[family-name:var(--font-jetbrains)] text-[clamp(0.55rem,1.5vmin,0.85rem)] font-bold uppercase tracking-[0.22em] text-[#0F6B6D]">
              polos turísticos
            </p>
          </div>
          <div className="w-px bg-[#0E3B3F]/15" aria-hidden />
          <div>
            <p className="font-[family-name:var(--font-poppins)] text-[clamp(2.2rem,9vmin,5rem)] font-black leading-[0.9] text-[#0E3B3F]">
              81
            </p>
            <p className="mt-[1vmin] font-[family-name:var(--font-jetbrains)] text-[clamp(0.55rem,1.5vmin,0.85rem)] font-bold uppercase tracking-[0.22em] text-[#0F6B6D]">
              municípios
            </p>
          </div>
        </div>
      </main>

      {!cheia ? (
        <footer className="shrink-0 px-6 pb-5 pt-3 border-t border-[#0E3B3F]/10">
          <p className="font-[family-name:var(--font-jetbrains)] text-[10px] font-bold uppercase tracking-[0.18em] text-[#E4572E]">
            aos 0:20 → troque para dunastech.com.br
          </p>
          <p className="mt-2 text-[12px] leading-snug italic text-[#7E9798] max-w-4xl">{FALA}</p>
        </footer>
      ) : (
        <button
          onClick={() => setCheia(false)}
          className="fixed bottom-4 right-4 p-2 rounded-lg text-[#0E3B3F]/20 hover:text-[#0E3B3F] hover:bg-[#0E3B3F]/5 transition-colors"
          aria-label="Sair da tela cheia"
        >
          <Minimize2 className="w-4 h-4" />
        </button>
      )}
    </div>
  );
}
