'use client';

import { useEffect, useState } from 'react';
import { supabase, isSupabaseConfigured } from '@/lib/supabase';
import {
  destinosInfo,
  ibgeData,
  fluxoData,
  investimentosData,
  transporteData,
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

async function fetchReferenceData(): Promise<void> {
  if (!supabase) return;

  const [destinosRes, ibgeRes, fluxoRes, investimentoRes, transporteRes] = await Promise.all([
    supabase.from('destinos').select('nome, descricao, imagem, latitude, longitude, hashtags, municipios(nome)'),
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

  type MunicipioRow = { nome: string } | { nome: string }[] | null;
  const municipioNome = (m: MunicipioRow) => Array.isArray(m) ? m[0]?.nome : m?.nome;
  const destinoNome = (d: MunicipioRow) => Array.isArray(d) ? d[0]?.nome : d?.nome;

  if (destinosRes.data && destinosRes.data.length > 0) {
    replaceAll(destinosInfo, destinosRes.data.map((d) => ({
      nome: d.nome,
      municipio: municipioNome(d.municipios as MunicipioRow) || '',
      descricao: d.descricao || '',
      imagem: d.imagem || '',
      latitude: d.latitude,
      longitude: d.longitude,
      atracoes: [],
      hashtag: (d.hashtags && d.hashtags[0]) || '',
    })));
  }

  if (ibgeRes.data && ibgeRes.data.length > 0 && destinosInfo.length > 0) {
    const ibgeByMunicipio = new Map(
      ibgeRes.data.map((row) => [municipioNome(row.municipios as MunicipioRow), row])
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
      destino: destinoNome(f.destinos as MunicipioRow) || '',
      fluxo_visitantes_mes: f.fluxo_visitantes_mes,
      receita_estimada_milhoes: f.receita_estimada_milhoes,
      saturacao_turistica: f.saturacao_turistica,
      hashtag_instagram: (f.hashtags && f.hashtags[0]) || '',
    })));
  }

  if (investimentoRes.data && investimentoRes.data.length > 0) {
    replaceAll(investimentosData, investimentoRes.data.map((i) => ({
      destino: destinoNome(i.destinos as MunicipioRow) || '',
      investimento_infraestrutura_mil: i.investimento_infraestrutura_mil,
      investimento_saneamento_mil: i.saneamento_mil,
      investimento_turismo_mil: i.turismo_mil,
      total_mil: i.total_mil,
      ano: i.ano,
    })));
  }

  if (transporteRes.data && transporteRes.data.length > 0) {
    replaceAll(transporteData, transporteRes.data.map((t) => ({
      destino: destinoNome(t.destinos as MunicipioRow) || '',
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
