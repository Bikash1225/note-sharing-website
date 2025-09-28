const express = require('express');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const { ClerkExpressWithAuth } = require('@clerk/express');
const db = require('./db');

const authRoutes = require('./routes/auth');
const notesRoutes = require('./routes/notes');
const usersRoutes = require('./routes/users');
const adminRoutes = require('./routes/admin');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, '../frontend')));
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

app.use(ClerkExpressWithAuth());

app.use('/api/auth', authRoutes);
app.use('/api/notes', notesRoutes);
app.use('/api/users', usersRoutes);
app.use('/api/admin', adminRoutes);

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '../frontend/index.html'));
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});