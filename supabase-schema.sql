-- Create users table
CREATE TABLE IF NOT EXISTS users (
  id TEXT PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  full_name TEXT,
  subscription_tier TEXT DEFAULT 'free' CHECK (subscription_tier IN ('free', 'basic', 'pro', 'test')),
  credits_remaining INTEGER DEFAULT 3,
  credits_used_this_month INTEGER DEFAULT 0,
  total_cases_generated INTEGER DEFAULT 0,
  is_test_user BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  last_case_date TIMESTAMPTZ,
  last_credit_reset TIMESTAMPTZ DEFAULT NOW()
);

-- Create cases table
CREATE TABLE IF NOT EXISTS cases (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  type TEXT DEFAULT 'DCF',
  status TEXT DEFAULT 'template' CHECK (status IN ('template', 'submit_results', 'completed')),
  industry TEXT NOT NULL,
  company_description TEXT,
  starting_point JSONB,
  assumptions JSONB,
  answer_key JSONB,
  user_results JSONB,
  answer_key_excel TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_test ON users(is_test_user) WHERE is_test_user = true;
CREATE INDEX IF NOT EXISTS idx_cases_user_id ON cases(user_id);
CREATE INDEX IF NOT EXISTS idx_cases_created_at ON cases(created_at);

-- Enable Row Level Security (RLS)
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE cases ENABLE ROW LEVEL SECURITY;

-- Create policies for users table
CREATE POLICY "Users can read their own data" ON users
  FOR SELECT USING (true); -- Allow reading for now, can restrict later

CREATE POLICY "Users can update their own data" ON users
  FOR ALL USING (true); -- Allow all operations for now, can restrict later

-- Create policies for cases table  
CREATE POLICY "Users can read their own cases" ON cases
  FOR SELECT USING (true); -- Allow reading for now

CREATE POLICY "Users can manage their own cases" ON cases
  FOR ALL USING (true); -- Allow all operations for now

-- Insert test user
INSERT INTO users (
  id, 
  email, 
  full_name, 
  subscription_tier, 
  credits_remaining, 
  is_test_user
) VALUES (
  'jeff.sit13@gmail.com',
  'jeff.sit13@gmail.com',
  'Jeff Sit',
  'test',
  999999,
  true
) ON CONFLICT (id) DO UPDATE SET
  subscription_tier = EXCLUDED.subscription_tier,
  credits_remaining = EXCLUDED.credits_remaining,
  is_test_user = EXCLUDED.is_test_user;
