CREATE TABLE IF NOT EXISTS users (
  id SERIAL PRIMARY KEY,
  username VARCHAR(255) UNIQUE NOT NULL,
  email VARCHAR(255) UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS user_profiles (
  user_id INT PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
  avatar_url TEXT,
  language VARCHAR(10) DEFAULT 'en',
  theme_preference VARCHAR(10) DEFAULT 'light',
  last_login TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS user_stats (
  user_id INT PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
  total_flashcards_created INT DEFAULT 0,
  total_reviews_done INT DEFAULT 0,
  last_review_date TIMESTAMP,
  streak_days INT DEFAULT 0
);

CREATE TABLE IF NOT EXISTS decks (
  id SERIAL PRIMARY KEY,
  user_id INT REFERENCES users(id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS flashcards (
  id SERIAL PRIMARY KEY,
  deck_id INT REFERENCES decks(id) ON DELETE CASCADE,
  front_text TEXT NOT NULL,
  back_text TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS user_flashcards_progress (
  user_id INT REFERENCES users(id) ON DELETE CASCADE,
  flashcard_id INT REFERENCES flashcards(id) ON DELETE CASCADE,
  box_level INT DEFAULT 1 CHECK (box_level BETWEEN 1 AND 5),
  last_reviewed TIMESTAMP,
  next_review TIMESTAMP,
  correct_count INT DEFAULT 0,
  wrong_count INT DEFAULT 0,
  PRIMARY KEY (user_id, flashcard_id)
);

CREATE TABLE IF NOT EXISTS achievements (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  icon_url TEXT
);

CREATE TABLE IF NOT EXISTS user_achievements (
  user_id INT REFERENCES users(id) ON DELETE CASCADE,
  achievement_id INT REFERENCES achievements(id) ON DELETE CASCADE,
  earned_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (user_id, achievement_id)
);
