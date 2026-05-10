-- DebtFlow Database Schema
-- PostgreSQL 14+

BEGIN;

-- =====================
-- Tipos enum
-- =====================
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'payment_status') THEN
    CREATE TYPE payment_status AS ENUM ('pending', 'paid', 'failed', 'canceled');
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'loan_status') THEN
    CREATE TYPE loan_status AS ENUM ('active', 'closed', 'canceled');
  END IF;
END$$;

-- =====================
-- Tabla de Usuarios
-- =====================
CREATE TABLE IF NOT EXISTS users (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email           text UNIQUE NOT NULL,
  password_hash   text NOT NULL,
  display_name    text,
  created_at      timestamptz NOT NULL DEFAULT now(),
  updated_at      timestamptz NOT NULL DEFAULT now()
);

-- =====================
-- Roles de usuario
-- =====================
CREATE TABLE IF NOT EXISTS user_roles (
  user_id     uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  role        text NOT NULL CHECK (role IN ('admin', 'user')),
  created_at  timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (user_id, role)
);

-- =====================
-- Personas (deudores/acreedores)
-- =====================
CREATE TABLE IF NOT EXISTS people (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id    uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  name        text NOT NULL,
  document_id text,
  phone       text,
  email       text,
  address     text,
  notes       text,
  created_at  timestamptz NOT NULL DEFAULT now(),
  updated_at  timestamptz NOT NULL DEFAULT now(),
  UNIQUE(owner_id, name)
);

-- =====================
-- Categorías
-- =====================
CREATE TABLE IF NOT EXISTS categories (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id    uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  name        text NOT NULL,
  color       text DEFAULT '#6366f1',
  icon        text,
  created_at  timestamptz NOT NULL DEFAULT now(),
  updated_at  timestamptz NOT NULL DEFAULT now(),
  UNIQUE(owner_id, name)
);

-- =====================
-- Préstamos/Deudas
-- =====================
CREATE TABLE IF NOT EXISTS loans (
  id               uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id         uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  counterparty_id  uuid NOT NULL REFERENCES people(id) ON DELETE RESTRICT,
  direction        text NOT NULL CHECK (direction IN ('given', 'received')),
  category_id      uuid REFERENCES categories(id) ON DELETE SET NULL,
  title            text,
  description      text,
  principal_amount numeric(18,2) NOT NULL CHECK (principal_amount >= 0),
  interest_rate    numeric(5,2) DEFAULT 0,
  currency         text NOT NULL DEFAULT 'USD',
  status           loan_status NOT NULL DEFAULT 'active',
  started_on       date,
  due_on           date,
  notes            text,
  created_at       timestamptz NOT NULL DEFAULT now(),
  updated_at       timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_loans_owner ON loans(owner_id);
CREATE INDEX IF NOT EXISTS idx_loans_counterparty ON loans(counterparty_id);
CREATE INDEX IF NOT EXISTS idx_loans_direction ON loans(direction);

-- =====================
-- Pagos
-- =====================
CREATE TABLE IF NOT EXISTS payments (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id    uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  loan_id     uuid NOT NULL REFERENCES loans(id) ON DELETE CASCADE,
  amount      numeric(18,2) NOT NULL CHECK (amount >= 0),
  currency    text NOT NULL DEFAULT 'USD',
  status      payment_status NOT NULL DEFAULT 'paid',
  paid_on     date NOT NULL DEFAULT CURRENT_DATE,
  reference   text,
  method      text,
  notes       text,
  created_at  timestamptz NOT NULL DEFAULT now(),
  updated_at  timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_payments_owner ON payments(owner_id);
CREATE INDEX IF NOT EXISTS idx_payments_loan ON payments(loan_id);

-- =====================
-- Notificaciones
-- =====================
CREATE TABLE IF NOT EXISTS notifications (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id    uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  title       text NOT NULL,
  body        text,
  kind        text NOT NULL DEFAULT 'info',
  payload     jsonb,
  is_read     boolean NOT NULL DEFAULT false,
  read_at     timestamptz,
  created_at  timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_notifications_owner ON notifications(owner_id);
CREATE INDEX IF NOT EXISTS idx_notifications_unread ON notifications(owner_id, is_read);

COMMIT;

-- =====================
-- Funciones RPC
-- =====================

-- Registrar usuario normal
CREATE OR REPLACE FUNCTION register_user(
  p_name text,
  p_email text,
  p_password text
)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  new_user_id uuid;
BEGIN
  IF EXISTS (SELECT 1 FROM users WHERE email = p_email) THEN
    RAISE EXCEPTION 'El correo electrónico ya está registrado';
  END IF;

  INSERT INTO users (email, password_hash, display_name)
  VALUES (p_email, crypt(p_password, gen_salt('bf')), p_name)
  RETURNING id INTO new_user_id;

  INSERT INTO user_roles (user_id, role)
  VALUES (new_user_id, 'user');

  RETURN new_user_id;
END;
$$;

-- Iniciar sesión
CREATE OR REPLACE FUNCTION login_user(
  p_email text,
  p_password text
)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  user_row users%ROWTYPE;
BEGIN
  SELECT * INTO user_row
  FROM users
  WHERE email = p_email;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Credenciales inválidas';
  END IF;

  IF NOT (user_row.password_hash = crypt(p_password, user_row.password_hash)) THEN
    RAISE EXCEPTION 'Credenciales inválidas';
  END IF;

  RETURN user_row.id;
END;
$$;

-- Obtener rol de usuario
CREATE OR REPLACE FUNCTION get_user_role(p_user_id uuid)
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  role_text text;
BEGIN
  SELECT role INTO role_text
  FROM user_roles
  WHERE user_id = p_user_id
  LIMIT 1;

  RETURN COALESCE(role_text, 'user');
END;
$$;

-- =====================
-- RLS Policies (Row Level Security)
-- =====================

-- Tabla users
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "users_select" ON users;
CREATE POLICY "users_select" ON users FOR SELECT USING (true);
DROP POLICY IF EXISTS "users_insert" ON users;
CREATE POLICY "users_insert" ON users FOR INSERT WITH CHECK (true);
DROP POLICY IF EXISTS "users_update" ON users;
CREATE POLICY "users_update" ON users FOR UPDATE USING (true);
DROP POLICY IF EXISTS "users_delete" ON users;
CREATE POLICY "users_delete" ON users FOR DELETE USING (true);

-- Tabla user_roles
ALTER TABLE user_roles ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "user_roles_select" ON user_roles;
CREATE POLICY "user_roles_select" ON user_roles FOR SELECT USING (true);
DROP POLICY IF EXISTS "user_roles_all" ON user_roles;
CREATE POLICY "user_roles_all" ON user_roles FOR ALL USING (true) WITH CHECK (true);

-- Tabla people
ALTER TABLE people ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "people_select" ON people;
CREATE POLICY "people_select" ON people FOR SELECT USING (owner_id = current_setting('app.current_user_id', true)::uuid);
DROP POLICY IF EXISTS "people_insert" ON people;
CREATE POLICY "people_insert" ON people FOR INSERT WITH CHECK (owner_id = current_setting('app.current_user_id', true)::uuid);
DROP POLICY IF EXISTS "people_update" ON people;
CREATE POLICY "people_update" ON people FOR UPDATE USING (owner_id = current_setting('app.current_user_id', true)::uuid);
DROP POLICY IF EXISTS "people_delete" ON people;
CREATE POLICY "people_delete" ON people FOR DELETE USING (owner_id = current_setting('app.current_user_id', true)::uuid);

-- Tabla categories
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "categories_select" ON categories;
CREATE POLICY "categories_select" ON categories FOR SELECT USING (true);
DROP POLICY IF EXISTS "categories_all" ON categories;
CREATE POLICY "categories_all" ON categories FOR ALL USING (true) WITH CHECK (true);

-- Tabla loans
ALTER TABLE loans ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "loans_select" ON loans;
CREATE POLICY "loans_select" ON loans FOR SELECT USING (true);
DROP POLICY IF EXISTS "loans_insert" ON loans;
CREATE POLICY "loans_insert" ON loans FOR INSERT WITH CHECK (true);
DROP POLICY IF EXISTS "loans_update" ON loans;
CREATE POLICY "loans_update" ON loans FOR UPDATE USING (true);
DROP POLICY IF EXISTS "loans_delete" ON loans;
CREATE POLICY "loans_delete" ON loans FOR DELETE USING (true);

-- Tabla payments
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "payments_select" ON payments;
CREATE POLICY "payments_select" ON payments FOR SELECT USING (true);
DROP POLICY IF EXISTS "payments_insert" ON payments;
CREATE POLICY "payments_insert" ON payments FOR INSERT WITH CHECK (true);
DROP POLICY IF EXISTS "payments_update" ON payments;
CREATE POLICY "payments_update" ON payments FOR UPDATE USING (true);
DROP POLICY IF EXISTS "payments_delete" ON payments;
CREATE POLICY "payments_delete" ON payments FOR DELETE USING (true);

-- Tabla notifications
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "notifications_select" ON notifications;
CREATE POLICY "notifications_select" ON notifications FOR SELECT USING (owner_id = current_setting('app.current_user_id', true)::uuid);
DROP POLICY IF EXISTS "notifications_insert" ON notifications;
CREATE POLICY "notifications_insert" ON notifications FOR INSERT WITH CHECK (owner_id = current_setting('app.current_user_id', true)::uuid);
DROP POLICY IF EXISTS "notifications_update" ON notifications;
CREATE POLICY "notifications_update" ON notifications FOR UPDATE USING (owner_id = current_setting('app.current_user_id', true)::uuid);
DROP POLICY IF EXISTS "notifications_delete" ON notifications;
CREATE POLICY "notifications_delete" ON notifications FOR DELETE USING (owner_id = current_setting('app.current_user_id', true)::uuid);

-- =====================
-- Usuario Admin de prueba
-- =====================
INSERT INTO users (email, password_hash, display_name)
VALUES ('admin@debtflow.com', crypt('admin123', gen_salt('bf')), 'Admin')
ON CONFLICT (email) DO NOTHING;

INSERT INTO user_roles (user_id, role)
SELECT id, 'admin'
FROM users
WHERE email = 'admin@debtflow.com'
ON CONFLICT DO NOTHING;

-- =====================
-- Usuario de prueba normal
-- =====================
INSERT INTO users (email, password_hash, display_name)
VALUES ('user@debtflow.com', crypt('user123', gen_salt('bf')), 'Usuario Prueba')
ON CONFLICT (email) DO NOTHING;

INSERT INTO user_roles (user_id, role)
SELECT id, 'user'
FROM users
WHERE email = 'user@debtflow.com'
ON CONFLICT DO NOTHING;