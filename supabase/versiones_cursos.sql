-- =====================================================================
-- Historial de versiones de los cursos
--
-- Cada vez que alguien crea, edita o borra un curso (desde la app o desde
-- el SQL Editor), se guarda una copia completa en cursos_versiones.
-- Así cualquier cambio se puede deshacer.
--
-- Cómo instalarlo: Supabase → SQL Editor → pegar todo este archivo → Run.
-- Se puede volver a correr sin problema.
-- =====================================================================

create table if not exists public.cursos_versiones (
  version_id bigint generated always as identity primary key,
  curso_id   text        not null,
  accion     text        not null,  -- 'inicial' | 'crear' | 'editar' | 'borrar'
  datos      jsonb       not null,  -- la fila completa del curso en ese momento
  hecho_por  uuid        default auth.uid(),
  hecho_en   timestamptz not null default now()
);

create index if not exists cursos_versiones_curso_idx
  on public.cursos_versiones (curso_id, hecho_en desc);

-- Guarda la versión nueva al crear/editar, y la que había al borrar
create or replace function public.guardar_version_curso()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if tg_op = 'DELETE' then
    insert into cursos_versiones (curso_id, accion, datos)
    values (old.id, 'borrar', to_jsonb(old));
    return old;
  end if;

  insert into cursos_versiones (curso_id, accion, datos)
  values (new.id, case when tg_op = 'INSERT' then 'crear' else 'editar' end, to_jsonb(new));
  return new;
end;
$$;

drop trigger if exists cursos_versionar on public.cursos;
create trigger cursos_versionar
  after insert or update or delete on public.cursos
  for each row execute function public.guardar_version_curso();

-- Punto de partida: la versión actual de cada curso (solo la primera vez)
insert into public.cursos_versiones (curso_id, accion, datos)
select c.id, 'inicial', to_jsonb(c)
from public.cursos c
where not exists (select 1 from public.cursos_versiones v where v.curso_id = c.id);

-- Solo los admins pueden ver el historial; nadie puede modificarlo desde la app
alter table public.cursos_versiones enable row level security;
drop policy if exists "Admins leen versiones" on public.cursos_versiones;
create policy "Admins leen versiones" on public.cursos_versiones
  for select to authenticated
  using (exists (select 1 from public.admins a where a.user_id = auth.uid()));


-- =====================================================================
-- CÓMO USARLO
-- =====================================================================
--
-- 1) Ver las versiones de un curso (la más reciente arriba):
--
--    select version_id, accion, hecho_en, datos->'sistema' as sistema
--    from cursos_versiones
--    where curso_id = 'CC1103'
--    order by hecho_en desc;
--
-- 2) Volver a una versión (sirve también si el curso fue borrado).
--    Cambia 123 por el version_id que quieras recuperar:
--
--    insert into cursos
--    select (jsonb_populate_record(null::cursos, datos)).*
--    from cursos_versiones
--    where version_id = 123
--    on conflict (id) do update
--      set nombre = excluded.nombre,
--          carrera = excluded.carrera,
--          sistema = excluded.sistema;
