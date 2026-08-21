-- ============================================================
-- Feedbacks: insert deixa de ser público
-- ============================================================
--
-- A policy `feedbacks_insert_public` (0002) aceitava qualquer payload com a
-- chave anon: `with check (true)`. Depois que o ISA passou a pesar na rota,
-- isso virou uma alavanca — uma enxurrada de notas baixas derruba um destino
-- do roteiro. A avaliação no app já exige login (`/avaliar`); o banco agora
-- acompanha.
--
-- Quem avalia precisa de sessão (incluindo a anônima do cadastro por
-- documento) e o `usuario_id` gravado tem que ser o da linha de `usuarios`
-- daquela sessão. Sem isso, um JWT válido ainda poderia imputar a avaliação
-- em outra pessoa.
--
-- A leitura continua pública: a home e o painel calculam o ISA sem login.

drop policy if exists feedbacks_insert_public on feedbacks;

create policy feedbacks_insert_autenticado on feedbacks
  for insert
  to authenticated
  with check (
    usuario_id in (select id from usuarios where auth_uid = auth.uid())
  );

-- Um mesmo visitante não pode martelar o mesmo destino. 12h cobre o ciclo
-- típico de uma visita sem impedir quem volta no dia seguinte.
create or replace function feedbacks_limite_frequencia()
returns trigger
language plpgsql
set search_path = public
as $$
begin
  if new.usuario_id is null then
    raise exception 'Avaliação exige usuário autenticado.'
      using errcode = 'P0001';
  end if;

  if exists (
    select 1 from feedbacks
    where usuario_id = new.usuario_id
      and destino = new.destino
      and created_at > now() - interval '12 hours'
  ) then
    raise exception 'Você já avaliou este destino recentemente. Tente mais tarde.'
      using errcode = 'P0001';
  end if;

  return new;
end;
$$;

drop trigger if exists feedbacks_frequencia on feedbacks;
create trigger feedbacks_frequencia
  before insert on feedbacks
  for each row execute function feedbacks_limite_frequencia();

revoke execute on function public.feedbacks_limite_frequencia() from public, anon, authenticated;

create index if not exists feedbacks_usuario_destino_criado_idx
  on feedbacks (usuario_id, destino, created_at desc);
