// ============================================================
// PLANEJADOR DE ROTEIROS — POTI
// ------------------------------------------------------------
// Lógica pura de montagem de roteiro, separada da UI para poder ser testada.
// Garante três coisas que a versão anterior não garantia:
//   1. o roteiro tem exatamente a quantidade de dias pedida (nenhum dia some);
//   2. nenhum dia fica vazio;
//   3. a ordem dos destinos é otimizada geograficamente — o selo "Roteiro
//      Otimizado" da interface passa a ser verdade.
// ============================================================

import type { DestinoInfo } from '../data/mockData';
import { destinosDoRoteiro } from './routePresets';
import type { TravelStyle, Transport } from './routePresets';

export type { TravelStyle } from './routePresets';
export type TransportMode = Transport;

/** Teto do contador de duração da interface. */
export const MAX_ROUTE_DAYS = 15;

export interface PlannedDay {
  day: number;
  destinations: DestinoInfo[];
  /** Deslocamento do dia: chegada vinda do dia anterior + trechos internos. */
  travelKm: number;
}

export interface PlannedRoute {
  destinations: DestinoInfo[];
  days: PlannedDay[];
  totalKm: number;
}

export interface PlanRouteOptions {
  catalogue: DestinoInfo[];
  style: TravelStyle;
  transport: TransportMode;
  days: number;
  /** Destino buscado pelo usuário; vira o ponto de partida do roteiro. */
  anchorName?: string | null;
}

// Ordem de preferência usada para completar o roteiro quando a duração pede mais
// destinos do que os de assinatura. Quem não está na lista ainda pode entrar, mas
// só depois destes.
const STYLE_AFFINITY: Record<TravelStyle, string[]> = {
  adventure: [
    'Dunas de Genipabu',
    'Lagoa de Pitangui',
    'Parrachos de Maracajaú',
    'Ponta Negra e Morro do Careca',
    'Praia da Pipa',
    'Praia do Madeiro',
    'São Miguel do Gostoso',
    'Galinhos',
    'Parque das Dunas',
    // Aventura de verdade, mas serra adentro: só entra em roteiros longos, depois que o
    // litoral — que é o que os títulos de aventura prometem — já foi coberto.
    'Canyon dos Apertados',
  ],
  relax: [
    'Praia da Pipa',
    'Praia do Madeiro',
    'Parrachos de Maracajaú',
    'São Miguel do Gostoso',
    'Galinhos',
    'Barra de Cunhaú',
    'Lagoa de Pitangui',
    'Ponta Negra e Morro do Careca',
  ],
  ecotourism: [
    'Lagoa de Pitangui',
    'Parrachos de Maracajaú',
    'Galinhos',
    'Parque das Dunas',
    'Barra de Cunhaú',
    'Salinas de Galinhos e Fábrica de Sal',
    'Salinas e Indústria Salineira de Macau',
    'Canyon dos Apertados',
    'Praia do Madeiro',
  ],
  culture: [
    'Forte dos Reis Magos',
    'Cidade Histórica de Mossoró',
    'Lajedo de Soledade',
    'Barreira do Inferno',
    'Castelo de Bivar',
    'Estátua de Santa Rita de Cássia',
    'Ponta Negra e Morro do Careca',
    'Maior Cajueiro do Mundo',
  ],
  gastronomy: [
    'Praia da Pipa',
    'Barra de Cunhaú',
    'Ponta Negra e Morro do Careca',
    'Praia do Madeiro',
    'São Miguel do Gostoso',
    'Galinhos',
    'Parrachos de Maracajaú',
  ],
  family: [
    'Ponta Negra e Morro do Careca',
    'Praia da Pipa',
    'Forte dos Reis Magos',
    'Maior Cajueiro do Mundo',
    'Parque das Dunas',
    'Dunas de Genipabu',
    'Parrachos de Maracajaú',
    'Praia do Madeiro',
    'Barreira do Inferno',
  ],
};

// Quantos destinos o preenchimento pede por dia e o quanto a distância pesa na escolha do
// próximo destino. A pé o roteiro precisa ficar colado; de van pode cruzar o estado.
//
// `perDay` é 1 em todo transporte: um destino por dia, decisão de produto. Van e buggy já
// pediram 1,5 — dias mais cheios —, mas o roteiro ficava com mais paradas que dias (5 dias
// rendiam 8 destinos) e o painel deixava de espelhar a duração pedida.
//
// Duração MENOR que a assinatura ainda empilha: a descrição da combinação nomeia todos os
// destinos-assinatura, e cortar um para caber um por dia desmentiria a própria cópia. Aí o
// certo é o dia com duas paradas, não a promessa quebrada.
const TRANSPORT_PROFILE: Record<
  TransportMode,
  { perDay: number; comfortableLegKm: number; distanceWeight: number }
> = {
  hike: { perDay: 1, comfortableLegKm: 8, distanceWeight: 4 },
  buggy: { perDay: 1, comfortableLegKm: 60, distanceWeight: 1.5 },
  shuttle: { perDay: 1, comfortableLegKm: 180, distanceWeight: 0.6 },
};

const AFFINITY_STEP = 10;
const MONITORED_BONUS = 5;

/** Distância em linha reta entre dois pontos, em quilômetros. */
export function haversineKm(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

function distanceBetween(a: DestinoInfo, b: DestinoInfo): number {
  return haversineKm(a.latitude, a.longitude, b.latitude, b.longitude);
}

/** Soma dos trechos consecutivos de uma sequência de destinos. */
export function routeLengthKm(destinations: DestinoInfo[]): number {
  let total = 0;
  for (let i = 1; i < destinations.length; i++) {
    total += distanceBetween(destinations[i - 1], destinations[i]);
  }
  return total;
}

/**
 * Reordena os destinos para encurtar o trajeto: vizinho mais próximo a partir de um
 * ponto de partida e, em seguida, 2-opt para desfazer os cruzamentos que a heurística
 * gulosa deixa para trás. O primeiro destino nunca muda de lugar.
 */
export function optimizeOrder(destinations: DestinoInfo[], startName?: string | null): DestinoInfo[] {
  if (destinations.length <= 2) return [...destinations];

  const pending = [...destinations];

  // Sem ponto de partida definido, começar por um extremo geográfico evita que o
  // roteiro nasça no meio e tenha que voltar para pegar as duas pontas.
  let startIndex = startName ? pending.findIndex((d) => d.nome === startName) : -1;
  if (startIndex === -1) {
    const meanLat = pending.reduce((s, d) => s + d.latitude, 0) / pending.length;
    const meanLon = pending.reduce((s, d) => s + d.longitude, 0) / pending.length;
    let farthest = -1;
    pending.forEach((d, i) => {
      const dist = haversineKm(meanLat, meanLon, d.latitude, d.longitude);
      if (dist > farthest) {
        farthest = dist;
        startIndex = i;
      }
    });
  }

  const ordered: DestinoInfo[] = [pending.splice(startIndex, 1)[0]];
  while (pending.length > 0) {
    const current = ordered[ordered.length - 1];
    let bestIndex = 0;
    let bestDist = Infinity;
    pending.forEach((candidate, i) => {
      const dist = distanceBetween(current, candidate);
      if (dist < bestDist) {
        bestDist = dist;
        bestIndex = i;
      }
    });
    ordered.push(pending.splice(bestIndex, 1)[0]);
  }

  return twoOpt(ordered);
}

/** 2-opt para caminho aberto. Preserva o primeiro destino (ponto de partida). */
function twoOpt(path: DestinoInfo[]): DestinoInfo[] {
  const result = [...path];
  const n = result.length;
  const maxPasses = 20;

  for (let pass = 0; pass < maxPasses; pass++) {
    let improved = false;

    for (let i = 1; i < n - 1; i++) {
      for (let j = i + 1; j < n; j++) {
        const before =
          distanceBetween(result[i - 1], result[i]) +
          (j + 1 < n ? distanceBetween(result[j], result[j + 1]) : 0);
        const after =
          distanceBetween(result[i - 1], result[j]) +
          (j + 1 < n ? distanceBetween(result[i], result[j + 1]) : 0);

        if (after < before - 1e-9) {
          const segment = result.slice(i, j + 1).reverse();
          result.splice(i, segment.length, ...segment);
          improved = true;
        }
      }
    }

    if (!improved) break;
  }

  return result;
}

function clampDays(requested: number, catalogueSize: number): number {
  if (catalogueSize === 0) return 0;
  if (!Number.isFinite(requested)) return 1;
  const rounded = Math.round(requested);
  return Math.max(1, Math.min(rounded, MAX_ROUTE_DAYS, catalogueSize));
}

/**
 * Escolhe os destinos do roteiro: os de assinatura entram sempre, o resto é
 * preenchido de forma gulosa por afinidade com o estilo e proximidade do que já
 * foi escolhido, para o roteiro crescer como um bloco coeso e não como pontos soltos.
 */
function selectDestinations(
  catalogue: DestinoInfo[],
  style: TravelStyle,
  transport: TransportMode,
  targetCount: number,
  minCount: number,
  anchor: DestinoInfo | null
): DestinoInfo[] {
  const profile = TRANSPORT_PROFILE[transport];
  const affinity = STYLE_AFFINITY[style];
  const selected: DestinoInfo[] = [];
  const taken = new Set<string>();

  const take = (dest: DestinoInfo | undefined) => {
    if (!dest || taken.has(dest.nome)) return;
    taken.add(dest.nome);
    selected.push(dest);
  };

  // Assinatura entra sempre, mesmo longe: e o que o titulo prometeu. A "Grande Rota
  // Historica" de van vai a Mossoro e ao Lajedo porque a descricao os nomeia — o
  // deslocamento longo ali e o roteiro, nao um efeito colateral do preenchimento.
  if (anchor) take(anchor);
  for (const nome of destinosDoRoteiro(style, transport)) {
    take(catalogue.find((d) => d.nome === nome));
  }

  const nearestSelectedKm = (candidate: DestinoInfo) =>
    selected.length ? Math.min(...selected.map((s) => distanceBetween(s, candidate))) : 0;

  /**
   * Escolhe o proximo destino do preenchimento.
   *
   * `limiteKm` e barreira DURA, nao mais uma penalidade: a afinidade de estilo vale
   * AFFINITY_STEP por posicao na lista e superava com folga o custo da distancia, entao
   * "Cultura + Buggy" alcancava Mossoro — 245 km de buggy num dia — so porque Mossoro e
   * o segundo nome da lista de cultura. Com a barreira, afinidade decide apenas ENTRE os
   * destinos que o transporte consegue rodar.
   */
  const escolher = (limiteKm: number): DestinoInfo | null => {
    let best: DestinoInfo | null = null;
    let bestScore = -Infinity;

    for (const candidate of catalogue) {
      if (taken.has(candidate.nome)) continue;

      const nearestKm = nearestSelectedKm(candidate);
      if (nearestKm > limiteKm) continue;

      const affinityIndex = affinity.indexOf(candidate.nome);
      const affinityScore =
        affinityIndex === -1 ? 0 : (affinity.length - affinityIndex) * AFFINITY_STEP;

      const distancePenalty =
        profile.distanceWeight * (nearestKm / profile.comfortableLegKm) * AFFINITY_STEP;

      const score =
        affinityScore + (candidate.monitorado ? MONITORED_BONUS : 0) - distancePenalty;

      if (score > bestScore) {
        bestScore = score;
        best = candidate;
      }
    }

    return best;
  };

  while (selected.length < targetCount) {
    let proximo = escolher(profile.comfortableLegKm);

    // Nada ao alcance. Roteiro mais curto e melhor que roteiro impossivel, entao paramos
    // aqui — desde que cada dia ja tenha o seu destino. Se ainda faltar destino para
    // algum dia, a barreira cede: dia vazio seria descartado em silencio e o usuario
    // receberia menos dias do que pediu, que e o defeito que este planejador existe para
    // impedir.
    if (!proximo) {
      if (selected.length >= minCount) break;
      proximo = escolher(Infinity);
      if (!proximo) break;
    }

    take(proximo);
  }

  return selected;
}

/** Reparte a sequência já otimizada em blocos contíguos e equilibrados, um por dia. */
function splitIntoDays(ordered: DestinoInfo[], days: number): DestinoInfo[][] {
  const perDay = Math.floor(ordered.length / days);
  const remainder = ordered.length % days;
  const chunks: DestinoInfo[][] = [];
  let cursor = 0;

  for (let i = 0; i < days; i++) {
    const size = perDay + (i < remainder ? 1 : 0);
    chunks.push(ordered.slice(cursor, cursor + size));
    cursor += size;
  }

  return chunks;
}

export function planRoute(options: PlanRouteOptions): PlannedRoute {
  const { catalogue, style, transport, days, anchorName } = options;

  const totalDays = clampDays(days, catalogue.length);
  if (totalDays === 0) {
    return { destinations: [], days: [], totalKm: 0 };
  }

  const anchor = anchorName ? catalogue.find((d) => d.nome === anchorName) ?? null : null;
  const profile = TRANSPORT_PROFILE[transport];
  const seedCount = destinosDoRoteiro(style, transport).length;

  // Precisa de pelo menos um destino por dia — é isso que impede um dia de nascer vazio
  // e ser descartado silenciosamente, que era a causa do "pedi 6 dias, vieram 3".
  //
  // Enquanto a assinatura cobre os dias pedidos, ela é o roteiro INTEIRO: o título e a
  // descrição de cada combinação nomeiam exatamente esses destinos, e preencher além
  // deles desmentia a própria promessa — "Roteiro Buggy Litoral NORTE" abria com Praia da
  // Pipa, 100 km ao SUL, porque o ritmo de 1,5 destino/dia pedia dois nomes a mais e a
  // afinidade os buscava litoral abaixo. O ritmo por transporte volta a valer quando a
  // duração passa da assinatura, aí preencher é inevitável.
  const targetCount = Math.min(
    catalogue.length,
    totalDays <= seedCount
      ? seedCount
      : Math.max(Math.round(totalDays * profile.perDay), totalDays)
  );

  const selected = selectDestinations(catalogue, style, transport, targetCount, totalDays, anchor);
  const ordered = optimizeOrder(selected, anchor?.nome);
  const chunks = splitIntoDays(ordered, totalDays);

  let previous: DestinoInfo | null = null;
  const plannedDays: PlannedDay[] = chunks.map((destinations, index) => {
    let travelKm = 0;
    let cursor = previous;

    for (const dest of destinations) {
      if (cursor) travelKm += distanceBetween(cursor, dest);
      cursor = dest;
    }
    previous = cursor;

    return {
      day: index + 1,
      destinations,
      travelKm: Number(travelKm.toFixed(1)),
    };
  });

  return {
    destinations: ordered,
    days: plannedDays,
    totalKm: Number(routeLengthKm(ordered).toFixed(1)),
  };
}
