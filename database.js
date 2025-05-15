const sqlite3 = require('sqlite3').verbose();

const dbPath = process.env.DB_PATH || './database.db';
const db = new sqlite3.Database(dbPath, (err) => {
    if (err) {
        console.error("Could not open database:", err.message);
    }
    // else {
    //     console.log(`Connected to the SQLite database at ${dbPath}.`);
    // }
});

module.exports = db;