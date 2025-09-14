const express = require('express');
const jwt = require('jsonwebtoken');

module.exports = (pool) => {
  const router = express.Router();

  // Token doğrulama middleware
  function authenticateToken(req, res, next) {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    if (!token) return res.status(401).json({ error: 'No token provided' });
    jwt.verify(token, process.env.JWT_SECRET || 'dev_secret', (err, user) => {
      if (err) return res.status(403).json({ error: 'Invalid token' });
      req.user = user;
      next();
    });
  }

  // Kişiye özel bilgi endpointi
  router.get('/info', authenticateToken, async (req, res) => {
    try {
      const result = await pool.query('SELECT id, username FROM users WHERE id = $1', [req.user.userId]);
      if (result.rows.length === 0) return res.status(404).json({ error: 'User not found' });
      res.json({ user: result.rows[0] });
    } catch (err) {
      res.status(500).json({ error: 'Failed to fetch user info' });
    }
  });

  return router;
};
