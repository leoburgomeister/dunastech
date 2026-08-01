/**
 * Combinacoes de roteiro que a home pode gerar: 6 estilos x 3 transportes.
 *
 * Vive num modulo proprio porque duas coisas dependem dela — o gerador de
 * roteiro na home e o script que pre-cacheia as rotas do OSRM. Duplicar a
 * tabela faria o cache envelhecer em silencio na primeira vez que alguem
 * trocasse um destino.
 */

export const TRAVEL_STYLES = [
  'adventure',
  'relax',
  'culture',
  'ecotourism',
  'family',
  'gastronomy',
] as const;

export const TRANSPORTS = ['buggy', 'shuttle', 'hike'] as const;

export type TravelStyle = (typeof TRAVEL_STYLES)[number];
export type Transport = (typeof TRANSPORTS)[number];

type Tabela = Record<TravelStyle, Record<Transport, string[]>>;

// Trecho de preset e o unico caminho por onde ainda entrava dia impossivel: a
// assinatura nao passa pela barreira de distancia, de proposito. Tres pediam o que o
// transporte nao faz num dia -- Ponta Negra -> Pipa a pe (39,7 km), Pitangui ->
// Maracajau a pe (27,6 km) e Maracajau -> Galinhos de buggy (112,6 km). Os
// substitutos ficam em 6,8 / 7,8 / 48,5 km.
//
// ecoturismo/caminhada repete a dupla de aventura/caminhada: dentro dos 8 km que o
// planejador considera caminhavel o catalogo so tem 5 pares, e todos ja estao em uso.
// Ja era padrao aceito -- relax/caminhada e gastronomia/caminhada sao ambos Pipa +
// Madeiro, diferenciados so pela copia.
const ROTEIROS: Tabela = {
  adventure: {
    hike: ['Dunas de Genipabu', 'Lagoa de Pitangui'],
    buggy: ['Dunas de Genipabu', 'Lagoa de Pitangui', 'Parrachos de Maracajaú'],
    shuttle: ['Ponta Negra e Morro do Careca', 'Dunas de Genipabu', 'Praia da Pipa'],
  },
  relax: {
    hike: ['Praia da Pipa', 'Praia do Madeiro'],
    buggy: ['Parrachos de Maracajaú', 'São Miguel do Gostoso'],
    shuttle: ['Parrachos de Maracajaú', 'Galinhos', 'São Miguel do Gostoso'],
  },
  culture: {
    hike: ['Ponta Negra e Morro do Careca', 'Barreira do Inferno'],
    buggy: ['Forte dos Reis Magos', 'Dunas de Genipabu'],
    shuttle: ['Forte dos Reis Magos', 'Cidade Histórica de Mossoró', 'Lajedo de Soledade'],
  },
  ecotourism: {
    hike: ['Lagoa de Pitangui', 'Dunas de Genipabu'],
    buggy: ['Parrachos de Maracajaú', 'São Miguel do Gostoso'],
    shuttle: ['Lagoa de Pitangui', 'Parrachos de Maracajaú', 'Galinhos'],
  },
  family: {
    hike: ['Ponta Negra e Morro do Careca', 'Parque das Dunas'],
    buggy: ['Forte dos Reis Magos', 'Dunas de Genipabu'],
    shuttle: ['Ponta Negra e Morro do Careca', 'Forte dos Reis Magos', 'Praia da Pipa'],
  },
  gastronomy: {
    hike: ['Praia da Pipa', 'Praia do Madeiro'],
    buggy: ['Praia da Pipa', 'Barra de Cunhaú'],
    shuttle: ['Ponta Negra e Morro do Careca', 'Praia da Pipa', 'Barra de Cunhaú'],
  },
};

/** Transporte cai em 'shuttle' quando nao e buggy nem hike, como na home. */
export function normalizeTransport(id: string): Transport {
  if (id === 'buggy') return 'buggy';
  if (id === 'hike') return 'hike';
  return 'shuttle';
}

/** Estilo cai em 'gastronomy' quando nao reconhecido, como o else final da home. */
export function normalizeStyle(id: string): TravelStyle {
  return (TRAVEL_STYLES as readonly string[]).includes(id) ? (id as TravelStyle) : 'gastronomy';
}

/**
 * Teto do contador de duracao por transporte.
 *
 * O catalogo tem 20 destinos e so ~10 na Grande Natal. Passado o teto, o
 * preenchimento esgota o que esta perto e cai no escape `escolher(Infinity)` do
 * planejador — que ignora a barreira de distancia de proposito, para nao devolver
 * dia vazio. Dai sairam os 70 km a pe em 13 dias e os 189 km de buggy.
 *
 * Os cortes sao medidos, nao arbitrados: caminhada da 9,2 km de pior dia com teto
 * 3 e 26,6 km com teto 4; buggy da 55,6 km ate o teto 12 e 189 km no 13.
 */
export const MAX_DIAS_POR_TRANSPORTE: Record<Transport, number> = {
  hike: 3,
  buggy: 12,
  shuttle: 15,
};

/**
 * Combinacoes que so fazem sentido a partir de N dias. Chave: `${estilo}/${transporte}`.
 *
 * A "Grande Rota Historica" de van vai a Mossoro e ao Lajedo porque a descricao os
 * nomeia — ali o deslocamento longo E o roteiro. O defeito era oferece-la em 1 dia,
 * o que empilhava Forte + Mossoro + Lajedo num dia so: 313 km.
 */
export const MIN_DIAS_POR_COMBINACAO: Record<string, number> = {
  'culture/shuttle': 3,
};

/** Faixa de duracao valida para uma combinacao. Planejador, UI e cache usam esta. */
export function limitesDeDuracao(style: string, transport: string): { min: number; max: number } {
  const t = normalizeTransport(transport);
  const s = normalizeStyle(style);
  return { min: MIN_DIAS_POR_COMBINACAO[`${s}/${t}`] ?? 1, max: MAX_DIAS_POR_TRANSPORTE[t] };
}

/**
 * Devolve COPIA: a home muta a lista (a busca injeta ou substitui um destino),
 * e devolver a referencia da tabela corromperia os presets para sempre — o
 * cache do OSRM passaria a errar a chave a partir da primeira busca.
 */
export function destinosDoRoteiro(style: string, transport: string): string[] {
  return [...ROTEIROS[normalizeStyle(style)][normalizeTransport(transport)]];
}

/** Todas as 18 combinacoes, para o gerador de cache varrer. */
export function todasAsCombinacoes(): {
  style: TravelStyle;
  transport: Transport;
  destinos: string[];
}[] {
  const out = [];
  for (const style of TRAVEL_STYLES) {
    for (const transport of TRANSPORTS) {
      out.push({ style, transport, destinos: ROTEIROS[style][transport] });
    }
  }
  return out;
}
