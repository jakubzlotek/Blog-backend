const db = require('../database');

const User = {
    findByEmail: (email, callback) => {
        db.get('SELECT * FROM users WHERE email = ?', [email], callback);
    },
    findByUsername: (username, callback) => {
        db.get('SELECT * FROM users WHERE username = ?', [username], callback);
    },
    create: (username, email, password, callback) => {
        db.run(
            'INSERT INTO users (username, email, password) VALUES (?, ?, ?)',
            [username, email, password],
            function (err) {
                if (err) return callback(err);
                // Return the newly created user (without password)
                db.get('SELECT id, username, email FROM users WHERE id = ?', [this.lastID], callback);
            }
        );
    },
    findById: (id, callback) => {
        db.get('SELECT id, username, email, avatar_url FROM users WHERE id = ?', [id], callback);
    },
    update: (id, data, callback) => {
        // data: { username, email, password?, avatar_url? }
        if (data.password) {
            db.run(
                'UPDATE users SET username = ?, email = ?, password = ?, avatar_url = COALESCE(?, avatar_url) WHERE id = ?',
                [data.username, data.email, data.password, data.avatar_url, id],
                function (err) {
                    if (err) return callback(err);
                    db.get('SELECT id, username, email, avatar_url FROM users WHERE id = ?', [id], callback);
                }
            );
        } else {
            db.run(
                'UPDATE users SET username = ?, email = ?, avatar_url = COALESCE(?, avatar_url) WHERE id = ?',
                [data.username, data.email, data.avatar_url, id],
                function (err) {
                    if (err) return callback(err);
                    db.get('SELECT id, username, email, avatar_url FROM users WHERE id = ?', [id], callback);
                }
            );
        }
    },
};

module.exports = User;
