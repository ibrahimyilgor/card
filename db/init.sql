CREATE TABLE IF NOT EXISTS account (
  id SERIAL PRIMARY KEY,
  accountname VARCHAR(255) UNIQUE NOT NULL,
  email VARCHAR(255) UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  last_login_date TIMESTAMP
);

CREATE TABLE IF NOT EXISTS account_preferences (
  account_id INT PRIMARY KEY REFERENCES account(id) ON DELETE CASCADE,
  language VARCHAR(10) DEFAULT 'en',
  theme_preference VARCHAR(10) DEFAULT 'light', 
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS account_daily_stats (
  account_id INT REFERENCES account(id) ON DELETE CASCADE,
  review_date TIMESTAMP NOT NULL,
  total_decks_review_done INT DEFAULT 0,
  PRIMARY KEY (account_id, review_date)
);

CREATE TABLE IF NOT EXISTS deck (
  id SERIAL PRIMARY KEY,
  account_id INT REFERENCES account(id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  mode VARCHAR(50) DEFAULT 'standard',
  difficulty_enabled BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS flashcard (
  id SERIAL PRIMARY KEY,
  deck_id INT REFERENCES deck(id) ON DELETE CASCADE,
  front_text TEXT NOT NULL,
  back_text TEXT NOT NULL,
  difficulty INT DEFAULT 3 CHECK (difficulty BETWEEN 1 AND 5),
  correct_count INT DEFAULT 0,
  wrong_count INT DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS achievement (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  description TEXT
);

CREATE TABLE IF NOT EXISTS account_achievements (
  account_id INT REFERENCES account(id) ON DELETE CASCADE,
  achievement_id INT REFERENCES achievement(id) ON DELETE CASCADE,
  done_count INT DEFAULT 0,
  earned_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (account_id, achievement_id)
);
