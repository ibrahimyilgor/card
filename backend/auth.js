
const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

module.exports = (pool) => {
  const router = express.Router();

  // Kullanıcı kaydı
  router.post('/register', async (req, res) => {
    const { username, password } = req.body;
    if (!username || !password) return res.status(400).json({ error: 'Username and password required' });
    try {
      const hash = await bcrypt.hash(password, 10);
      await pool.query('INSERT INTO users (username, password_hash) VALUES ($1, $2)', [username, hash]);
      res.status(201).json({ message: 'User registered' });
    } catch (err) {
      console.error('Register error:', err);
      if (err.code === '23505') return res.status(409).json({ error: 'Username already exists' });
      res.status(500).json({ error: 'Registration failed' });
    }
  });

  // Kullanıcı girişi
  router.post('/login', async (req, res) => {
    const { username, password } = req.body;
    if (!username || !password) return res.status(400).json({ error: 'Username and password required' });
    try {
      const result = await pool.query('SELECT id, password_hash FROM users WHERE username = $1', [username]);
      if (result.rows.length === 0) return res.status(401).json({ error: 'Invalid credentials' });
      const valid = await bcrypt.compare(password, result.rows[0].password_hash);
      if (!valid) return res.status(401).json({ error: 'Invalid credentials' });
      // JWT token üret
      const token = jwt.sign(
        { userId: result.rows[0].id, username },
        process.env.JWT_SECRET || 'dev_secret',
        { expiresIn: '1h' }
      );
      res.json({ message: 'Login successful', token });
    } catch (err) {
      res.status(500).json({ error: 'Login failed' });
    }
  });

  return router;
};
