-- ============================================
-- HACERTE ADMIN
-- ============================================
-- IMPORTANTE: primero tienes que haber iniciado sesión
-- con Google en la app AL MENOS UNA VEZ. Eso crea tu
-- usuario en auth.users. Después corre esto.
--
-- Reemplaza el email por el tuyo (el de Google con el que entraste).
-- ============================================

insert into public.admins (user_id, email)
select id, email
from auth.users
where email = 'adrian.gavino@utec.edu.pe'
on conflict (user_id) do nothing;


-- ============================================
-- AGREGAR OTROS ADMINS (colaboradores)
-- ============================================
-- Cada colaborador debe entrar con Google una vez primero.
-- Luego agrégalos así (uno por uno o varios):

-- insert into public.admins (user_id, email)
-- select id, email
-- from auth.users
-- where email in ('amigo1@gmail.com', 'amigo2@gmail.com')
-- on conflict (user_id) do nothing;


-- ============================================
-- VER QUIÉNES SON ADMINS ACTUALMENTE
-- ============================================
-- select * from public.admins;
