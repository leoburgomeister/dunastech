-- ============================================================
-- Auth no Supabase — alinha `usuarios` com o app e fecha a auto-elevação
-- ============================================================
--
-- A tabela `usuarios` já nasceu desenhada para o Supabase Auth (`auth_uid` +
-- policies em `auth.uid()`), mas o app nunca chegou a usá-la: o login vivia no
-- Firebase. Duas coisas impediam a troca:
--
--   1. VOCABULÁRIO. O check aceitava ('user','admin') enquanto `PotiUser.role` é
--      'tourist' | 'admin'. Gravar o papel que o app usa violaria o constraint —
--      o primeiro cadastro real falharia.
--
--   2. AUTO-ELEVAÇÃO. `usuarios_upsert_own` só confere `auth_uid = auth.uid()`,
--      então o próprio cliente podia gravar `role = 'admin'` na sua linha. Como
--      `AdminLayout` libera /gestao por `role === 'admin'`, isso seria o mesmo
--      buraco do login por CPF, agora pela porta do banco. Papel é decisão de
--      backoffice: quem promove é a service role, nunca o navegador.

-- ---------- 1. Vocabulário de papéis ----------
alter table usuarios drop constraint if exists usuarios_role_check;
update usuarios set role = 'tourist' where role = 'user';
alter table usuarios alter column role set default 'tourist';
alter table usuarios add constraint usuarios_role_check
  check (role in ('tourist', 'admin'));

-- ---------- 2. Papel é imutável pelo cliente ----------
create or replace function usuarios_bloqueia_autoelevacao()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  -- A service role (rota de API com a chave secreta, backoffice) define qualquer papel.
  if coalesce(auth.role(), '') = 'service_role' then
    return new;
  end if;

  if tg_op = 'INSERT' then
    -- Cadastro sempre nasce turista, independente do que o cliente mandou.
    new.role := 'tourist';
  elsif new.role is distinct from old.role then
    -- Update do próprio perfil pode trocar nome/foto, nunca o papel.
    new.role := old.role;
  end if;

  return new;
end;
$$;

drop trigger if exists usuarios_papel_imutavel on usuarios;
create trigger usuarios_papel_imutavel
  before insert or update on usuarios
  for each row execute function usuarios_bloqueia_autoelevacao();

-- Toda função no schema `public` também vira RPC em /rest/v1/rpc/. Esta é gatilho e
-- `security definer`: exposta, seria uma função privilegiada chamável por qualquer um
-- com a chave anon. O advisor de segurança do Supabase sinaliza exatamente isso.
revoke execute on function public.usuarios_bloqueia_autoelevacao() from public, anon, authenticated;

-- ---------- 3. Autor do feedback ----------
-- `feedbacks_modify_owner` já amarra o update ao dono. Faltava o par no delete:
-- o comentário da 0002 prometia "altera/apaga" e só a policy de update existia,
-- então nada escrito podia ser removido pelo app.
drop policy if exists feedbacks_delete_owner on feedbacks;
create policy feedbacks_delete_owner on feedbacks
  for delete using (
    usuario_id in (select id from usuarios where auth_uid = auth.uid())
  );
