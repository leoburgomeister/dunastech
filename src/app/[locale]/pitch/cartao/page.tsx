'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { ArrowLeft, Play, Pause, RotateCcw } from 'lucide-react';

/**
 * Cartão de palco — CONETUR, 30/07.
 *
 * Não é uma página de leitura: é um instrumento de palco, lido no celular
 * nos segundos antes de subir. A régua de tempo à esquerda marca o bloco em
 * que o apresentador *deveria* estar, para responder "estou atrasado?" sem
 * exigir conta mental. Tema escuro fixo — auditório, não navegador.
 *
 * Conteúdo espelha docs/pitch/cartao-de-palco.md (fonte da verdade).
 */

type Bloco = {
  inicio: number;
  rotulo: string;
  tela: string;
  falas: string[];
  rubricas?: { depoisDaFala: number; texto: string }[];
  batida?: number;
  descartavel?: boolean;
};

const BLOCOS: Bloco[] = [
  {
    inicio: 0,
    rotulo: 'Gancho',
    tela: 'home, mapa 3D orbitando',
    falas: [
      'Bom dia, conselheiros. É um prazer estar aqui. Eu sou o Leonardo, da DunasTech.',
      'O Rio Grande do Norte tem hoje 11 polos turísticos e 81 municípios no mapa do turismo. O estado decidiu interiorizar — e está estruturando a governança regional para isso.',
      'Toda política pública boa esbarra na mesma pergunta: como a gente prova que está funcionando?',
    ],
  },
  {
    inicio: 20,
    rotulo: 'Problema',
    tela: 'mesma tela',
    falas: [
      'Hoje, essa resposta vem por pesquisa contratada, planilha e relatório que chega meses depois. A gente decide olhando pelo retrovisor.',
      'E o dado mais importante — o que o turista viveu no atrativo — não é coletado de forma sistemática. Ninguém sabe, hoje, qual atrativo do Seridó piorou no último mês.',
    ],
  },
  {
    inicio: 50,
    rotulo: 'Solução',
    tela: 'demo: busca, depois /gestao',
    falas: [
      'A DunasTech construiu o POTI. Uma camada só, dois lados do mesmo dado.',
      'Para o turista: roteiro montado em minutos, recomendando exclusivamente quem está regular no Cadastur.',
      'Para o gestor: o mesmo dado vira observatório.',
    ],
    rubricas: [
      { depoisDaFala: 1, texto: 'digita "Pipa" na busca + Enter. O mapa voa para Pipa.' },
      { depoisDaFala: 2, texto: 'troca para a aba /gestao já aberta. Pausa 2s nos KPIs.' },
    ],
  },
  {
    inicio: 100,
    rotulo: 'Pico',
    tela: 'celular na mão',
    falas: [
      'Cada turista que avalia pontua oito dimensões: limpeza, sinalização, preservação, acessibilidade, segurança, custo-benefício, conservação e lotação. Isso vira o ISA — Índice de Saúde do Atrativo.',
      'Acabei de avaliar. O índice mudou agora. É esse o termômetro que falta: ver o atrativo adoecer antes de virar crise.',
    ],
    rubricas: [
      { depoisDaFala: 1, texto: 'no celular, /avaliar já preenchido: só toca ENVIAR. Olha para o telão.' },
    ],
  },
  {
    inicio: 140,
    rotulo: 'Prova',
    tela: 'telão',
    descartavel: true,
    falas: [
      'Isso não é maquete. Está no ar, em dunastech.com.br, com dado real do Cadastur e do IBGE, gerando roteiro para o estado inteiro. O que propomos pilotar é o painel de gestão: três polos, com acesso próprio para cada governança. É a ideia vencedora geral do Hackathon do Sol — e virou produto.',
    ],
  },
  {
    inicio: 165,
    rotulo: 'Pedido + fecho',
    tela: 'telão',
    batida: 1,
    falas: [
      'Hoje, a gente precisa de duas coisas: acesso às bases oficiais, para o projeto seguir. E o apoio de vocês, que é quem pode abrir essa porta.',
      'O Rio Grande do Norte já tem os destinos. Vamos juntos torná-los inteligentes?',
      'Obrigado.',
    ],
  },
];

const FIM = 185;

const COREOGRAFIA = [
  { onde: 'Notebook · aba 1', oque: 'dunastech.com.br — home carregada, mapa 3D já orbitando' },
  { onde: 'Notebook · aba 2', oque: 'dunastech.com.br/gestao — dashboard carregado, logado' },
  { onde: 'Celular', oque: '/avaliar — destino escolhido, 4 estrelas, 3 chips. Falta só Enviar' },
];

const REGRAS = [
  'Aba do app sempre visível — em segundo plano o navegador congela a animação do mapa.',
  'Não use o questionário de 6 passos. A busca direta faz o mesmo efeito em 5 segundos.',
  'Conte até 3 depois de cada tela carregar — os números trocam do estático para o Supabase em 1–2s.',
  'Troca de tela por abas já abertas, nunca digitando URL no palco.',
  'Avaliação positiva (4–5 estrelas). O caso negativo você narra, não demonstra.',
];

const QA = [
  {
    p: 'Como o estado contrataria isso?',
    nota: 'a resposta mais importante da manhã',
    r: 'Existe instrumento próprio — o Contrato Público para Solução Inovadora, do Marco Legal das Startups. Foi feito para o poder público testar solução inovadora sem licitação tradicional, com risco tecnológico protegido. É só a SETUR publicar o desafio.',
  },
  {
    p: 'Vocês vendem posição no ranking?',
    nota: 'a pergunta difícil',
    r: 'Patrocínio compra visibilidade, não compra nota. O ISA é calculado pela avaliação do turista e ninguém paga para subir nele. Todo destaque pago vem rotulado, e só quem está regular no Cadastur pode patrocinar.',
  },
  {
    p: 'Quanto custa?',
    r: 'O piloto se encaixa no instrumento do Marco das Startups. Depois, o painel é licenciado por polo — e a referência é o que o estado já investe: só a capacitação dos polos custou quase um milhão. O observatório dos 11 polos custa menos de dois terços disso, por ano.',
    alerta: 'Se pedirem número: R$ 4.900/mês por polo. Valor do piloto fica para a reunião técnica.',
  },
  {
    p: 'Isso não é um TripAdvisor?',
    r: 'TripAdvisor é opinião solta. O POTI cruza a avaliação do turista com base oficial — Cadastur, IBGE — e devolve inteligência de gestão para quem decide política pública. E só recomenda quem está regular: é um incentivo à formalização.',
  },
  {
    p: 'Os dados são reais?',
    r: 'Os destinos, o Cadastur, o IBGE e as avaliações são reais, no banco, em tempo real. As projeções preditivas são o próximo release — hoje entregamos o indicador e a base.',
  },
];

const BASTIDOR = [
  {
    gatilho: 'Quando alguém morder a isca',
    fala: 'Posso levar isso numa conversa técnica com a equipe da SETUR?',
    porque: 'É o pedido mais agendável do dia. Saia da sala com uma data ou um nome.',
  },
  {
    gatilho: 'Quando alguém demonstrar entusiasmo',
    fala: 'É por isso que a gente acredita que dá para fazer do Rio Grande do Norte a referência nacional em turismo inteligente.',
    porque: 'No palco soaria pretensiosa. Dita em resposta a entusiasmo, vira frase de legado.',
  },
];

const CHECKLIST = [
  {
    quando: 'Hoje',
    itens: [
      'Ligar para o Rafael Abreu e combinar a deixa',
      'Ensaiar 3× cronometrado (meta: terminar em 2:50)',
      'Testar o fluxo completo no 4G do celular',
      'Conferir login no notebook da apresentação — não limpe dados de navegação',
      'Carregar notebook e celular; levar carregador e HDMI próprio',
    ],
  },
  {
    quando: 'Amanhã, antes de sair',
    itens: [
      'Abrir as 3 telas e deixar tudo carregado',
      'Celular com 4G ativo; hotspot testado como plano B',
      'Assistente de Foco no Windows, Não Perturbe no celular',
    ],
  },
  {
    quando: 'No auditório',
    itens: [
      'Testar projeção — a home renderiza no telão?',
      'Refazer a avaliação pré-preenchida (se recarregou, os campos zeram)',
      'Combinar com o Rafael o momento exato da entrada',
      'Cronômetro pronto',
    ],
  },
];

const ABAS = [
  { id: 'roteiro', label: 'Roteiro' },
  { id: 'demo', label: 'Demo' },
  { id: 'qa', label: 'Q&A' },
  { id: 'check', label: 'Check' },
] as const;

type AbaId = (typeof ABAS)[number]['id'];

function mmss(total: number) {
  const m = Math.floor(Math.abs(total) / 60);
  const s = Math.abs(total) % 60;
  return `${m}:${String(s).padStart(2, '0')}`;
}

export default function CartaoDePalcoPage() {
  const [aba, setAba] = useState<AbaId>('roteiro');
  const [decorrido, setDecorrido] = useState(0);
  const [rodando, setRodando] = useState(false);
  const [feitos, setFeitos] = useState<Record<string, boolean>>({});
  const intervalo = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (rodando) {
      intervalo.current = setInterval(() => setDecorrido((d) => d + 1), 1000);
    }
    return () => {
      if (intervalo.current) clearInterval(intervalo.current);
    };
  }, [rodando]);

  const blocoAtual = rodando || decorrido > 0
    ? BLOCOS.reduce((atual, b, i) => (decorrido >= b.inicio ? i : atual), 0)
    : -1;

  const restante = FIM - decorrido;
  const estourou = restante < 0;

  return (
    <div className="min-h-screen bg-[#0E2325] text-[#F7F4EE] font-[family-name:var(--font-inter)] pb-24">
      {/* Cabeçalho fixo: contexto + cronômetro */}
      <header className="sticky top-0 z-30 bg-[#0E2325]/95 backdrop-blur-sm border-b border-[#0F6B6D]/40">
        <div className="mx-auto max-w-2xl px-4 py-3">
          <div className="flex items-center justify-between gap-3">
            <div className="min-w-0">
              <Link
                href="../pitch"
                className="inline-flex items-center gap-1.5 text-[11px] font-bold text-[#7E9798] hover:text-[#4CB3B6] transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#4CB3B6] rounded"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                Deck
              </Link>
              <p className="mt-0.5 font-[family-name:var(--font-poppins)] text-[11px] font-black uppercase tracking-[0.15em] text-[#4CB3B6]">
                CONETUR · 30/07 · ~09h30
              </p>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <span
                className={`font-[family-name:var(--font-jetbrains)] text-2xl font-bold tabular-nums leading-none ${
                  estourou ? 'text-[#E4572E]' : 'text-[#F7F4EE]'
                }`}
                aria-live="off"
              >
                {estourou ? '+' : ''}
                {mmss(restante)}
              </span>
              <button
                onClick={() => setRodando((r) => !r)}
                className="p-2 rounded-lg bg-[#0E3B3F] border border-[#0F6B6D]/60 text-[#4CB3B6] hover:border-[#4CB3B6] transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#4CB3B6]"
                aria-label={rodando ? 'Pausar cronômetro' : 'Iniciar cronômetro'}
              >
                {rodando ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
              </button>
              <button
                onClick={() => {
                  setRodando(false);
                  setDecorrido(0);
                }}
                className="p-2 rounded-lg bg-[#0E3B3F] border border-[#0F6B6D]/60 text-[#7E9798] hover:text-[#F7F4EE] hover:border-[#0F6B6D] transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#4CB3B6]"
                aria-label="Zerar cronômetro"
              >
                <RotateCcw className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-2xl px-4 pt-5">
        {aba === 'roteiro' && (
          <section aria-label="Roteiro falável">
            {BLOCOS.map((b, i) => {
              const ativo = i === blocoAtual;
              return (
                <article key={b.rotulo} className="flex gap-3 sm:gap-4">
                  {/* Régua de tempo */}
                  <div className="flex flex-col items-end w-11 sm:w-14 shrink-0 pt-1">
                    <span
                      className={`font-[family-name:var(--font-jetbrains)] text-[11px] tabular-nums font-bold transition-colors ${
                        ativo ? 'text-[#4CB3B6]' : 'text-[#7E9798]'
                      }`}
                    >
                      {mmss(b.inicio)}
                    </span>
                    <div
                      className={`mt-1.5 flex-1 w-px transition-colors ${
                        b.descartavel
                          ? 'border-l border-dashed border-[#D4A017]/50'
                          : ativo
                            ? 'bg-[#4CB3B6]'
                            : 'bg-[#0F6B6D]/40'
                      }`}
                      aria-hidden
                    />
                  </div>

                  {/* Bloco */}
                  <div
                    className={`flex-1 min-w-0 pb-7 transition-opacity motion-reduce:transition-none ${
                      blocoAtual >= 0 && !ativo ? 'opacity-45' : 'opacity-100'
                    }`}
                  >
                    <div className="flex flex-wrap items-baseline gap-x-2.5 gap-y-1">
                      <h2
                        className={`font-[family-name:var(--font-poppins)] text-[12px] font-black uppercase tracking-[0.18em] ${
                          ativo ? 'text-[#4CB3B6]' : 'text-[#F7F4EE]'
                        }`}
                      >
                        {b.rotulo}
                      </h2>
                      <span className="text-[10px] font-medium text-[#7E9798] italic">{b.tela}</span>
                      {b.descartavel && (
                        <span className="text-[9px] font-black uppercase tracking-wider text-[#D4A017] border border-[#D4A017]/40 rounded px-1.5 py-0.5">
                          corte se atrasar
                        </span>
                      )}
                    </div>

                    <div className="mt-2.5 space-y-2.5">
                      {b.falas.map((fala, fi) => {
                        const rubrica = b.rubricas?.find((r) => r.depoisDaFala === fi + 1);
                        const batida = b.batida === fi + 1;
                        return (
                          <div key={fi}>
                            <p className="text-[17px] sm:text-[18px] leading-[1.5] font-semibold text-[#F7F4EE]">
                              {fala}
                            </p>
                            {batida && (
                              <div className="flex items-center gap-2 my-3" aria-label="pausa de um segundo">
                                <span className="h-px w-7 bg-[#4CB3B6]/60" />
                                <span className="font-[family-name:var(--font-poppins)] text-[9px] font-black uppercase tracking-[0.2em] text-[#4CB3B6]">
                                  pausa
                                </span>
                                <span className="h-px flex-1 bg-[#4CB3B6]/20" />
                              </div>
                            )}
                            {rubrica && (
                              <p className="mt-2 text-[12.5px] leading-snug text-[#7E9798] italic">
                                → {rubrica.texto}
                              </p>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </article>
              );
            })}
          </section>
        )}

        {aba === 'demo' && (
          <section aria-label="Coreografia da demo" className="space-y-6">
            <div>
              <h2 className="font-[family-name:var(--font-poppins)] text-[12px] font-black uppercase tracking-[0.18em] text-[#4CB3B6]">
                Aberto antes de subir
              </h2>
              <ul className="mt-3 space-y-2.5">
                {COREOGRAFIA.map((c) => (
                  <li key={c.onde} className="rounded-xl bg-[#0E3B3F] border border-[#0F6B6D]/40 p-3.5">
                    <p className="font-[family-name:var(--font-jetbrains)] text-[10px] font-bold uppercase tracking-wider text-[#4CB3B6]">
                      {c.onde}
                    </p>
                    <p className="mt-1 text-[14.5px] leading-snug font-medium">{c.oque}</p>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h2 className="font-[family-name:var(--font-poppins)] text-[12px] font-black uppercase tracking-[0.18em] text-[#4CB3B6]">
                Aprendido testando
              </h2>
              <ul className="mt-3 space-y-3">
                {REGRAS.map((r) => (
                  <li key={r} className="flex gap-2.5 text-[14.5px] leading-snug">
                    <span className="text-[#0F6B6D] font-bold shrink-0" aria-hidden>
                      —
                    </span>
                    <span className="text-[#CDE6E6]">{r}</span>
                  </li>
                ))}
              </ul>
            </div>
          </section>
        )}

        {aba === 'qa' && (
          <section aria-label="Perguntas e respostas" className="space-y-6">
            <ul className="space-y-4">
              {QA.map((item) => (
                <li key={item.p} className="rounded-xl bg-[#0E3B3F] border border-[#0F6B6D]/40 p-4">
                  <div className="flex flex-wrap items-baseline gap-x-2 gap-y-1">
                    <h2 className="text-[15px] font-bold text-[#F7F4EE]">{item.p}</h2>
                    {item.nota && (
                      <span className="text-[9.5px] font-black uppercase tracking-wider text-[#4CB3B6]">
                        {item.nota}
                      </span>
                    )}
                  </div>
                  <p className="mt-2 text-[14.5px] leading-relaxed text-[#CDE6E6]">{item.r}</p>
                  {item.alerta && (
                    <p className="mt-2.5 text-[12.5px] leading-snug text-[#D4A017] border-l-2 border-[#D4A017]/50 pl-2.5">
                      {item.alerta}
                    </p>
                  )}
                </li>
              ))}
            </ul>

            <p className="text-[13px] leading-snug text-[#7E9798]">
              <span className="font-black uppercase tracking-wider text-[#F7F4EE]">Regra de ouro</span> — número que
              você não tem certeza: <span className="text-[#F7F4EE] font-semibold">&quot;trago o dado&quot;</span>. Nunca
              invente na frente do conselho.
            </p>

            <div>
              <h2 className="font-[family-name:var(--font-poppins)] text-[12px] font-black uppercase tracking-[0.18em] text-[#4CB3B6]">
                Movimentos de bastidor
              </h2>
              <ul className="mt-3 space-y-3">
                {BASTIDOR.map((b) => (
                  <li key={b.gatilho} className="border-l-2 border-[#4CB3B6]/60 pl-3.5">
                    <p className="text-[10px] font-black uppercase tracking-wider text-[#7E9798]">{b.gatilho}</p>
                    <p className="mt-1.5 text-[16px] leading-snug font-semibold text-[#F7F4EE]">
                      &quot;{b.fala}&quot;
                    </p>
                    <p className="mt-1.5 text-[12.5px] leading-snug text-[#7E9798] italic">{b.porque}</p>
                  </li>
                ))}
              </ul>
            </div>
          </section>
        )}

        {aba === 'check' && (
          <section aria-label="Checklist" className="space-y-6">
            {CHECKLIST.map((grupo) => (
              <div key={grupo.quando}>
                <h2 className="font-[family-name:var(--font-poppins)] text-[12px] font-black uppercase tracking-[0.18em] text-[#4CB3B6]">
                  {grupo.quando}
                </h2>
                <ul className="mt-3 space-y-1">
                  {grupo.itens.map((item) => {
                    const chave = `${grupo.quando}:${item}`;
                    const feito = !!feitos[chave];
                    return (
                      <li key={item}>
                        <button
                          onClick={() => setFeitos((f) => ({ ...f, [chave]: !f[chave] }))}
                          aria-pressed={feito}
                          className="w-full flex gap-3 items-start text-left py-2 rounded-lg focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#4CB3B6]"
                        >
                          <span
                            className={`mt-0.5 w-[18px] h-[18px] rounded-[5px] border-2 shrink-0 transition-colors ${
                              feito ? 'bg-[#4CB3B6] border-[#4CB3B6]' : 'border-[#0F6B6D]'
                            }`}
                            aria-hidden
                          />
                          <span
                            className={`text-[14.5px] leading-snug transition-colors ${
                              feito ? 'text-[#7E9798] line-through' : 'text-[#CDE6E6]'
                            }`}
                          >
                            {item}
                          </span>
                        </button>
                      </li>
                    );
                  })}
                </ul>
              </div>
            ))}
          </section>
        )}
      </main>

      {/* Abas na zona do polegar */}
      <nav
        className="fixed bottom-0 inset-x-0 z-30 bg-[#0E2325]/95 backdrop-blur-sm border-t border-[#0F6B6D]/40"
        aria-label="Seções do cartão"
      >
        <div className="mx-auto max-w-2xl grid grid-cols-4">
          {ABAS.map((a) => (
            <button
              key={a.id}
              onClick={() => setAba(a.id)}
              aria-current={aba === a.id ? 'page' : undefined}
              className={`py-3.5 font-[family-name:var(--font-poppins)] text-[11px] font-black uppercase tracking-[0.12em] border-t-2 transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#4CB3B6] focus-visible:-outline-offset-2 ${
                aba === a.id
                  ? 'text-[#4CB3B6] border-[#4CB3B6]'
                  : 'text-[#7E9798] border-transparent hover:text-[#CDE6E6]'
              }`}
            >
              {a.label}
            </button>
          ))}
        </div>
      </nav>
    </div>
  );
}
