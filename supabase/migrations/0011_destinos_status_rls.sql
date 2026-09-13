-- ============================================================
-- destinos.status escrevível pela gestão (B5) — RLS de UPDATE
-- ============================================================
--
-- `destinos` sempre teve `status` com o check ('ATIVO','EM_ANALISE','INATIVO',
-- 'SUSPENSO') (0001), mas nunca ganhou policy de escrita — 0002 só criou
-- `destinos_select_public`. A spec ISA (§Próximos passos, item 1) apontava
-- isso como bloqueado por falta de sessão Supabase no navegador (`auth.uid()`
-- vinha NULL); a 0006 fechou esse gap (auth migrado de Firebase para
-- Supabase). O bloqueio que sobrou é só a ausência da policy — sem ela, RLS
-- habilitada + zero policy de update nega a escrita para qualquer um, sessão
-- ou não.
--
-- Não existe papel de IGR separado no banco (usuarios.role só aceita
-- 'tourist'|'admin' — ver 0006; papel de "gestor de polo" é item futuro,
-- B13 do consolidado). Até essa multi-tenancy existir, quem gerencia o
-- catálogo pela área /gestao é o admin, mesmo ator que já enxerga
-- destinos/cidades no painel.

create policy destinos_update_admin on destinos
  for update
  to authenticated
  using (
    auth.uid() in (select auth_uid from usuarios where role = 'admin')
  )
  with check (
    auth.uid() in (select auth_uid from usuarios where role = 'admin')
  );
