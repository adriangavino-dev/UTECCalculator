-- =====================================================================
-- Etiquetas de búsqueda para los cursos
--
-- Palabras extra con las que se puede encontrar un curso en el buscador
-- (ej. "mate 2", "discretas"). No se muestran en la página.
--
-- Cómo instalarlo: Supabase → SQL Editor → pegar este archivo → Run.
-- Se puede volver a correr sin problema.
-- =====================================================================

alter table public.cursos
  add column if not exists etiquetas text[] not null default '{}';
