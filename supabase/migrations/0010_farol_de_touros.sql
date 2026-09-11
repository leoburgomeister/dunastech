-- ============================================================
-- Catálogo intermediário: Farol de Touros (BRU-19 / consolidado B9)
-- ============================================================
--
-- Entre Parrachos de Maracajaú (Maxaranguape) e São Miguel do Gostoso não havia
-- nenhum destino cadastrado, e a "Grande Rota Histórica" (Forte dos Reis Magos ->
-- Cidade Histórica de Mossoró) tinha 246 km sem parada. O planejador de roteiros
-- (`route-planner.ts`) só encaixa um destino de preenchimento dentro do alcance do
-- transporte a partir do que já foi escolhido — sem um ponto no meio do litoral
-- norte, buggy e a pé não tinham como crescer nessa direção.
--
-- Farol de Touros (Ponta do Calcanhar, ponto mais oriental do litoral do RN) fica
-- a meio caminho entre os dois — ~29 km de Maracajaú, ~21 km de Gostoso — e é
-- atrativo histórico real (farol + vila de pescadores), não um preenchimento
-- artificial. Mesmos valores já usados em `src/data/mockData.ts`.
--
-- `atracoes`, `ibge`, `fluxo`, `investimento` e `transporte` não têm unique (ver
-- 0005_seed_atracoes.sql), então o guard de idempotência aqui é `where not
-- exists`, igual ao resto do repositório — reaplicar a migration não duplica linha.

insert into municipios (nome, uf) values
  ('Touros', 'RN')
on conflict (nome, uf) do nothing;

insert into destinos (nome, descricao, municipio_id, latitude, longitude, hashtags, imagem, status) values
  (
    'Farol de Touros',
    'Farol erguido na Ponta do Calcanhar, o ponto mais oriental do litoral potiguar, na foz do Rio Cabelo em Touros. Fica a meio caminho entre os Parrachos de Maracajaú e São Miguel do Gostoso, cercado por dunas móveis e uma vila de pescadores com forte tradição na pesca da lagosta.',
    (select id from municipios where nome = 'Touros' and uf = 'RN'),
    -5.1997,
    -35.4603,
    ARRAY['faroldetouros']::text[],
    '',
    'ATIVO'
  )
on conflict (nome) do nothing;

insert into atracoes (destino_id, nome, descricao, tipo)
select v.destino_id, v.nome, v.descricao, v.tipo
from (values
  (
    (select id from destinos where nome = 'Farol de Touros'),
    'Subida ao Farol da Ponta do Calcanhar',
    'Vista panorâmica do encontro do Rio Cabelo com o mar, no ponto mais oriental do litoral do RN.',
    'ATIVIDADE'
  )
) as v(destino_id, nome, descricao, tipo)
where not exists (
  select 1 from atracoes a where a.destino_id = v.destino_id and a.nome = v.nome
);

insert into ibge (municipio_id, populacao, area_km2, idh, leitos_hospitalares, escolas_publicas)
select v.municipio_id, v.populacao, v.area_km2, v.idh, v.leitos, v.escolas
from (values
  ((select id from municipios where nome = 'Touros' and uf = 'RN'), 21325, 313.6::numeric, 0.593::numeric, 5, 14)
) as v(municipio_id, populacao, area_km2, idh, leitos, escolas)
where not exists (
  select 1 from ibge i where i.municipio_id = v.municipio_id
);

insert into fluxo (destino_id, mes, ano, fluxo_visitantes_mes, receita_estimada_milhoes, saturacao_turistica, hashtags)
select v.destino_id, v.mes, v.ano, v.fluxo, v.receita, v.saturacao, v.hashtags
from (values
  ((select id from destinos where nome = 'Farol de Touros'), 6, 2026, 16000, 4.6::numeric, 32::numeric, ARRAY['faroldetouros']::text[])
) as v(destino_id, mes, ano, fluxo, receita, saturacao, hashtags)
where not exists (
  select 1 from fluxo f where f.destino_id = v.destino_id and f.mes = v.mes and f.ano = v.ano
);

insert into investimento (destino_id, ano, investimento_infraestrutura_mil, saneamento_mil, turismo_mil, total_mil)
select v.destino_id, v.ano, v.infra, v.saneamento, v.turismo, v.total
from (values
  ((select id from destinos where nome = 'Farol de Touros'), 2026, 1150::numeric, 800::numeric, 700::numeric, 2650::numeric)
) as v(destino_id, ano, infra, saneamento, turismo, total)
where not exists (
  select 1 from investimento inv where inv.destino_id = v.destino_id and inv.ano = v.ano
);

insert into transporte (destino_id, mes, ano, voos_mensais, onibus_mensais, veiculos_terrestres_mensais, modal_principal, variacao_percentual)
select v.destino_id, v.mes, v.ano, v.voos, v.onibus, v.veiculos, v.modal, v.variacao
from (values
  ((select id from destinos where nome = 'Farol de Touros'), 6, 2026, 0, 110, 6800, 'RODOVIARIO', 19)
) as v(destino_id, mes, ano, voos, onibus, veiculos, modal, variacao)
where not exists (
  select 1 from transporte t where t.destino_id = v.destino_id and t.mes = v.mes and t.ano = v.ano
);
