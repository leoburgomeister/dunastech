/**
 * Enumera toda geometria de rota que a home pode pedir ao mapa.
 *
 * Vive num modulo proprio porque duas coisas dependem dela — o script que
 * pre-cacheia as rotas do OSRM e o teste que garante que o cache cobre o que a
 * home gera. Duplicar a enumeracao faria o cache envelhecer em silencio, e a
 * defasagem so apareceria no palco: sem acerto no cache, o traco da rota passa
 * a depender do OSRM publico e da rede do auditorio.
 *
 * O conjunto depende da DURACAO, nao so de (estilo, transporte): desde que o
 * roteiro passou a honrar os dias pedidos, a lista de destinos e a ordem mudam
 * com a duracao. E o mapa desenha o trecho do dia expandido — o dia 1 abre
 * sozinho ao gerar —, entao cada dia com duas ou mais paradas tambem entra.
 */

import { destinosInfo } from '../../data/mockData';
import { TRAVEL_STYLES, TRANSPORTS } from '../routePresets';
import { planRoute, MAX_ROUTE_DAYS } from '../route-planner';
import { routeKey, type Coord } from './routeCache';

export interface TrechoDeRota {
  coords: Coord[];
  /** Origem do trecho, para a mensagem de falha dizer o que faltou. */
  rotulo: string;
}

function coordsDe(destinos: { longitude: number; latitude: number }[]): Coord[] {
  return destinos.map((d) => [d.longitude, d.latitude] as Coord);
}

export function trechosNecessarios(): Map<string, TrechoDeRota> {
  const porChave = new Map<string, TrechoDeRota>();

  const registrar = (coords: Coord[], rotulo: string) => {
    // O mapa nao desenha linha com menos de duas paradas (HomeRouteMap.tsx).
    if (coords.length < 2) return;
    const chave = routeKey(coords);
    if (!porChave.has(chave)) porChave.set(chave, { coords, rotulo });
  };

  for (const style of TRAVEL_STYLES) {
    for (const transport of TRANSPORTS) {
      for (let days = 1; days <= MAX_ROUTE_DAYS; days++) {
        const plano = planRoute({ catalogue: destinosInfo, style, transport, days });

        registrar(coordsDe(plano.destinations), `${style}/${transport}/${days}d rota inteira`);

        for (const dia of plano.days) {
          registrar(coordsDe(dia.destinations), `${style}/${transport}/${days}d dia ${dia.day}`);
        }
      }
    }
  }

  return porChave;
}
