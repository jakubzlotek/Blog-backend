const db = require('../database');

const Like = {
  findAllByPostId: (postId, callback) => {
    db.all('SELECT * FROM likes WHERE post_id = ?', [postId], callback);
  },
  create: (postId, userId, callback) => {
    db.run('INSERT INTO likes (post_id, user_id) VALUES (?, ?)', [postId, userId], callback);
  }
};

module.exports = Like;