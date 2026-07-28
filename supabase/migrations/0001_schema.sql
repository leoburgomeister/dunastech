-- ============================================================
-- DunasTech / POTI — Schema inicial (Supabase / PostgreSQL)
-- Espelha diagrama-classes-dunastech.drawio e os tipos do app.
-- IMPORTANTE: feedbacks usa BOOLEANOS nas 8 dimensões + nota_geral int,
-- para compatibilidade direta com o tipo `Feedback` em src/data/mockData.ts.
-- Validar contra o projeto Supabase real antes de considerar final.
-- ============================================================

-- ---------- Referência geográfica ----------
create table if not exists municipios (
  id           bigint generated always as identity primary key,
  nome         text not null,
  uf           text not null default 'RN',
  polo         text,                       -- Costa das Dunas | Costa Branca | Seridó | Serrano | Agreste/Trairi
  unique (nome, uf)
);

create table if not exists destinos (
  id           bigint generated always as identity primary key,
  nome         text not null unique,
  descricao    text,
  municipio_id bigint references municipios(id) on delete set null,
  latitude     double precision,
  longitude    double precision,
  hashtags     text[] default '{}',
  status       text not null default 'ATIVO'
                 check (status in ('ATIVO','EM_ANALISE','INATIVO','SUSPENSO')),
  imagem       text,
  created_at   timestamptz not null default now()
);

create table if not exists atracoes (
  id           bigint generated always as identity primary key,
  nome         text not null,
  descricao    text,
  destino_id   bigint references destinos(id) on delete cascade,
  tipo         text
);

create table if not exists imagens_destino (
  id           bigint generated always as identity primary key,
  destino_id   bigint references destinos(id) on delete cascade,
  url          text not null,
  principal    boolean not null default false
);

-- ---------- Cadastur (parceiros regularizados) ----------
create table if not exists parceiros_cadastur (
  id              bigint generated always as identity primary key,
  codigo_cadastur text,
  cnpj            text,
  razao           text,
  fantasia        text,
  tipo            text,                    -- TipoParceiro (agencia, meio_hospedagem, guia, etc.)
  regularizado    boolean not null default true,
  telefone        text,
  email           text,
  instagram       text,
  site            text,
  municipio_id    bigint references municipios(id) on delete set null,
  latitude        double precision,
  longitude       double precision,
  created_at      timestamptz not null default now()
);

create table if not exists parceiro_atracao (
  id            bigint generated always as identity primary key,
  parceiro_id   bigint references parceiros_cadastur(id) on delete cascade,
  atracao_id    bigint references atracoes(id) on delete cascade,
  preco         numeric(10,2),
  dia_semana    text check (dia_semana in
                  ('SEGUNDA','TERCA','QUARTA','QUINTA','SEXTA','SABADO','DOMINGO')),
  hora_inicio   time,
  hora_fim      time,
  duracao_min   integer,
  capacidade    integer,
  observacoes   text,
  link_reserva  text,
  ativo         boolean not null default true
);

-- ---------- Usuários (espelha PotiUser) ----------
create table if not exists usuarios (
  id            uuid primary key default gen_random_uuid(),
  auth_uid      uuid unique,               -- vínculo com auth.users (Supabase Auth)
  email         text,
  display_name  text,
  photo_url     text,
  cpf           text unique,
  role          text not null default 'user' check (role in ('user','admin')),
  provider      text,                      -- google | cpf
  created_at    timestamptz not null default now()
);

-- ---------- Feedbacks (registro ISA) ----------
-- 8 dimensões booleanas + nota_geral (0..5), compatível com o app atual.
create table if not exists feedbacks (
  id             uuid primary key default gen_random_uuid(),
  destino        text not null,            -- nome do destino (como no app hoje)
  usuario_id     uuid references usuarios(id) on delete set null,
  nota_geral     integer not null check (nota_geral between 0 and 5),
  limpo          boolean not null default false,
  sinalizado     boolean not null default false,
  preservado     boolean not null default false,
  acessibilidade boolean not null default false,
  seguranca      boolean not null default false,
  custo_beneficio boolean not null default false,
  conservacao    boolean not null default false,
  superlotado    boolean not null default false,
  comentario     text,
  created_at     timestamptz not null default now()
);
create index if not exists feedbacks_destino_idx on feedbacks (destino);
create index if not exists feedbacks_created_idx on feedbacks (created_at desc);

-- ---------- Analíticas do observatório (por destino / período) ----------
create table if not exists ibge (
  id                   bigint generated always as identity primary key,
  municipio_id         bigint references municipios(id) on delete cascade,
  populacao            integer,
  area_km2             numeric(12,2),
  idh                  numeric(4,3),
  leitos_hospitalares  integer,
  escolas_publicas     integer
);

create table if not exists fluxo (
  id                        bigint generated always as identity primary key,
  destino_id                bigint references destinos(id) on delete cascade,
  mes                       integer check (mes between 1 and 12),
  ano                       integer,
  fluxo_visitantes_mes      integer,
  receita_estimada_milhoes  numeric(12,2),
  saturacao_turistica       numeric(5,2),
  hashtags                  text[] default '{}'
);

create table if not exists investimento (
  id                            bigint generated always as identity primary key,
  destino_id                    bigint references destinos(id) on delete cascade,
  ano                           integer,
  investimento_infraestrutura_mil numeric(12,2),
  saneamento_mil                numeric(12,2),
  turismo_mil                   numeric(12,2),
  total_mil                     numeric(12,2)
);

create table if not exists transporte (
  id                          bigint generated always as identity primary key,
  destino_id                  bigint references destinos(id) on delete cascade,
  mes                         integer check (mes between 1 and 12),
  ano                         integer,
  voos_mensais                integer,
  onibus_mensais              integer,
  veiculos_terrestres_mensais integer,
  modal_principal             text check (modal_principal in
                                ('AEREO','RODOVIARIO','FERROVIARIO','MARITIMO')),
  variacao_percentual         numeric(6,2)
);
