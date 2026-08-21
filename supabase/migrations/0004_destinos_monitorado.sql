-- ============================================================
-- destinos.monitorado — o campo que o app já usava e o banco não tinha
-- ============================================================
--
-- `monitorado` marca o destino que tem observação ativa (sensor/contagem).
-- O app depende dele em dois lugares:
--
--   1. TouristHomePage — quando o filtro da home não casa com nada, o mapa cai
--      em `destinations.filter(d => d.monitorado)` para nunca ficar vazio;
--   2. route-planner — `MONITORED_BONUS` desempata a favor do destino monitorado.
--
-- Até aqui o campo só existia no catálogo estático (`mockData.ts`). A sincronização
-- com o Supabase montava os destinos sem ele, então em produção `monitorado` vinha
-- `undefined`: o fallback do mapa devolvia lista vazia — justamente o caso que ele
-- existe para cobrir — e o desempate do planejador virava peso morto.
--
-- O default é `true` porque o catálogo é de destinos observados; a exceção é curta
-- e vai explícita abaixo.

alter table destinos
  add column if not exists monitorado boolean not null default true;

update destinos set monitorado = false
where nome in (
  'Canyon dos Apertados',
  'Estátua de Santa Rita de Cássia',
  'Castelo de Bivar'
);
