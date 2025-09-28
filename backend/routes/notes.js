const express = require('express');
const multer = require('multer');
const path = require('path');
const { v4: uuidv4 } = require('uuid');
const db = require('../db');

const router = express.Router();

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, '../../uploads/notes'));
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    cb(null, uuidv4() + ext);
  }
});

const upload = multer({ 
  storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
  fileFilter: (req, file, cb) => {
    const allowed = ['.pdf', '.doc', '.docx', '.jpg', '.jpeg', '.png'];
    const ext = path.extname(file.originalname).toLowerCase();
    cb(null, allowed.includes(ext));
  }
});

router.get('/', (req, res) => {
  const { course, subject, tags } = req.query;
  
  let query = `
    SELECT n.*, u.name as author_name 
    FROM notes n 
    JOIN users u ON n.clerk_uid = u.clerk_uid 
    WHERE 1=1
  `;
  const params = [];

  if (course) {
    query += ' AND n.course = ?';
    params.push(course);
  }
  
  if (subject) {
    query += ' AND n.subject LIKE ?';
    params.push(`%${subject}%`);
  }
  
  if (tags) {
    query += ' AND n.tags LIKE ?';
    params.push(`%${tags}%`);
  }

  query += ' ORDER BY n.created_at DESC';

  try {
    const stmt = db.prepare(query);
    const notes = stmt.all(params);
    res.json(notes);
  } catch (error) {
    res.status(500).json({ error: 'Database error' });
  }
});

router.post('/', upload.single('file'), (req, res) => {
  const { userId } = req.auth;
  const { title, description, course, subject, tags } = req.body;

  if (!userId) {
    return res.status(401).json({ error: 'Not authenticated' });
  }

  if (!req.file) {
    return res.status(400).json({ error: 'No file uploaded' });
  }

  try {
    const stmt = db.prepare(`
      INSERT INTO notes (clerk_uid, title, description, course, subject, tags, file_path, original_filename)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `);
    
    const result = stmt.run(
      userId, 
      title, 
      description, 
      course, 
      subject, 
      tags, 
      req.file.filename,
      req.file.originalname
    );

    res.json({ id: result.lastInsertRowid, success: true });
  } catch (error) {
    res.status(500).json({ error: 'Database error' });
  }
});

router.post('/:id/vote', (req, res) => {
  const { userId } = req.auth;
  const { id } = req.params;
  const { type } = req.body; // 1 or -1

  if (!userId) {
    return res.status(401).json({ error: 'Not authenticated' });
  }

  try {
    db.transaction(() => {
      // Remove existing vote
      const deleteStmt = db.prepare('DELETE FROM votes WHERE note_id = ? AND clerk_uid = ?');
      deleteStmt.run(id, userId);
      
      // Add new vote
      const insertStmt = db.prepare('INSERT INTO votes (note_id, clerk_uid, vote_type) VALUES (?, ?, ?)');
      insertStmt.run(id, userId, type);
      
      // Update note votes count
      const updateStmt = db.prepare(`
        UPDATE notes SET votes = (
          SELECT COALESCE(SUM(vote_type), 0) FROM votes WHERE note_id = ?
        ) WHERE id = ?
      `);
      updateStmt.run(id, id);
    })();

    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: 'Database error' });
  }
});

router.get('/download/:filename', (req, res) => {
  const { filename } = req.params;
  const filePath = path.join(__dirname, '../../uploads/notes', filename);
  res.download(filePath);
});

module.exports = router;