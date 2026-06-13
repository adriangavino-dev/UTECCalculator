-- ============================================================
-- TANDA 4 — Owner + gestión de admins + historial de cambios
-- Pega TODO esto en el SQL Editor de Supabase y dale Run.
-- ============================================================

-- ------------------------------------------------------------
-- 1) Nivel "owner": columna rol en admins
-- ------------------------------------------------------------
alter table public.admins
  add column if not exists rol text not null default 'admin';

-- Conviértete en OWNER (cambia el email por el TUYO):
update public.admins
  set rol = 'owner'
  where email = 'TU-EMAIL@gmail.com';

-- ------------------------------------------------------------
-- 2) Helper: ¿el usuario actual es owner?
-- ------------------------------------------------------------
create or replace function public.is_owner()
returns boolean
language sql
security definer
stable
as $$
  select exists (
    select 1 from public.admins
    where user_id = auth.uid() and rol = 'owner'
  );
$$;

-- ------------------------------------------------------------
-- 3) RLS de admins: el owner puede ver/gestionar todos
-- ------------------------------------------------------------
-- (ya existe "admins_select_self"; agregamos las del owner)
drop policy if exists "admins_select_owner" on public.admins;
create policy "admins_select_owner"
  on public.admins for select
  using (public.is_owner());

drop policy if exists "admins_insert_owner" on public.admins;
create policy "admins_insert_owner"
  on public.admins for insert
  with check (public.is_owner());

drop policy if exists "admins_update_owner" on public.admins;
create policy "admins_update_owner"
  on public.admins for update
  using (public.is_owner());

drop policy if exists "admins_delete_owner" on public.admins;
create policy "admins_delete_owner"
  on public.admins for delete
  using (public.is_owner());

-- ------------------------------------------------------------
-- 4) Funciones seguras para agregar/quitar admins por email
--    (buscan en auth.users, que no es accesible directo)
-- ------------------------------------------------------------
create or replace function public.agregar_admin(p_email text)
returns text
language plpgsql
security definer
as $$
declare v_uid uuid;
begin
  if not public.is_owner() then
    return 'NO_AUTORIZADO';
  end if;

  select id into v_uid
  from auth.users
  where lower(email) = lower(p_email)
  limit 1;

  if v_uid is null then
    return 'USUARIO_NO_ENCONTRADO';
  end if;

  insert into public.admins (user_id, email, rol)
  values (v_uid, lower(p_email), 'admin')
  on conflict (user_id) do nothing;

  return 'OK';
end;
$$;

create or replace function public.quitar_admin(p_user_id uuid)
returns text
language plpgsql
security definer
as $$
begin
  if not public.is_owner() then
    return 'NO_AUTORIZADO';
  end if;

  if exists (select 1 from public.admins where user_id = p_user_id and rol = 'owner') then
    return 'NO_PUEDE_QUITAR_OWNER';
  end if;

  delete from public.admins where user_id = p_user_id;
  return 'OK';
end;
$$;

-- ------------------------------------------------------------
-- 5) Historial de cambios de cursos
-- ------------------------------------------------------------
create table if not exists public.cursos_log (
  id           bigint generated always as identity primary key,
  curso_id     text,
  accion       text,            -- 'crear' | 'editar' | 'eliminar'
  actor_id     uuid,
  actor_email  text,
  created_at   timestamptz default now()
);

alter table public.cursos_log enable row level security;

-- Admins (y owner) pueden leer el historial
drop policy if exists "log_select_admin" on public.cursos_log;
create policy "log_select_admin"
  on public.cursos_log for select
  using (public.is_admin());

-- Trigger: registra cada cambio en cursos automáticamente
create or replace function public.log_curso_cambio()
returns trigger
language plpgsql
security definer
as $$
declare
  v_accion text;
  v_curso_id text;
begin
  if (TG_OP = 'INSERT') then
    v_accion := 'crear'; v_curso_id := NEW.id;
  elsif (TG_OP = 'UPDATE') then
    v_accion := 'editar'; v_curso_id := NEW.id;
  elsif (TG_OP = 'DELETE') then
    v_accion := 'eliminar'; v_curso_id := OLD.id;
  end if;

  insert into public.cursos_log (curso_id, accion, actor_id, actor_email)
  values (
    v_curso_id,
    v_accion,
    auth.uid(),
    coalesce(auth.jwt() ->> 'email', 'desconocido')
  );

  if (TG_OP = 'DELETE') then return OLD; else return NEW; end if;
end;
$$;

drop trigger if exists trg_cursos_log on public.cursos;
create trigger trg_cursos_log
  after insert or update or delete on public.cursos
  for each row execute function public.log_curso_cambio();

-- ------------------------------------------------------------
-- LISTO. Verifica:
--   select email, rol from public.admins;   -- tú debes salir 'owner'
-- ------------------------------------------------------------
