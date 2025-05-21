const sqlite3 = require('sqlite3').verbose();
const fs = require('fs');
const path = require('path');

const dbPath = process.env.DB_PATH || './database.db';
const db = new sqlite3.Database(dbPath, (err) => {
    if (err) {
        console.error("Could not open database:", err.message);
        process.exit(1);
    } else {
        console.log(`Connected to the SQLite database at ${dbPath}.`);
        // Optional: Initialize schema if needed
        const schemaPath = path.join(__dirname, 'databaseSchema.sql');
        if (fs.existsSync(schemaPath)) {
            const schema = fs.readFileSync(schemaPath, 'utf8');
            db.exec(schema, (err) => {
                if (err) {
                    console.error("Failed to initialize database schema:", err.message);
                }
            });
        }
    }
});

// Graceful shutdown
process.on('SIGINT', () => {
    db.close(() => {
        console.log('Database connection closed.');
        process.exit(0);
    });
});

module.exports = db;