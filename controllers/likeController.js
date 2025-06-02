const Like = require('../models/likeModel');
const db = require('../database');

const likeController = {
  getLikesByPostId: (req, res) => {
    const { id } = req.params;
    Like.findAllByPostId(id, (err, likes) => {
      if (err) {
        return res
          .status(500)
          .json({ success: false, message: 'Database error' });
      }
      return res.json({ success: true, likes });
    });
  },

  addLike: (req, res) => {
    const { id } = req.params; // post_id
    const userId = req.user.id;

    if (!id) {
      return res
        .status(400)
        .json({ success: false, message: 'Post ID is required' });
    }

    // Sprawdzamy, czy post istnieje:
    const sqlCheckPost = `SELECT * FROM posts WHERE id = ?`;
    db.get(sqlCheckPost, [parseInt(id)], (err, postRow) => {
      if (err) {
        return res
          .status(500)
          .json({ success: false, message: 'Database error' });
      }
      if (!postRow) {
        return res
          .status(404)
          .json({ success: false, message: 'Post not found' });
      }

      // Sprawdzamy, czy user już polubił
      Like.findAllByPostId(id, (err, likes) => {
        if (err) {
          return res
            .status(500)
            .json({ success: false, message: 'Database error' });
        }
        if (likes.some(like => like.user_id === userId)) {
          return res
            .status(409)
            .json({ success: false, message: 'Already liked' });
        }
        // Dodajemy lajka
        Like.create(id, userId, err => {
          if (err) {
            return res
              .status(500)
              .json({ success: false, message: 'Database error' });
          }
          return res
            .status(201)
            .json({ success: true, message: 'Like added' });
        });
      });
    });
  },

  removeLike: (req, res) => {
    const { id } = req.params; // post_id
    const userId = req.user.id;

    if (!id) {
      return res
        .status(400)
        .json({ success: false, message: 'Post ID is required' });
    }

    // Sprawdzamy, czy laj Polska istnieje:
    const sqlCheck = `SELECT * FROM likes WHERE post_id = ? AND user_id = ?`;
    db.get(sqlCheck, [parseInt(id), userId], (err, likeRow) => {
      if (err) {
        return res
          .status(500)
          .json({ success: false, message: 'Database error' });
      }
      if (!likeRow) {
        return res
          .status(404)
          .json({ success: false, message: 'Like not found' });
      }
      // Usuwamy lajka
      const sqlDel = `DELETE FROM likes WHERE post_id = ? AND user_id = ?`;
      db.run(sqlDel, [parseInt(id), userId], err => {
        if (err) {
          return res
            .status(500)
            .json({ success: false, message: 'Database error' });
        }
        return res.json({ success: true, message: 'Like removed' });
      });
    });
  }
};

module.exports = likeController;