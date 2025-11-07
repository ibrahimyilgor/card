
const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

module.exports = (pool) => {
  const router = express.Router();

  // Register
  router.post('/register', async (req, res) => {
    const { username, password } = req.body;
    if (!username || !password) return res.status(400).json({ error: 'Username and password required' });
    const client = await pool.connect();
    try {
      await client.query('BEGIN');
      const hash = await bcrypt.hash(password, 10);
      const userResult = await client.query(
        'INSERT INTO "user" (username, password_hash) VALUES ($1, $2) RETURNING id',
        [username, hash]
      );
      const userId = userResult.rows[0].id;

      // Create user_preferences
      await client.query(
        'INSERT INTO user_preferences (user_id) VALUES ($1)',
        [userId]
      );

      await client.query('COMMIT');
      res.status(201).json({ message: 'User registered' });
    } catch (err) {
      await client.query('ROLLBACK');
      console.error('Register error:', err);
      if (err.code === '23505') return res.status(409).json({ error: 'Username already exists' });
      res.status(500).json({ error: 'Registration failed' });
    } finally {
      client.release();
    }
  });

  // Login
  router.post('/login', async (req, res) => {
    const { username, password } = req.body;
    if (!username || !password) return res.status(400).json({ error: 'Username and password required' });
    try {
      const result = await pool.query('SELECT id, password_hash FROM "user" WHERE username = $1', [username]);
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
