/**
 * Grava a geometria de TODAS as rotas que a home sabe gerar em
 * public/routes/osrm-cache.json.
 *
 * Rode com internet, antes de apresentar:
 *   npx tsx scripts/gerar-cache-osrm.mts
 *   npx tsx scripts/gerar-cache-osrm.mts --dry   (so conta, nao vai a rede)
 *
 * Nao roda no build de proposito: um build sem rede, ou com o OSRM publico
 * fora do ar, passaria a falhar o deploy inteiro por causa de um enfeite.
 *
 * O conjunto a cachear NAO e mais a tabela de presets. Desde que o roteiro
 * passou a respeitar a duracao pedida, os destinos de uma rota dependem de
 * (estilo, transporte, dias) e vem ordenados pelo planejador -- entao a chave
 * do cache muda com a duracao. Alem da rota inteira, o mapa desenha o trecho
 * do DIA expandido (o dia 1 abre sozinho ao gerar), logo cada dia com duas ou
 * mais paradas tambem precisa de geometria propria.
 */

import fs from 'node:fs';
import path from 'node:path';
import { TRAVEL_STYLES, TRANSPORTS } from '../src/lib/routePresets';
import { osrmUrl, type Coord } from '../src/lib/map/routeCache';
import { trechosNecessarios, MAX_CACHED_DAYS } from '../src/lib/map/routeCoverage';

const SAIDA = path.join(process.cwd(), 'public', 'routes', 'osrm-cache.json');
const ESPERA_MS = 1200; // o OSRM publico tem rate limit
const SECO = process.argv.includes('--dry');

const espera = (ms: number) => new Promise((r) => setTimeout(r, ms));

/**
 * Ralea a geometria mantendo a fidelidade em TELA, nao em metros.
 *
 * O OSRM devolve um ponto a cada poucos metros. Numa rota que cruza o estado
 * isso da 12 mil pontos para um traco que o mapa desenha com ~800 pixels de
 * largura — 15 pontos por pixel, invisiveis e caros. A tolerancia sai do
 * proprio tamanho da rota (span/1200), entao o trecho curto de um dia continua
 * detalhado e o traco de estado inteiro emagrece.
 */
function ralear(rota: Coord[]): Coord[] {
  if (rota.length < 3) return rota;

  let minX = Infinity;
  let maxX = -Infinity;
  let minY = Infinity;
  let maxY = -Infinity;
  for (const [x, y] of rota) {
    if (x < minX) minX = x;
    if (x > maxX) maxX = x;
    if (y < minY) minY = y;
    if (y > maxY) maxY = y;
  }

  const span = Math.max(maxX - minX, maxY - minY);
  const tolerancia = Math.min(0.004, Math.max(0.0001, span / 1200));

  const out: Coord[] = [rota[0]];
  for (let i = 1; i < rota.length - 1; i++) {
    const [x, y] = out[out.length - 1];
    const [a, b] = rota[i];
    if (Math.abs(a - x) > tolerancia || Math.abs(b - y) > tolerancia) out.push(rota[i]);
  }
  out.push(rota[rota.length - 1]);
  return out;
}

async function main() {
  const necessarios = trechosNecessarios();
  console.log(
    `${TRAVEL_STYLES.length} estilos x ${TRANSPORTS.length} transportes x ${MAX_CACHED_DAYS} duracoes`
  );
  console.log(`geometrias distintas a cachear: ${necessarios.size}`);
  console.log(`tempo estimado: ~${Math.ceil((necessarios.size * ESPERA_MS) / 60000)} min\n`);

  if (SECO) {
    const porTamanho = new Map<number, number>();
    for (const { coords } of necessarios.values()) {
      porTamanho.set(coords.length, (porTamanho.get(coords.length) ?? 0) + 1);
    }
    console.log('distribuicao por numero de paradas:');
    for (const n of [...porTamanho.keys()].sort((a, b) => a - b)) {
      console.log(`  ${n} paradas: ${porTamanho.get(n)}`);
    }
    return;
  }

  // Preserva o que ja esta gravado: uma rodada interrompida no meio nao joga
  // fora as geometrias que ja custaram requisicao.
  const cache: Record<string, Coord[]> = fs.existsSync(SAIDA)
    ? (JSON.parse(fs.readFileSync(SAIDA, 'utf8')) as Record<string, Coord[]>)
    : {};

  let novas = 0;
  let reaproveitadas = 0;
  let falhas = 0;
  let vistas = 0;

  for (const [chave, { coords, rotulo }] of necessarios) {
    vistas++;
    if (Array.isArray(cache[chave]) && cache[chave].length > 1) {
      reaproveitadas++;
      continue;
    }

    try {
      const r = await fetch(osrmUrl(coords));
      if (!r.ok) throw new Error(`HTTP ${r.status}`);
      const j = await r.json();
      const geo = j?.routes?.[0]?.geometry?.coordinates as Coord[] | undefined;
      if (!geo || geo.length < 2) throw new Error('resposta sem geometria');
      // 5 casas ~ 1 m. O OSRM devolve 6-7, precisao de centimetro que so
      // engorda o arquivo — arredondar corta ~10% do peso sem efeito visivel.
      cache[chave] = geo.map(([lng, lat]) => [+lng.toFixed(5), +lat.toFixed(5)] as Coord);
      novas++;
      if (novas % 25 === 0) console.log(`  ... ${vistas}/${necessarios.size}`);
    } catch (e) {
      falhas++;
      console.error(`! ${rotulo}: ${(e as Error).message}`);
    }
    await espera(ESPERA_MS);
  }

  // Grava SO o que a home pode pedir, raleado. Chave orfa — de uma versao
  // anterior do planejador — sairia carregando peso morto no navegador do
  // apresentador sem nunca ser consultada.
  const final: Record<string, Coord[]> = {};
  let pontosBrutos = 0;
  let pontosFinais = 0;
  for (const chave of necessarios.keys()) {
    const rota = cache[chave];
    if (!Array.isArray(rota) || rota.length < 2) continue;
    const enxuta = ralear(rota);
    pontosBrutos += rota.length;
    pontosFinais += enxuta.length;
    final[chave] = enxuta;
  }

  const orfas = Object.keys(cache).length - Object.keys(final).length;

  fs.mkdirSync(path.dirname(SAIDA), { recursive: true });
  fs.writeFileSync(SAIDA, JSON.stringify(final));
  const kb = (fs.statSync(SAIDA).size / 1024).toFixed(1);
  console.log(`\ngravado ${SAIDA}`);
  console.log(
    `novas: ${novas} | reaproveitadas: ${reaproveitadas} | falhas: ${falhas} | orfas descartadas: ${orfas}`
  );
  console.log(
    `pontos: ${pontosBrutos} -> ${pontosFinais} (${Math.round(
      (100 * pontosFinais) / Math.max(1, pontosBrutos)
    )}%) | tamanho: ${kb} KB`
  );
  if (falhas > 0) process.exitCode = 1;
}

main();
