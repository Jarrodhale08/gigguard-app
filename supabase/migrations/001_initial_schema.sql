-- ============================================================================
-- GigGuard Initial Schema
-- Multi-tenant financial management for freelancers and gig workers
-- ============================================================================

-- ============================================================================
-- SHARED TABLES (no app_id - used across all AppForge apps)
-- ============================================================================

-- App Registry - tracks all apps using the shared Supabase project
CREATE TABLE IF NOT EXISTS app_registry (
  app_id TEXT PRIMARY KEY,
  app_name TEXT NOT NULL,
  app_category TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- User App Context - links users to apps they've accessed
CREATE TABLE IF NOT EXISTS user_app_context (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  app_id TEXT NOT NULL REFERENCES app_registry(app_id),
  first_accessed_at TIMESTAMPTZ DEFAULT NOW(),
  last_accessed_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, app_id)
);

-- User Profiles - extends auth.users with additional info
CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT,
  display_name TEXT,
  avatar_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================================
-- APP-ISOLATED TABLES (have app_id column for multi-tenant isolation)
-- ============================================================================

-- Gigs - Income tracking for freelance work
CREATE TABLE IF NOT EXISTS gigs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  app_id TEXT NOT NULL,
  title TEXT NOT NULL,
  platform TEXT NOT NULL,
  amount DECIMAL(12,2) NOT NULL DEFAULT 0,
  date DATE NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('pending', 'completed', 'disputed')),
  notes TEXT,
  client_id UUID REFERENCES clients(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Expenses - Business expense tracking
CREATE TABLE IF NOT EXISTS expenses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  app_id TEXT NOT NULL,
  title TEXT NOT NULL,
  category TEXT NOT NULL,
  amount DECIMAL(12,2) NOT NULL DEFAULT 0,
  date DATE NOT NULL,
  is_deductible BOOLEAN DEFAULT false,
  receipt_url TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Clients - Client/customer management
CREATE TABLE IF NOT EXISTS clients (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  app_id TEXT NOT NULL,
  name TEXT NOT NULL,
  email TEXT,
  phone TEXT,
  total_earned DECIMAL(12,2) DEFAULT 0,
  gigs_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Invoices - Invoice generation and tracking
CREATE TABLE IF NOT EXISTS invoices (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  app_id TEXT NOT NULL,
  client_id UUID REFERENCES clients(id) ON DELETE SET NULL,
  client_name TEXT NOT NULL,
  amount DECIMAL(12,2) NOT NULL DEFAULT 0,
  status TEXT NOT NULL CHECK (status IN ('draft', 'sent', 'paid', 'overdue')),
  due_date DATE NOT NULL,
  items JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Savings Goals - Financial goal tracking
CREATE TABLE IF NOT EXISTS savings_goals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  app_id TEXT NOT NULL,
  name TEXT NOT NULL,
  target_amount DECIMAL(12,2) NOT NULL DEFAULT 0,
  current_amount DECIMAL(12,2) DEFAULT 0,
  deadline DATE,
  type TEXT NOT NULL CHECK (type IN ('taxes', 'emergency', 'custom')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- User Settings - App-specific user preferences
CREATE TABLE IF NOT EXISTS user_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  app_id TEXT NOT NULL,
  settings JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, app_id)
);

-- ============================================================================
-- INDEXES
-- ============================================================================

CREATE INDEX IF NOT EXISTS idx_gigs_user_app ON gigs(user_id, app_id);
CREATE INDEX IF NOT EXISTS idx_gigs_date ON gigs(date DESC);
CREATE INDEX IF NOT EXISTS idx_expenses_user_app ON expenses(user_id, app_id);
CREATE INDEX IF NOT EXISTS idx_expenses_date ON expenses(date DESC);
CREATE INDEX IF NOT EXISTS idx_clients_user_app ON clients(user_id, app_id);
CREATE INDEX IF NOT EXISTS idx_invoices_user_app ON invoices(user_id, app_id);
CREATE INDEX IF NOT EXISTS idx_invoices_status ON invoices(status);
CREATE INDEX IF NOT EXISTS idx_savings_goals_user_app ON savings_goals(user_id, app_id);
CREATE INDEX IF NOT EXISTS idx_user_settings_user_app ON user_settings(user_id, app_id);

-- ============================================================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================================================

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_app_context ENABLE ROW LEVEL SECURITY;
ALTER TABLE gigs ENABLE ROW LEVEL SECURITY;
ALTER TABLE expenses ENABLE ROW LEVEL SECURITY;
ALTER TABLE clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE invoices ENABLE ROW LEVEL SECURITY;
ALTER TABLE savings_goals ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_settings ENABLE ROW LEVEL SECURITY;

-- Profiles policies
CREATE POLICY "Users can view own profile" ON profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON profiles
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile" ON profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

-- User App Context policies
CREATE POLICY "Users can view own app context" ON user_app_context
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can manage own app context" ON user_app_context
  FOR ALL USING (auth.uid() = user_id);

-- Gigs policies
CREATE POLICY "Users can manage own gigs" ON gigs
  FOR ALL USING (auth.uid() = user_id);

-- Expenses policies
CREATE POLICY "Users can manage own expenses" ON expenses
  FOR ALL USING (auth.uid() = user_id);

-- Clients policies
CREATE POLICY "Users can manage own clients" ON clients
  FOR ALL USING (auth.uid() = user_id);

-- Invoices policies
CREATE POLICY "Users can manage own invoices" ON invoices
  FOR ALL USING (auth.uid() = user_id);

-- Savings Goals policies
CREATE POLICY "Users can manage own savings goals" ON savings_goals
  FOR ALL USING (auth.uid() = user_id);

-- User Settings policies
CREATE POLICY "Users can manage own settings" ON user_settings
  FOR ALL USING (auth.uid() = user_id);

-- ============================================================================
-- TRIGGERS
-- ============================================================================

-- Auto-update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_gigs_updated_at
  BEFORE UPDATE ON gigs
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_expenses_updated_at
  BEFORE UPDATE ON expenses
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_clients_updated_at
  BEFORE UPDATE ON clients
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_invoices_updated_at
  BEFORE UPDATE ON invoices
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_savings_goals_updated_at
  BEFORE UPDATE ON savings_goals
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_settings_updated_at
  BEFORE UPDATE ON user_settings
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- REGISTER APP
-- ============================================================================

INSERT INTO app_registry (app_id, app_name, app_category)
VALUES ('gigguard', 'GigGuard', 'finance')
ON CONFLICT (app_id) DO NOTHING;
