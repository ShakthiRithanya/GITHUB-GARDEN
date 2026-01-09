import { Pool } from 'pg';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';

dotenv.config();

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
});

const schemaSql = `
-- Users Table
CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    github_id VARCHAR(255) UNIQUE NOT NULL,
    username VARCHAR(255) NOT NULL,
    avatar_url TEXT,
    access_token TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Plants Table
CREATE TABLE IF NOT EXISTS plants (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    type VARCHAR(50) DEFAULT 'sunflower',
    stage VARCHAR(50) DEFAULT 'seedling',
    health INTEGER DEFAULT 100,
    last_updated TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Daily Stats
CREATE TABLE IF NOT EXISTS daily_stats (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    date DATE NOT NULL,
    contributions_count INTEGER DEFAULT 0,
    is_active_day BOOLEAN DEFAULT FALSE,
    UNIQUE(user_id, date)
);

-- Mood Logs
CREATE TABLE IF NOT EXISTS mood_logs (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    date DATE NOT NULL,
    mood VARCHAR(50),
    note TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id, date)
);
`;

const setupDb = async () => {
    try {
        console.log('🌱 Seedling Database...');
        await pool.query(schemaSql);
        console.log('✅ Database schema initialized successfully!');
    } catch (err) {
        console.error('❌ Error initializing database:', err);
    } finally {
        await pool.end();
    }
};

setupDb();
