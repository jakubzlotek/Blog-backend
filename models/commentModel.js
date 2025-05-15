const db = require('../database');
const { findById } = require('./postModel');

const Comment = {
    findAllByPostId: (postId, callback) => {
        db.all('SELECT * FROM comments WHERE post_id = ?', [postId], callback);
    },
    create: (content, postId, userId, callback) => {
        db.run('INSERT INTO comments (content, post_id, user_id) VALUES (?, ?, ?)', [content, postId, userId], callback);
    },
    delete: (commentId, callback) => {
        db.run('DELETE FROM comments WHERE id = ?', [commentId], callback);
    },
    findById: (commentId, callback) => {
        db.get('SELECT * FROM comments WHERE id = ?', [commentId], callback);
    }
};

module.exports = Comment;
