-- DB_RESET_LOCAL.sql
-- Resetea el esquema de DebtFlow para un entorno local.
-- IMPORTANTE: Borra TODO el contenido de las tablas definidas en db_create.sql.
-- Úsalo SOLO en local.

BEGIN;

DO $$
BEGIN
  -- Ordenadas para respetar FKs
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'payments' AND table_schema = 'public') THEN
    EXECUTE 'TRUNCATE TABLE public.payments RESTART IDENTITY CASCADE';
  END IF;

  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'notifications' AND table_schema = 'public') THEN
    EXECUTE 'TRUNCATE TABLE public.notifications RESTART IDENTITY CASCADE';
  END IF;

  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'loans' AND table_schema = 'public') THEN
    EXECUTE 'TRUNCATE TABLE public.loans RESTART IDENTITY CASCADE';
  END IF;

  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'people' AND table_schema = 'public') THEN
    EXECUTE 'TRUNCATE TABLE public.people RESTART IDENTITY CASCADE';
  END IF;

  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'categories' AND table_schema = 'public') THEN
    EXECUTE 'TRUNCATE TABLE public.categories RESTART IDENTITY CASCADE';
  END IF;

  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'user_roles' AND table_schema = 'public') THEN
    EXECUTE 'TRUNCATE TABLE public.user_roles RESTART IDENTITY CASCADE';
  END IF;

  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'app_users' AND table_schema = 'public') THEN
    EXECUTE 'TRUNCATE TABLE public.app_users RESTART IDENTITY CASCADE';
  END IF;
END$$;

COMMIT;

