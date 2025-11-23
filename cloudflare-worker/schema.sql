-- EngrAssist D1 Database Schema

-- Users table
CREATE TABLE IF NOT EXISTS users (
    id TEXT PRIMARY KEY,
    email TEXT UNIQUE NOT NULL,
    name TEXT,
    password_hash TEXT,
    photo_url TEXT,
    auth_provider TEXT DEFAULT 'email', -- 'email' or 'google'
    created_at INTEGER NOT NULL,
    updated_at INTEGER
);

-- Index on email for faster lookups
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);

-- Projects table
CREATE TABLE IF NOT EXISTS projects (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    data TEXT NOT NULL, -- JSON string of project data
    created_at INTEGER DEFAULT (cast(strftime('%s', 'now') as int)),
    updated_at INTEGER NOT NULL,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Index on user_id for faster project queries
CREATE INDEX IF NOT EXISTS idx_projects_user_id ON projects(user_id);

-- Index on updated_at for sorting
CREATE INDEX IF NOT EXISTS idx_projects_updated_at ON projects(updated_at DESC);

-- Composite index for user projects ordered by update time
CREATE INDEX IF NOT EXISTS idx_projects_user_updated ON projects(user_id, updated_at DESC);
