-- Aura Health: plans, mood/anxiety metrics, funnel events
-- In-memory store on the Express server mirrors this schema for the MVP.

CREATE TABLE user_plans (
  user_id TEXT PRIMARY KEY,
  plan TEXT NOT NULL CHECK (plan IN ('free', 'trial', 'premium', 'lifetime', 'corporate')),
  interval TEXT CHECK (interval IN ('monthly', 'annual', 'lifetime', 'corporate')),
  status TEXT NOT NULL DEFAULT 'active',
  trial_ends_at TIMESTAMPTZ,
  auto_renew BOOLEAN NOT NULL DEFAULT TRUE,
  seats INTEGER,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE user_metrics (
  id SERIAL PRIMARY KEY,
  user_id TEXT NOT NULL,
  mood_score INTEGER NOT NULL CHECK (mood_score BETWEEN 1 AND 5),
  anxiety_level INTEGER NOT NULL CHECK (anxiety_level BETWEEN 1 AND 10),
  session_date DATE NOT NULL,
  language TEXT,
  source TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_user_metrics_user_date ON user_metrics (user_id, session_date);

CREATE TABLE funnel_events (
  id SERIAL PRIMARY KEY,
  user_id TEXT NOT NULL,
  event TEXT NOT NULL,
  meta JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE corporate_leads (
  id SERIAL PRIMARY KEY,
  company TEXT NOT NULL,
  contact_email TEXT NOT NULL,
  seats INTEGER NOT NULL,
  package_id TEXT NOT NULL,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
