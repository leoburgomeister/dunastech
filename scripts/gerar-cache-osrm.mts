/**
 * Grava a geometria das 18 rotas que a home sabe gerar em
 * public/routes/osrm-cache.json.
 *
 * Rode com internet, antes de apresentar:
 *   npx tsx scripts/gerar-cache-osrm.mts
 *
 * Nao roda no build de proposito: um build sem rede, ou com o OSRM publico
 * fora do ar, passaria a falhar o deploy inteiro por causa de um enfeite.
 */

import fs from 'node:fs';
import path from 'node:path';
import { destinosInfo } from '../src/data/mockData';
import { todasAsCombinacoes } from '../src/lib/routePresets';
import { routeKey, osrmUrl, type Coord } from '../src/lib/map/routeCache';

const SAIDA = path.join(process.cwd(), 'public', 'routes', 'osrm-cache.json');
const ESPERA_MS = 1200; // o OSRM publico tem rate limit

function coordsDe(nomes: string[]): Coord[] | null {
  const out: Coord[] = [];
  for (const nome of nomes) {
    const d = destinosInfo.find((x) => x.nome === nome);
    if (!d) {
      console.error(`  ! destino inexistente em mockData: "${nome}"`);
      return null;
    }
    out.push([d.longitude, d.latitude]);
  }
  return out;
}

const espera = (ms: number) => new Promise((r) => setTimeout(r, ms));

async function main() {
  const cache: Record<string, Coord[]> = {};
  const combinacoes = todasAsCombinacoes();
  let ok = 0;
  let falhas = 0;

  // Combinacoes distintas pela geometria: varias celulas da tabela repetem o
  // mesmo par de destinos, e nao ha por que pedir duas vezes ao OSRM.
  const vistos = new Set<string>();

  for (const { style, transport, destinos } of combinacoes) {
    const coords = coordsDe(destinos);
    if (!coords) {
      falhas++;
      continue;
    }
    const chave = routeKey(coords);
    if (vistos.has(chave)) {
      console.log(`= ${style}/${transport} (mesma geometria ja obtida)`);
      continue;
    }
    vistos.add(chave);

    try {
      const r = await fetch(osrmUrl(coords));
      if (!r.ok) throw new Error(`HTTP ${r.status}`);
      const j = await r.json();
      const geo = j?.routes?.[0]?.geometry?.coordinates as Coord[] | undefined;
      if (!geo || geo.length < 2) throw new Error('resposta sem geometria');
      // 5 casas ~ 1 m. O OSRM devolve 6-7, precisao de centimetro que so
      // engorda o arquivo — arredondar corta ~10% do peso sem efeito visivel.
      cache[chave] = geo.map(([lng, lat]) => [+lng.toFixed(5), +lat.toFixed(5)] as Coord);
      ok++;
      console.log(`+ ${style}/${transport}: ${geo.length} pontos — ${destinos.join(' > ')}`);
    } catch (e) {
      falhas++;
      console.error(`! ${style}/${transport}: ${(e as Error).message}`);
    }
    await espera(ESPERA_MS);
  }

  fs.mkdirSync(path.dirname(SAIDA), { recursive: true });
  fs.writeFileSync(SAIDA, JSON.stringify(cache));
  const kb = (fs.statSync(SAIDA).size / 1024).toFixed(1);
  console.log(`\ngravado ${SAIDA}`);
  console.log(`rotas: ${ok} | falhas: ${falhas} | tamanho: ${kb} KB`);
  if (falhas > 0) process.exitCode = 1;
}

main();
