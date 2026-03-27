CREATE TABLE IF NOT EXISTS account (
  id SERIAL PRIMARY KEY,
  firebase_uid VARCHAR(128) UNIQUE NOT NULL,
  email VARCHAR(255) UNIQUE,
  display_name VARCHAR(255),
  photo_url TEXT,
  role VARCHAR(20) DEFAULT 'user' CHECK (role IN ('user', 'admin')),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  last_login_date TIMESTAMP
);

CREATE TABLE IF NOT EXISTS account_preferences (
  account_id INT PRIMARY KEY REFERENCES account(id) ON DELETE CASCADE,
  language VARCHAR(10) DEFAULT 'en',
  theme_preference VARCHAR(10) DEFAULT 'light', 
  sound_effects_enabled BOOLEAN DEFAULT TRUE,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS deck (
  id SERIAL PRIMARY KEY,
  account_id INT REFERENCES account(id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL,
  description VARCHAR(512),
  mode VARCHAR(50) DEFAULT 'standard',
  challenge_type VARCHAR(20) DEFAULT 'none',
  time_limit INT DEFAULT 60,
  starting_lives INT DEFAULT 3,
  difficulty_enabled BOOLEAN DEFAULT FALSE,
  card_direction VARCHAR(20) DEFAULT 'normal',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS flashcard (
  id SERIAL PRIMARY KEY,
  deck_id INT REFERENCES deck(id) ON DELETE CASCADE,
  front_text VARCHAR(512) NOT NULL,
  back_text VARCHAR(512) NOT NULL,
  difficulty INT DEFAULT 3 CHECK (difficulty BETWEEN 1 AND 5),
  correct_count INT DEFAULT 0,
  wrong_count INT DEFAULT 0,
  enabled BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS achievement (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  icon VARCHAR(50) NOT NULL,
  category VARCHAR(50) NOT NULL,
  threshold INT NOT NULL,
  UNIQUE(category, threshold)
);

CREATE TABLE IF NOT EXISTS account_achievements (
  account_id INT REFERENCES account(id) ON DELETE CASCADE,
  achievement_id INT REFERENCES achievement(id) ON DELETE CASCADE,
  done_count INT DEFAULT 1,
  earned_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (account_id, achievement_id)
);

-- Seed achievements
INSERT INTO achievement (name, description, icon, category, threshold) VALUES
-- Streak achievements (consecutive days of game completion)
('streak_3', '3 Day Streak', '🔥', 'streak', 3),
('streak_7', '7 Day Streak', '🔥', 'streak', 7),
('streak_14', '14 Day Streak', '🔥', 'streak', 14),
('streak_30', '30 Day Streak', '🔥', 'streak', 30),
('streak_90', '90 Day Streak', '🔥', 'streak', 90),
('streak_180', '180 Day Streak', '🔥', 'streak', 180),
('streak_365', '365 Day Streak', '🔥', 'streak', 365),
-- Accuracy achievements (complete a deck with X% accuracy)
('accuracy_80', '80% Accuracy', '🎯', 'accuracy', 80),
('accuracy_90', '90% Accuracy', '🎯', 'accuracy', 90),
('accuracy_100', 'Perfect Score', '🎯', 'accuracy', 100),
-- Volume achievements (total cards studied all-time)
('volume_50', '50 Cards Studied', '📚', 'volume', 50),
('volume_100', '100 Cards Studied', '📚', 'volume', 100),
('volume_500', '500 Cards Studied', '📚', 'volume', 500),
('volume_1000', '1000 Cards Studied', '📚', 'volume', 1000)
('volume_5000', '5000 Cards Studied', '📚', 'volume', 5000),
('volume_20000', '20000 Cards Studied', '📚', 'volume', 20000),
('volume_100000', '100000 Cards Studied', '📚', 'volume', 100000),
('volume_1000000', '1000000 Cards Studied', '📚', 'volume', 1000000)
ON CONFLICT DO NOTHING;

CREATE TABLE IF NOT EXISTS study_session (
  id SERIAL PRIMARY KEY,
  account_id INT REFERENCES account(id) ON DELETE CASCADE,
  deck_id INT REFERENCES deck(id) ON DELETE CASCADE,
  game_mode VARCHAR(50),
  challenge_type VARCHAR(20) DEFAULT 'none',
  cards_studied INT DEFAULT 0,
  correct_answers INT DEFAULT 0,
  wrong_answers INT DEFAULT 0,
  duration_seconds INT DEFAULT 0,
  session_date TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_study_session_account ON study_session(account_id);
CREATE INDEX IF NOT EXISTS idx_study_session_deck ON study_session(deck_id);
CREATE INDEX IF NOT EXISTS idx_study_session_date ON study_session(session_date);

CREATE TABLE IF NOT EXISTS plan (
  id SERIAL PRIMARY KEY,
  code VARCHAR(50) UNIQUE NOT NULL,        -- free, pro, premium
  name VARCHAR(100) NOT NULL,              -- Free, Pro, Premium
  description TEXT,
  price_monthly NUMERIC(10,2) DEFAULT 0,   -- ileride ödeme eklemek için
  max_decks INT,
  max_flashcards INT,
  advanced_stats BOOLEAN DEFAULT FALSE,
  has_ads BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

INSERT INTO plan (code, name, description, price_monthly, max_decks, max_flashcards, advanced_stats, has_ads)
VALUES
('free', 'Free', 'Basic features for getting started', 0, 3, 100, false, true),
('pro', 'Pro', 'Advanced features for regular learners', 4.99, 50, 5000, false, false),
('premium', 'Premium', 'Unlimited access to all features', 9.99, NULL, NULL, true, false);

CREATE TABLE IF NOT EXISTS account_plan (
  account_id INT PRIMARY KEY REFERENCES account(id) ON DELETE CASCADE,
  plan_id INT REFERENCES plan(id),
  started_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  ends_at TIMESTAMP,
  is_active BOOLEAN DEFAULT TRUE,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS account_plan_history (
  id SERIAL PRIMARY KEY,
  account_id INT REFERENCES account(id) ON DELETE CASCADE,
  plan_id INT REFERENCES plan(id),
  started_at TIMESTAMP NOT NULL,
  ended_at TIMESTAMP,
  change_reason VARCHAR(50), 
  -- upgrade, downgrade, cancel, expired, trial_end vb.
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS plan_subscription (
  id SERIAL PRIMARY KEY,
  account_id INT UNIQUE REFERENCES account(id) ON DELETE CASCADE,
  platform VARCHAR(30) NOT NULL DEFAULT 'google_play',
  product_id VARCHAR(120) NOT NULL,
  purchase_token TEXT NOT NULL,
  subscription_state VARCHAR(50),
  expires_at TIMESTAMP,
  auto_renewing BOOLEAN DEFAULT FALSE,
  raw_payload JSONB,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_plan_subscription_product_id
  ON plan_subscription(product_id);

CREATE INDEX IF NOT EXISTS idx_plan_subscription_expires_at
  ON plan_subscription(expires_at);

CREATE INDEX IF NOT EXISTS idx_plan_subscription_purchase_token
  ON plan_subscription(purchase_token);

CREATE TABLE IF NOT EXISTS subscription_webhook_event (
  id SERIAL PRIMARY KEY,
  provider VARCHAR(30) NOT NULL DEFAULT 'google_play',
  event_key VARCHAR(255) NOT NULL,
  payload JSONB,
  processed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(provider, event_key)
);

CREATE INDEX IF NOT EXISTS idx_subscription_webhook_event_processed_at
  ON subscription_webhook_event(processed_at);
