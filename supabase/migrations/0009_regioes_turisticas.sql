-- ============================================================
-- Camada de IGR (Instância de Governança Regional) no modelo
-- ============================================================
--
-- O schema tinha `municipios` e `destinos`, mas nenhuma tabela de região
-- turística — a spec do ISA (§Próximos passos, item 2) já apontava isso como
-- a peça que falta antes de decidir quem pode suspender o quê:
--
--   B5  — suspensão de atrativo pela IGR (`destinos.status`)
--   B13 — papel "gestor de polo" (multi-tenancy por região)
--
-- `regioes_turisticas` nomeia os 5 polos já citados no comentário da coluna
-- `municipios.polo` (0001_schema.sql) e no relatório estratégico
-- (docs/startup/01-RELATORIO-ESTRATEGICO.md). A FK sai de `destinos`, não de
-- `municipios`, porque é o destino — não o município — que a IGR suspende.
--
-- Fora do escopo desta migration: atribuir a cada destino sua região. A
-- fronteira de qual município pertence a qual polo ainda não tem fonte
-- primária validada (item C3 do consolidado) — gravar um palpite aqui
-- travaria a suspensão errada no primeiro uso. A coluna nasce nula e a
-- atribuição fica para quando a IGR responsável confirmar a divisão.

create table if not exists regioes_turisticas (
  id         bigint generated always as identity primary key,
  nome       text not null unique,
  created_at timestamptz not null default now()
);

insert into regioes_turisticas (nome) values
  ('Costa das Dunas'),
  ('Costa Branca'),
  ('Seridó'),
  ('Serrano'),
  ('Agreste/Trairi')
on conflict (nome) do nothing;

alter table destinos
  add column if not exists regiao_turistica_id bigint references regioes_turisticas(id) on delete set null;

alter table regioes_turisticas enable row level security;

drop policy if exists regioes_turisticas_select_public on regioes_turisticas;
create policy regioes_turisticas_select_public on regioes_turisticas
  for select using (true);
