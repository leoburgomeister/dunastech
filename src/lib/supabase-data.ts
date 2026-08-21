'use client';

import { useEffect, useState } from 'react';
import { supabase, isSupabaseConfigured } from '@/lib/supabase';
import {
  destinosInfo,
  ibgeData,
  fluxoData,
  investimentosData,
  transporteData,
  type AttractionActivity,
  type DestinoInfo,
} from '@/data/mockData';

// Reads reference data (destinos, ibge, fluxo, investimento, transporte) from Supabase
// and mutates the static mockData arrays in place, so every existing component that
// already imports those arrays (destinosInfo, ibgeData, ...) picks up real data with
// zero changes to their own logic. If Supabase is unreachable or unconfigured, the
// arrays simply keep their original static values — no screen can break on stage.

const SYNC_EVENT = 'poti:data-synced';
let syncPromise: Promise<void> | null = null;

const MODAL_LABELS: Record<string, string> = {
  AEREO: 'Aéreo',
  RODOVIARIO: 'Rodoviário',
  FERROVIARIO: 'Ferroviário',
  MARITIMO: 'Marítimo',
};

function replaceAll<T>(target: T[], next: T[]) {
  target.length = 0;
  target.push(...next);
}

/** PostgREST devolve relação 1-1 ora como objeto, ora como array de um elemento. */
type RelacaoRow = { nome: string } | { nome: string }[] | null;
const nomeRelacionado = (r: RelacaoRow) => (Array.isArray(r) ? r[0]?.nome : r?.nome);

type AtracaoRow = { id: number | string; nome: string | null; descricao: string | null };

/** Linha de `destinos` como o select deste módulo a pede. */
export interface DestinoRow {
  nome: string;
  descricao: string | null;
  imagem: string | null;
  latitude: number | null;
  longitude: number | null;
  hashtags: string[] | null;
  monitorado: boolean | null;
  municipios: RelacaoRow;
  atracoes: AtracaoRow[] | null;
}

// `parceiroId` fica vazio de propósito: ele endereça `/vitrine/{id}` sobre o catálogo
// Cadastur, que ainda é estático e não é sincronizado aqui. Um id do Supabase levaria
// a uma vitrine inexistente; com string vazia, DestinationDetailPage simplesmente não
// desenha o link. Melhor a atração sem link do que o link quebrado.
// `imagem` idem: quem decide a foto é a curadoria em photoCuration.ts, não este campo.
function atracoesDe(rows: AtracaoRow[] | null | undefined): AttractionActivity[] {
  if (!Array.isArray(rows)) return [];
  return rows
    .filter((a) => a && a.nome)
    .map((a) => ({
      id: String(a.id),
      nome: a.nome as string,
      descricao: a.descricao || '',
      imagem: '',
      parceiroId: '',
    }));
}

// Atrações do catálogo estático, congeladas na avaliação do módulo — ou seja, ANTES
// de qualquer `replaceAll` mutar `destinosInfo`. Servem de reserva quando o banco não
// tem atração para um destino: a tabela `atracoes` ficou vazia até a migration 0005,
// e um destino sem atrações apagaria o passo de escolher experiências da home. Se o
// banco um dia quiser um destino deliberadamente sem atrações, a reserva sai junto
// com esta constante.
const ATRACOES_ESTATICAS: ReadonlyMap<string, AttractionActivity[]> = new Map(
  destinosInfo.map((d) => [d.nome, d.atracoes])
);

// `latitude`/`longitude` são nullable no schema, mas `DestinoInfo` os declara como
// number e o app os usa sem guarda: `PlaceMap` chama `.toFixed()`, a câmera do mapa
// monta `[lng, lat]` e `haversineKm` entra em NaN — e um NaN no planejador contamina
// o `totalKm` do roteiro inteiro, não só o destino defeituoso. Um destino sem
// coordenada não tem como ser desenhado, então fica de fora e é avisado.
const temCoordenada = (d: { latitude: unknown; longitude: unknown }) =>
  Number.isFinite(d.latitude) && Number.isFinite(d.longitude);

/**
 * Converte as linhas de `destinos` no formato que o app inteiro já consome.
 *
 * Exportada para teste: é aqui que mora o contrato entre o banco e `DestinoInfo`, e
 * a versão anterior perdia `atracoes` e `monitorado` em silêncio — defeito que só
 * aparecia com o Supabase configurado, ou seja, apenas em produção.
 */
export function mapDestinoRows(rows: DestinoRow[]): {
  destinos: DestinoInfo[];
  semCoordenada: string[];
} {
  const semCoordenada = rows.filter((d) => !temCoordenada(d)).map((d) => d.nome);
  const destinos = rows.filter(temCoordenada).map((d) => {
    const doBanco = atracoesDe(d.atracoes);
    return {
      nome: d.nome,
      municipio: nomeRelacionado(d.municipios) || '',
      descricao: d.descricao || '',
      imagem: d.imagem || '',
      latitude: d.latitude as number,
      longitude: d.longitude as number,
      atracoes: doBanco.length > 0 ? doBanco : ATRACOES_ESTATICAS.get(d.nome) ?? [],
      hashtag: (d.hashtags && d.hashtags[0]) || '',
      monitorado: d.monitorado !== false,
    };
  });
  return { destinos, semCoordenada };
}

const DESTINOS_SELECT =
  'nome, descricao, imagem, latitude, longitude, hashtags, monitorado, municipios(nome), atracoes(id, nome, descricao)';

// Mesma consulta sem `monitorado`, para banco anterior à migration 0004.
const DESTINOS_SELECT_SEM_MONITORADO =
  'nome, descricao, imagem, latitude, longitude, hashtags, municipios(nome), atracoes(id, nome, descricao)';

/**
 * Busca os destinos tolerando banco que ainda não recebeu a migration 0004.
 *
 * Sem isto, subir este código antes da migration derruba a sincronização INTEIRA:
 * o PostgREST devolve 400 (`column destinos.monitorado does not exist`), `anyError`
 * dispara e o app volta ao catálogo estático — perdendo também ibge, fluxo,
 * investimento e transporte, que nada têm a ver com a coluna nova. A ordem entre
 * deploy e migration deixa de importar.
 */
async function fetchDestinos() {
  if (!supabase) throw new Error('supabase client ausente');
  const completo = await supabase.from('destinos').select(DESTINOS_SELECT);
  if (!completo.error) return completo;

  console.warn(
    'Supabase: `destinos.monitorado` indisponível — aplique supabase/migrations/0004_destinos_monitorado.sql. ' +
      'Seguindo sem a coluna; todo destino conta como monitorado.',
    completo.error
  );
  return supabase.from('destinos').select(DESTINOS_SELECT_SEM_MONITORADO);
}

async function fetchReferenceData(): Promise<void> {
  if (!supabase) return;

  const [destinosRes, ibgeRes, fluxoRes, investimentoRes, transporteRes] = await Promise.all([
    fetchDestinos(),
    supabase.from('ibge').select('populacao, area_km2, idh, leitos_hospitalares, escolas_publicas, municipios(nome)'),
    supabase.from('fluxo').select('fluxo_visitantes_mes, receita_estimada_milhoes, saturacao_turistica, hashtags, destinos(nome)'),
    supabase.from('investimento').select('investimento_infraestrutura_mil, saneamento_mil, turismo_mil, total_mil, ano, destinos(nome)'),
    supabase.from('transporte').select('voos_mensais, onibus_mensais, veiculos_terrestres_mensais, modal_principal, variacao_percentual, destinos(nome)'),
  ]);

  const anyError = destinosRes.error || ibgeRes.error || fluxoRes.error || investimentoRes.error || transporteRes.error;
  if (anyError) {
    console.warn('Supabase reference-data fetch failed, keeping static mock data:', anyError);
    return;
  }

  if (destinosRes.data && destinosRes.data.length > 0) {
    const { destinos, semCoordenada } = mapDestinoRows(
      destinosRes.data as unknown as DestinoRow[]
    );
    if (semCoordenada.length > 0) {
      console.warn(
        `Supabase: ${semCoordenada.length} destino(s) sem latitude/longitude ficaram de fora do catálogo.`,
        semCoordenada
      );
    }

    // Catálogo vazio depois do filtro seria pior que o estático: a home ficaria sem
    // nenhum destino. Nesse caso mantemos o mock, como no caminho de erro acima.
    if (destinos.length > 0) {
      replaceAll(destinosInfo, destinos);
    }
  }

  if (ibgeRes.data && ibgeRes.data.length > 0 && destinosInfo.length > 0) {
    const ibgeByMunicipio = new Map(
      ibgeRes.data.map((row) => [nomeRelacionado(row.municipios as RelacaoRow), row])
    );
    replaceAll(ibgeData, destinosInfo.map((d) => {
      const row = ibgeByMunicipio.get(d.municipio);
      return {
        destino: d.nome,
        municipio: d.municipio,
        populacao: row?.populacao || 0,
        area_km2: row?.area_km2 || 0,
        idh: row?.idh || 0,
        leitos_hospitalares: row?.leitos_hospitalares || 0,
        escolas_publicas: row?.escolas_publicas || 0,
      };
    }));
  }

  if (fluxoRes.data && fluxoRes.data.length > 0) {
    replaceAll(fluxoData, fluxoRes.data.map((f) => ({
      destino: nomeRelacionado(f.destinos as RelacaoRow) || '',
      fluxo_visitantes_mes: f.fluxo_visitantes_mes,
      receita_estimada_milhoes: f.receita_estimada_milhoes,
      saturacao_turistica: f.saturacao_turistica,
      hashtag_instagram: (f.hashtags && f.hashtags[0]) || '',
    })));
  }

  if (investimentoRes.data && investimentoRes.data.length > 0) {
    replaceAll(investimentosData, investimentoRes.data.map((i) => ({
      destino: nomeRelacionado(i.destinos as RelacaoRow) || '',
      investimento_infraestrutura_mil: i.investimento_infraestrutura_mil,
      investimento_saneamento_mil: i.saneamento_mil,
      investimento_turismo_mil: i.turismo_mil,
      total_mil: i.total_mil,
      ano: i.ano,
    })));
  }

  if (transporteRes.data && transporteRes.data.length > 0) {
    replaceAll(transporteData, transporteRes.data.map((t) => ({
      destino: nomeRelacionado(t.destinos as RelacaoRow) || '',
      voos_mensais: t.voos_mensais,
      onibus_mensais: t.onibus_mensais,
      veiculos_terrestres_mensais: t.veiculos_terrestres_mensais,
      modal_principal: MODAL_LABELS[t.modal_principal] || t.modal_principal,
      variacao_percentual: t.variacao_percentual,
    })));
  }

  if (typeof window !== 'undefined') {
    window.dispatchEvent(new Event(SYNC_EVENT));
  }
}

function syncReferenceDataFromSupabase(): Promise<void> {
  if (!isSupabaseConfigured) return Promise.resolve();
  if (!syncPromise) {
    syncPromise = fetchReferenceData().catch((err) => {
      console.warn('Supabase reference-data sync error, keeping static mock data:', err);
    });
  }
  return syncPromise;
}

/**
 * Call once near the top of any component that reads destinosInfo/ibgeData/fluxoData/
 * investimentosData/transporteData. Triggers a background Supabase fetch (once, shared
 * across all callers) and forces a re-render when real data lands, mutated in place.
 */
export function useSupabaseSync() {
  const [, setTick] = useState(0);

  useEffect(() => {
    const rerender = () => setTick((v) => v + 1);
    window.addEventListener(SYNC_EVENT, rerender);
    syncReferenceDataFromSupabase();
    return () => window.removeEventListener(SYNC_EVENT, rerender);
  }, []);
}
