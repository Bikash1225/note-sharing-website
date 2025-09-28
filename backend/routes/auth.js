const express = require('express');
const db = require('../db');
const router = express.Router();

router.post('/sync', (req, res) => {
  const { userId } = req.auth;
  const { email, name } = req.body;

  if (!userId) {
    return res.status(401).json({ error: 'Not authenticated' });
  }

  try {
    const stmt = db.prepare(`
      INSERT OR REPLACE INTO users (clerk_uid, email, name) 
      VALUES (?, ?, ?)
    `);
    stmt.run(userId, email, name);
    
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: 'Database error' });
  }
});

module.exports = router;