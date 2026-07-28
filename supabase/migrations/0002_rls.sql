-- ============================================================
-- DunasTech / POTI — Row Level Security
-- Regra: leitura pública nas tabelas de referência e analíticas;
-- feedbacks com insert público (turista não logado avalia) + leitura pública;
-- usuarios restrito ao próprio dono. Service role (server) ignora RLS.
-- ============================================================

-- Habilita RLS em tudo
alter table municipios          enable row level security;
alter table destinos            enable row level security;
alter table atracoes            enable row level security;
alter table imagens_destino     enable row level security;
alter table parceiros_cadastur  enable row level security;
alter table parceiro_atracao    enable row level security;
alter table usuarios            enable row level security;
alter table feedbacks           enable row level security;
alter table ibge                enable row level security;
alter table fluxo               enable row level security;
alter table investimento        enable row level security;
alter table transporte          enable row level security;

-- ---------- Leitura pública (referência + analíticas) ----------
do $$
declare t text;
begin
  foreach t in array array[
    'municipios','destinos','atracoes','imagens_destino',
    'parceiros_cadastur','parceiro_atracao','ibge','fluxo','investimento','transporte'
  ] loop
    execute format(
      'create policy %I on %I for select using (true);',
      t || '_select_public', t
    );
  end loop;
end $$;

-- ---------- Feedbacks ----------
-- Qualquer visitante pode enviar avaliação (inclusive anônimo) e ler as avaliações.
create policy feedbacks_select_public on feedbacks
  for select using (true);

create policy feedbacks_insert_public on feedbacks
  for insert with check (true);

-- Só o autor (ou admin) altera/apaga a própria avaliação.
create policy feedbacks_modify_owner on feedbacks
  for update using (
    usuario_id in (select id from usuarios where auth_uid = auth.uid())
  );

-- ---------- Usuários ----------
-- Cada um lê/edita apenas o próprio registro.
create policy usuarios_select_own on usuarios
  for select using (auth_uid = auth.uid());

create policy usuarios_upsert_own on usuarios
  for insert with check (auth_uid = auth.uid());

create policy usuarios_update_own on usuarios
  for update using (auth_uid = auth.uid());

-- NOTA: operações administrativas (seed, painel B2G agregado, criação de usuário
-- via fluxo CPF sem sessão) usam a SERVICE ROLE KEY no servidor, que ignora RLS.
-- Nunca expor a service role key no cliente.
