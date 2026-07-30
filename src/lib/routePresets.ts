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
    hike: ['Lagoa de Pitangui', 'Parrachos de Maracajaú'],
    buggy: ['Parrachos de Maracajaú', 'Galinhos'],
    shuttle: ['Lagoa de Pitangui', 'Parrachos de Maracajaú', 'Galinhos'],
  },
  family: {
    hike: ['Ponta Negra e Morro do Careca', 'Praia da Pipa'],
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
