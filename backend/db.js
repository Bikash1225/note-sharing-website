const Database = require('better-sqlite3');
const path = require('path');
const fs = require('fs');

const dbPath = path.join(__dirname, 'notes.db');
const db = new Database(dbPath);

// Run migrations
const migrationPath = path.join(__dirname, 'migrations/init.sql');
if (fs.existsSync(migrationPath)) {
  const migration = fs.readFileSync(migrationPath, 'utf8');
  db.exec(migration);
  console.log('Database initialized');
}

module.exports = db;