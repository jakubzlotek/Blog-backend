const db = require('../database');

const Post = {
    findAll: (callback) => {
        db.all('SELECT * FROM posts ORDER BY created_at DESC', callback);
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
