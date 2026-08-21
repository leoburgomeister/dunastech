/**
 * Confere se o Supabase bate com o catálogo curado (`src/data/mockData.ts`).
 *
 * Existe porque essa divergência é invisível onde se trabalha: sem as variáveis do
 * Supabase o app usa o catálogo estático e tudo parece certo; com elas, o banco manda.
 * Já custou duas vezes —
 *
 *   - coordenadas fora de lugar (a Lagoa de Pitangui a 9 km) erram a chave do cache de
 *     rotas, que é gerado offline a partir do catálogo, e o traço da rota volta a
 *     depender do OSRM público no meio da apresentação;
 *   - investimento em escala errada (10x menor) derruba o ISA para fora da faixa
 *     calibrada e enche a tela de selo "Atenção".
 *
 * Nenhum teste pega isso: `npm test` roda contra o catálogo estático, justamente o lado
 * que está certo. Rode `npm run verificar:banco` depois de mexer em seed ou migration.
 *
 * Sai com código 1 quando encontra divergência, para poder virar passo de CI.
 */

import { destinosInfo, investimentosData, fluxoData, transporteData } from '../src/data/mockData';

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!url || !key) {
  console.error('Faltam NEXT_PUBLIC_SUPABASE_URL / NEXT_PUBLIC_SUPABASE_ANON_KEY no ambiente.');
  process.exit(1);
}

/** Tolerância de coordenada: a chave do cache arredonda a 4 casas (~11 m). */
const TOLERANCIA_KM = 0.02;

async function buscar<T>(caminho: string): Promise<T[]> {
  const resposta = await fetch(`${url}/rest/v1/${caminho}`, {
    headers: { apikey: key as string, Authorization: `Bearer ${key}` },
  });
  if (!resposta.ok) {
    throw new Error(`${caminho} -> ${resposta.status} ${await resposta.text()}`);
  }
  return resposta.json();
}

function km(aLat: number, aLon: number, bLat: number, bLon: number): number {
  const R = 6371;
  const rad = (x: number) => (x * Math.PI) / 180;
  const dLat = rad(bLat - aLat);
  const dLon = rad(bLon - aLon);
  const h =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(rad(aLat)) * Math.cos(rad(bLat)) * Math.sin(dLon / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(h), Math.sqrt(1 - h));
}

type ComDestino = { destinos?: { nome: string } | { nome: string }[] | null };
const nomeDe = (r: ComDestino) =>
  Array.isArray(r.destinos) ? r.destinos[0]?.nome : r.destinos?.nome;

const problemas: string[] = [];

async function main() {
  const destinos = await buscar<{ nome: string; latitude: number; longitude: number }>(
    'destinos?select=nome,latitude,longitude'
  );

  const noBanco = new Set(destinos.map((d) => d.nome));
  for (const d of destinosInfo) {
    if (!noBanco.has(d.nome)) problemas.push(`destino ausente no banco: ${d.nome}`);
  }

  for (const linha of destinos) {
    const curado = destinosInfo.find((d) => d.nome === linha.nome);
    if (!curado) {
      problemas.push(`destino só no banco (fora do catálogo): ${linha.nome}`);
      continue;
    }
    if (linha.latitude == null || linha.longitude == null) {
      problemas.push(`destino sem coordenada: ${linha.nome}`);
      continue;
    }
    const distancia = km(curado.latitude, curado.longitude, linha.latitude, linha.longitude);
    if (distancia > TOLERANCIA_KM) {
      problemas.push(`coordenada divergente: ${linha.nome} está a ${distancia.toFixed(2)} km do catálogo`);
    }
  }

  const investimento = await buscar<ComDestino & { total_mil: string }>(
    'investimento?select=total_mil,destinos(nome)'
  );
  for (const linha of investimento) {
    const nome = nomeDe(linha);
    const curado = investimentosData.find((i) => i.destino === nome);
    if (!curado) continue;
    if (Math.abs(curado.total_mil - Number(linha.total_mil)) > 1) {
      problemas.push(
        `investimento divergente: ${nome} tem ${linha.total_mil} no banco e ${curado.total_mil} no catálogo`
      );
    }
  }

  const fluxo = await buscar<ComDestino & { saturacao_turistica: string }>(
    'fluxo?select=saturacao_turistica,destinos(nome)'
  );
  for (const linha of fluxo) {
    const nome = nomeDe(linha);
    const curado = fluxoData.find((f) => f.destino === nome);
    if (!curado) continue;
    if (Math.abs(curado.saturacao_turistica - Number(linha.saturacao_turistica)) > 0.5) {
      problemas.push(
        `saturação divergente: ${nome} tem ${linha.saturacao_turistica} no banco e ${curado.saturacao_turistica} no catálogo`
      );
    }
  }

  const transporte = await buscar<ComDestino & { voos_mensais: number }>(
    'transporte?select=voos_mensais,destinos(nome)'
  );
  for (const linha of transporte) {
    const nome = nomeDe(linha);
    const curado = transporteData.find((t) => t.destino === nome);
    if (!curado) continue;
    if (Math.abs(curado.voos_mensais - Number(linha.voos_mensais)) > 1) {
      problemas.push(`transporte divergente: ${nome}`);
    }
  }

  const atracoes = await buscar<{ id: number }>('atracoes?select=id');
  if (atracoes.length === 0) {
    problemas.push('tabela `atracoes` vazia — os destinos ficariam sem experiências');
  }

  if (problemas.length === 0) {
    console.log(`Banco alinhado ao catálogo: ${destinos.length} destinos, ${atracoes.length} atrações.`);
    return;
  }

  console.error(`${problemas.length} divergência(s) entre o banco e o catálogo:\n`);
  for (const p of problemas) console.error(`  - ${p}`);
  process.exit(1);
}

main().catch((err) => {
  console.error('Falha ao verificar o banco:', err);
  process.exit(1);
});
