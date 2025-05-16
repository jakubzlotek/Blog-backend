const db = require('../database');

const Post = {
    findAll: (callback) => {
        db.all(
            `SELECT posts.*, users.username, users.avatar_url
             FROM posts
             JOIN users ON posts.user_id = users.id
             ORDER BY posts.created_at DESC`,
            callback
        );
    },
    findAllPaginated: (page = 1, limit = 10, callback) => {
        const offset = (page - 1) * limit;
        db.all(
            `SELECT posts.*, users.username, users.avatar_url
             FROM posts
             JOIN users ON posts.user_id = users.id
             ORDER BY posts.created_at DESC
             LIMIT ? OFFSET ?`,
            [limit, offset],
            callback
        );
    },
    findById: (id, callback) => {
        db.get('SELECT * FROM posts WHERE id = ?', [id], callback);
    },
    create: (title, content, userId, callback) => {
        db.run('INSERT INTO posts (title, content, user_id) VALUES (?, ?, ?)', [title, content, userId], callback);
    },
    delete: (id, callback) => {
        db.run('DELETE FROM posts WHERE id = ?', [id], callback);
    },
    search: (query, callback) => {
        const hashtags = query.match(/#[\w]+/g) || [];
        const plainText = query.replace(/#[\w]+/g, '').trim();


        let sql = 'SELECT * FROM posts WHERE ';
        let params = [];
        if (hashtags.length > 0) {
            sql += hashtags.map((tag) => 'content LIKE ?').join(' AND ');
            params = hashtags.map((tag) => `%${tag}%`);
        } else {
            sql += '(title LIKE ? OR content LIKE ?)';
            params.push(`%${plainText}%`, `%${plainText}%`);
        }
        sql += ' ORDER BY created_at DESC';
        db.all(sql, params, callback);


    },

};

module.exports = Post;
