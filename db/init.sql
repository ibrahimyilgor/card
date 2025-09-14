-- Kullanıcı tablosu: username ve hashlenmiş şifre ile
CREATE TABLE IF NOT EXISTS users (
  id SERIAL PRIMARY KEY,
  username VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
CREATE TABLE IF NOT EXISTS items (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL
);

INSERT INTO items (name) VALUES ('Elma'), ('Armut'), ('Muz') ON CONFLICT DO NOTHING;
