const express = require('express');
const multer = require('multer');
const path = require('path');
const { v4: uuidv4 } = require('uuid');
const db = require('../db');

const router = express.Router();

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, '../../uploads/profiles'));
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    cb(null, uuidv4() + ext);
  }
});

const upload = multer({ 
  storage,
  limits: { fileSize: 2 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const allowed = ['.jpg', '.jpeg', '.png'];
    const ext = path.extname(file.originalname).toLowerCase();
    cb(null, allowed.includes(ext));
  }
});

router.get('/profile', (req, res) => {
  const { userId } = req.auth;

  if (!userId) {
    return res.status(401).json({ error: 'Not authenticated' });
  }

  try {
    const stmt = db.prepare('SELECT * FROM users WHERE clerk_uid = ?');
    const user = stmt.get(userId);
    
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json(user);
  } catch (error) {
    res.status(500).json({ error: 'Database error' });
  }
});

router.put('/profile', (req, res) => {
  const { userId } = req.auth;
  const { bio } = req.body;

  if (!userId) {
    return res.status(401).json({ error: 'Not authenticated' });
  }

  try {
    const stmt = db.prepare('UPDATE users SET bio = ? WHERE clerk_uid = ?');
    stmt.run(bio, userId);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: 'Database error' });
  }
});

router.post('/profile/picture', upload.single('picture'), (req, res) => {
  const { userId } = req.auth;

  if (!userId) {
    return res.status(401).json({ error: 'Not authenticated' });
  }

  if (!req.file) {
    return res.status(400).json({ error: 'No file uploaded' });
  }

  try {
    const stmt = db.prepare('UPDATE users SET profile_pic = ? WHERE clerk_uid = ?');
    stmt.run(req.file.filename, userId);
    res.json({ filename: req.file.filename });
  } catch (error) {
    res.status(500).json({ error: 'Database error' });
  }
});

router.get('/notes', (req, res) => {
  const { userId } = req.auth;

  if (!userId) {
    return res.status(401).json({ error: 'Not authenticated' });
  }

  try {
    const stmt = db.prepare('SELECT * FROM notes WHERE clerk_uid = ? ORDER BY created_at DESC');
    const notes = stmt.all(userId);
    res.json(notes);
  } catch (error) {
    res.status(500).json({ error: 'Database error' });
  }
});

module.exports = router;