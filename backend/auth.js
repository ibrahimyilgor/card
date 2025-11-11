
const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const authenticateToken = require('./middleware/authenticateToken');

module.exports = (pool) => {
  const router = express.Router();

  // Register
  router.post('/register', async (req, res) => {
    const { accountname, password } = req.body;
    if (!accountname || !password) return res.status(400).json({ error: 'Account name and password required' });
    const client = await pool.connect();
    try {
      await client.query('BEGIN');
      const hash = await bcrypt.hash(password, 10);
      const accountResult = await client.query(
        'INSERT INTO account (accountname, password_hash) VALUES ($1, $2) RETURNING id',
        [accountname, hash]
      );
      const accountId = accountResult.rows[0].id;

      // Create account_preferences
      await client.query(
        'INSERT INTO account_preferences (account_id) VALUES ($1)',
        [accountId]
      );

      await client.query('COMMIT');
      res.status(201).json({ message: 'Account registered' });
    } catch (err) {
      await client.query('ROLLBACK');
      console.error('Register error:', err);
      if (err.code === '23505') return res.status(409).json({ error: 'accountname already exists' });
      res.status(500).json({ error: 'Registration failed' });
    } finally {
      client.release();
    }
  });

  // Login
  router.post('/login', async (req, res) => {
    const { accountname, password } = req.body;
    if (!accountname || !password) return res.status(400).json({ error: 'Account name and password required' });
    try {
      const result = await pool.query('SELECT id, password_hash FROM account WHERE accountname = $1', [accountname]);
      if (result.rows.length === 0) return res.status(401).json({ error: 'Invalid credentials' });
      const valid = await bcrypt.compare(password, result.rows[0].password_hash);
      if (!valid) return res.status(401).json({ error: 'Invalid credentials' });
      // JWT token üret
      const token = jwt.sign(
        { accountId: result.rows[0].id, accountname },
        process.env.JWT_SECRET || 'dev_secret',
        { expiresIn: '1h' }
      );
      res.json({ message: 'Login successful', token });
    } catch (err) {
      res.status(500).json({ error: 'Login failed' });
    }
  });

  router.authenticateToken = authenticateToken;
  return router;
};
