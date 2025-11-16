const express = require('express');
const jwt = require('jsonwebtoken');
const authenticateToken = require('./middleware/authenticateToken');

module.exports = (pool) => {
  const router = express.Router();

  // Account info endpoint
  router.get('/info', authenticateToken, async (req, res) => {
    try {
      const result = await pool.query('SELECT id, accountname FROM account WHERE id = $1', [req.body.accountId]);
      if (result.rows.length === 0) return res.status(404).json({ error: 'Account not found' });
      res.json({ account: result.rows[0] });
    } catch (err) {
      res.status(500).json({ error: 'Failed to fetch account info' });
    }
  });

  // Account profile endpoint
  router.get('/profile', authenticateToken, async (req, res) => {
    try {
      const accountId = req.user.accountId; // By token
      const result = await pool.query('SELECT * FROM account_preferences WHERE account_id = $1', [accountId]);
      if (result.rows.length === 0) return res.status(404).json({ error: 'Profile not found' });
      res.json({ profile: result.rows[0] });
    } catch (err) {
      res.status(500).json({ error: 'Failed to fetch account profile' });
    }
  });

  // Update language
  router.put('/profile/language', authenticateToken, async (req, res) => {
    const { language, accountId } = req.body;
    if (!language) return res.status(400).json({ error: 'Language is required' });
    try {
      await pool.query(
        'UPDATE account_preferences SET language = $1, updated_at = CURRENT_TIMESTAMP WHERE account_id = $2',
        [language, accountId]
      );
      res.json({ success: true, language });
    } catch (err) {
      res.status(500).json({ error: 'Failed to update language' });
    }
  });

  // Update theme_preference
  router.put('/profile/theme', authenticateToken, async (req, res) => {
    const { theme_preference, accountId } = req.body;
    if (!theme_preference) return res.status(400).json({ error: 'Theme preference is required' });
    try {
      await pool.query(
        'UPDATE account_preferences SET theme_preference = $1, updated_at = CURRENT_TIMESTAMP WHERE account_id = $2',
        [theme_preference, accountId]
      );
      res.json({ success: true, theme_preference });
    } catch (err) {
      res.status(500).json({ error: 'Failed to update theme preference' });
    }
  });

  // Account stats endpoint
  router.get('/stats', authenticateToken, async (req, res) => {
    try {
      const result = await pool.query('SELECT * FROM account_daily_stats WHERE account_id = $1', [req.body.accountId]);
      if (result.rows.length === 0) return res.status(404).json({ error: 'Stats not found' });
      res.json({ stats: result.rows[0] });
    } catch (err) {
      res.status(500).json({ error: 'Failed to fetch account stats' });
    }
  });

  return router;
};
