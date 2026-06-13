-- ============================================
-- SEED: migración de cursos a Supabase (DATA OFICIAL)
-- Generado automáticamente desde cursos.json oficial.
-- UPSERT: si el id ya existe, lo actualiza con los datos nuevos.
-- ============================================

insert into public.cursos (id, nombre, carrera, sistema) values (
  'CS1022',
  'Matemáticas Discretas II',
  array['Ciencia de la Computación', 'Sistemas de Información'],
  '{"EC1":{"peso":0.2,"subNotas":{"Tests":0.5,"PC1":0.5}},"EC2":{"peso":0.2,"subNotas":{"PC2":0.5,"Tests":0.5}},"EP":0.3,"EF":0.3}'::jsonb
)
on conflict (id) do update set
  nombre = excluded.nombre,
  carrera = excluded.carrera,
  sistema = excluded.sistema,
  updated_at = now();

insert into public.cursos (id, nombre, carrera, sistema) values (
  'CS2041',
  'Base de Datos I',
  array['Ciencia de la Computación'],
  '{"EC1":{"peso":0.1,"subNotas":{"Lab 1":0.142857,"Lab 2":0.142857,"Lab 3":0.142857,"Lab 4":0.142857,"Lab 5":0.142857,"Lab 6":0.142857,"Lab 7":0.142857}},"EC2":{"peso":0.1,"subNotas":{"Lab 8":0.142857,"Lab 9":0.142857,"Lab 10":0.142857,"Lab 11":0.142857,"Lab 12":0.142857,"Lab 13":0.142857,"Lab 14":0.142857}},"P1":0.1,"P2":0.2,"EP":0.25,"EF":0.25}'::jsonb
)
on conflict (id) do update set
  nombre = excluded.nombre,
  carrera = excluded.carrera,
  sistema = excluded.sistema,
  updated_at = now();

insert into public.cursos (id, nombre, carrera, sistema) values (
  'CS2031',
  'Desarrollo Basado en Plataformas',
  array['Ciencia de la Computación'],
  '{"EC1":{"peso":0.1,"subNotas":{"Quiz 1":0.044444,"Quiz 2":0.044444,"Quiz 3":0.044444,"Quiz 4":0.044444,"Quiz 5":0.044444,"Quiz 6":0.044444,"Quiz 7":0.044444,"Quiz 8":0.044444,"Quiz 9":0.044444,"Hackathon 0":0.3,"Hackathon 1":0.3}},"EC2":{"peso":0.1,"subNotas":{"Quiz 10":0.04,"Quiz 11":0.04,"Quiz 12":0.04,"Quiz 13":0.04,"Quiz 14":0.04,"Postman":0.1,"Laboratorio E2E Backend":0.2,"Laboratorio E2E Frontend":0.2,"Hackathon 2":0.3}},"P1":0.2,"P2":0.2,"EP":0.2,"EF":0.2}'::jsonb
)
on conflict (id) do update set
  nombre = excluded.nombre,
  carrera = excluded.carrera,
  sistema = excluded.sistema,
  updated_at = now();

insert into public.cursos (id, nombre, carrera, sistema) values (
  'CC2101',
  'Ecuaciones Diferenciales',
  array['Ciencia de la Computación'],
  '{"EC1":{"peso":0.25,"subNotas":{"Quiz 1":0.233,"Quiz 2":0.233,"Quiz 3":0.233,"Tarea 1":0.05,"Tarea 2":0.05,"AG 1":0.05,"AG 2":0.05,"ABP 1":0.1}},"EC2":{"peso":0.25,"subNotas":{"Quiz 4":0.2,"Quiz 5":0.2,"Quiz 6":0.2,"Tarea 3":0.05,"Tarea 4":0.05,"AG 3":0.05,"AG 4":0.05,"ABP 2":0.2}},"EP":0.2,"EF":0.3}'::jsonb
)
on conflict (id) do update set
  nombre = excluded.nombre,
  carrera = excluded.carrera,
  sistema = excluded.sistema,
  updated_at = now();

insert into public.cursos (id, nombre, carrera, sistema) values (
  'CS2013',
  'Programación III',
  array['Ciencia de la Computación'],
  '{"EC1":0.15,"EC2":0.15,"P1":0.1,"P2":0.2,"EP":0.1,"EF":0.3}'::jsonb
)
on conflict (id) do update set
  nombre = excluded.nombre,
  carrera = excluded.carrera,
  sistema = excluded.sistema,
  updated_at = now();

insert into public.cursos (id, nombre, carrera, sistema) values (
  'CC1105',
  'Estadística y Probabilidades I',
  array['Ciencia de la Computación'],
  '{"Quiz 1":0.05,"Quiz 2":0.05,"Tarea 1":0.1,"Tarea 2":0.1,"PG1":0.15,"PG2":0.15,"EP":0.2,"EF":0.2}'::jsonb
)
on conflict (id) do update set
  nombre = excluded.nombre,
  carrera = excluded.carrera,
  sistema = excluded.sistema,
  updated_at = now();

insert into public.cursos (id, nombre, carrera, sistema) values (
  'CC1103',
  'Álgebra Lineal',
  array['Ciencia de la Computación'],
  '{"EC1":{"peso":0.2,"subNotas":{"EA1":0.45,"EA2":0.45,"AP1":0.016667,"AP2":0.016667,"AP3":0.016667,"AP4":0.016667,"AP5":0.016667,"AP6":0.016667}},"EC2":{"peso":0.3,"subNotas":{"EA3":0.3,"EA4":0.3,"AP7":0.011111,"AP8":0.011111,"AP9":0.011111,"AP10":0.011111,"AP11":0.011111,"AP12":0.011111,"RC1":0.166667,"RC2":0.166667}},"Examen Parcial":0.2,"Examen Final":0.3}'::jsonb
)
on conflict (id) do update set
  nombre = excluded.nombre,
  carrera = excluded.carrera,
  sistema = excluded.sistema,
  updated_at = now();