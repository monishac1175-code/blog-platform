const sqlite3 = require("sqlite3").verbose();
const path = require("path");

// Database location
const dbPath = path.join(__dirname, "blogverse.db");

// Create / open database
const db = new sqlite3.Database(dbPath, (error) => {
    if (error) {
        console.error("Database connection failed:", error.message);
    } else {
        console.log("SQLite database connected successfully");
    }
});

// Create required tables
db.serialize(() => {

    // ===============================
    // USERS TABLE
    // ===============================

    db.run(`
        CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            email TEXT NOT NULL UNIQUE,
            password TEXT NOT NULL,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
    `);

    // ===============================
    // POSTS TABLE
    // ===============================

    db.run(`
        CREATE TABLE IF NOT EXISTS posts (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            title TEXT NOT NULL,
            content TEXT NOT NULL,
            author_id INTEGER NOT NULL,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (author_id)
                REFERENCES users(id)
                ON DELETE CASCADE
        )
    `);

    // ===============================
    // COMMENTS TABLE
    // ===============================

    db.run(`
        CREATE TABLE IF NOT EXISTS comments (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            content TEXT NOT NULL,
            post_id INTEGER NOT NULL,
            author_id INTEGER NOT NULL,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (post_id)
                REFERENCES posts(id)
                ON DELETE CASCADE,
            FOREIGN KEY (author_id)
                REFERENCES users(id)
                ON DELETE CASCADE
        )
    `);

    console.log("Database tables are ready");
});

module.exports = db;