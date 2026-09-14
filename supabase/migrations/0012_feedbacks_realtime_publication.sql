-- ============================================================
-- Realtime: publica feedbacks para os assinantes (subscribeFeedbacks)
-- ============================================================
--
-- BRU-12: a home assina `postgres_changes` INSERT em `feedbacks`
-- (src/lib/feedbacks.ts, subscribeFeedbacks), mas o canal nunca recebe
-- evento em produção — verificado em 10/09 com um insert real pela chave
-- anon: login anônimo ok, canal chega a SUBSCRIBED, insert aceito pela RLS,
-- e nenhum evento chega em 30s. A RLS de leitura já é pública
-- (`feedbacks_select_public`, 0002), então o que falta é a tabela nunca
-- ter entrado na publicação do Realtime — passo que normalmente é feito
-- manualmente no dashboard (como A7, Anonymous sign-ins) e não existia
-- em nenhuma migration.

do $$
begin
  if not exists (
    select 1 from pg_publication_tables
    where pubname = 'supabase_realtime'
      and schemaname = 'public'
      and tablename = 'feedbacks'
  ) then
    alter publication supabase_realtime add table feedbacks;
  end if;
end $$;
