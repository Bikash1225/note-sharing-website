CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    clerk_uid TEXT UNIQUE NOT NULL,
    email TEXT NOT NULL,
    name TEXT,
    bio TEXT,
    profile_pic TEXT,
    is_admin BOOLEAN DEFAULT 0,
    is_banned BOOLEAN DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS notes (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    clerk_uid TEXT NOT NULL,
    title TEXT NOT NULL,
    description TEXT,
    course TEXT NOT NULL,
    subject TEXT NOT NULL,
    tags TEXT,
    file_path TEXT NOT NULL,
    original_filename TEXT NOT NULL,
    votes INTEGER DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (clerk_uid) REFERENCES users(clerk_uid)
);

CREATE TABLE IF NOT EXISTS votes (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    note_id INTEGER NOT NULL,
    clerk_uid TEXT NOT NULL,
    vote_type INTEGER NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (note_id) REFERENCES notes(id),
    FOREIGN KEY (clerk_uid) REFERENCES users(clerk_uid),
    UNIQUE(note_id, clerk_uid)
);

CREATE TABLE IF NOT EXISTS bans (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    clerk_uid TEXT NOT NULL,
    banned_by TEXT NOT NULL,
    reason TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (clerk_uid) REFERENCES users(clerk_uid),
    FOREIGN KEY (banned_by) REFERENCES users(clerk_uid)
);