const express = require('express');
const db = require('../db');

const router = express.Router();

// Check admin middleware
const checkAdmin = (req, res, next) => {
  const { userId } = req.auth;
  
  if (!userId) {
    return res.status(401).json({ error: 'Not authenticated' });
  }

  try {
    const stmt = db.prepare('SELECT is_admin FROM users WHERE clerk_uid = ?');
    const user = stmt.get(userId);
    
    if (!user || !user.is_admin) {
      return res.status(403).json({ error: 'Admin access required' });
    }
    
    next();
  } catch (error) {
    res.status(500).json({ error: 'Database error' });
  }
};

router.use(checkAdmin);

router.get('/users', (req, res) => {
  try {
    const stmt = db.prepare('SELECT * FROM users ORDER BY created_at DESC');
    const users = stmt.all();
    res.json(users);
  } catch (error) {
    res.status(500).json({ error: 'Database error' });
  }
});

router.post('/users/:id/ban', (req, res) => {
  const { userId } = req.auth;
  const { id } = req.params;
  const { reason } = req.body;

  try {
    db.transaction(() => {
      const banStmt = db.prepare('UPDATE users SET is_banned = 1 WHERE clerk_uid = ?');
      banStmt.run(id);
      
      const logStmt = db.prepare('INSERT INTO bans (clerk_uid, banned_by, reason) VALUES (?, ?, ?)');
      logStmt.run(id, userId, reason);
    })();

    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: 'Database error' });
  }
});

router.post('/users/:id/unban', (req, res) => {
  const { id } = req.params;

  try {
    const stmt = db.prepare('UPDATE users SET is_banned = 0 WHERE clerk_uid = ?');
    stmt.run(id);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: 'Database error' });
  }
});

router.delete('/notes/:id', (req, res) => {
  const { id } = req.params;

  try {
    const stmt = db.prepare('DELETE FROM notes WHERE id = ?');
    stmt.run(id);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: 'Database error' });
  }
});

module.exports = router;