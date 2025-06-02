const db = require('../database');
const jwt = require('jsonwebtoken');

const postController = {
  // Uproszczona wersja – zwraca tylko wszystkie posty (bez paginacji, bez liczby lajków)
  getAllPosts: (req, res) => {
    const sql = `
      SELECT
        posts.id,
        posts.title,
        posts.content,
        posts.user_id,
        posts.created_at,
        users.username
      FROM posts
      JOIN users ON posts.user_id = users.id
      ORDER BY posts.created_at DESC
    `;

    db.all(sql, [], (err, rows) => {
      if (err) {
        console.error('getAllPosts SQL error:', err);
        return res
          .status(500)
          .json({ success: false, message: 'Database error' });
      }
      return res.json({ success: true, posts: rows || [] });
    });
  },

  getPostById: (req, res) => {
    const { id } = req.params;

    const sql = `
      SELECT
        posts.id,
        posts.title,
        posts.content,
        posts.user_id,
        posts.created_at,
        users.username
      FROM posts
      JOIN users ON posts.user_id = users.id
      WHERE posts.id = ?
    `;

    db.get(sql, [parseInt(id)], (err, post) => {
      if (err) {
        console.error('getPostById SQL error:', err);
        return res
          .status(500)
          .json({ success: false, message: 'Database error' });
      }
      if (!post) {
        return res
          .status(404)
          .json({ success: false, message: 'Post not found' });
      }
      return res.json({ success: true, post });
    });
  },

  deletePost: (req, res) => {
    const { id } = req.params;
    const userId = req.user.id;

    if (!id) {
      return res
        .status(400)
        .json({ success: false, message: 'Post ID is required' });
    }

    const sqlCheck = `SELECT user_id FROM posts WHERE id = ?`;
    db.get(sqlCheck, [parseInt(id)], (err, row) => {
      if (err) {
        console.error('deletePost SQL error (check):', err);
        return res
          .status(500)
          .json({ success: false, message: 'Database error' });
      }
      if (!row) {
        return res
          .status(404)
          .json({ success: false, message: 'Post not found' });
      }
      if (row.user_id !== userId) {
        return res
          .status(403)
          .json({ success: false, message: 'Forbidden' });
      }

      const sqlDel = `DELETE FROM posts WHERE id = ?`;
      db.run(sqlDel, [parseInt(id)], function (err) {
        if (err) {
          console.error('deletePost SQL error (delete):', err);
          return res
            .status(500)
            .json({ success: false, message: 'Database error' });
        }
        return res.json({ success: true, message: 'Post deleted' });
      });
    });
  },

  createPost: (req, res) => {
    const { title, content } = req.body;
    const userId = req.user.id;

    if (!title || !content) {
      return res
        .status(400)
        .json({ success: false, message: 'Title and content are required' });
    }
    if (title.length > 255) {
      return res
        .status(400)
        .json({ success: false, message: 'Title is too long' });
    }
    if (content.length > 1000) {
      return res
        .status(400)
        .json({ success: false, message: 'Content is too long' });
    }

    const sql = `INSERT INTO posts (title, content, user_id) VALUES (?, ?, ?)`;
    db.run(sql, [title, content, userId], function (err) {
      if (err) {
        console.error('createPost SQL error:', err);
        return res
          .status(500)
          .json({ success: false, message: 'Database error' });
      }
      return res
        .status(201)
        .json({ success: true, message: 'Post created', postId: this.lastID });
    });
  },

  searchPosts: (req, res) => {
    const { query } = req.query;
    if (!query) {
      return res
        .status(400)
        .json({ success: false, message: 'Query is required' });
    }

    const sql = `
      SELECT
        posts.id,
        posts.title,
        posts.content,
        posts.user_id,
        posts.created_at,
        users.username
      FROM posts
      JOIN users ON posts.user_id = users.id
      WHERE posts.title LIKE ? OR posts.content LIKE ?
      ORDER BY posts.created_at DESC
    `;
    const param = `%${query}%`;
    db.all(sql, [param, param], (err, posts) => {
      if (err) {
        console.error('searchPosts SQL error:', err);
        return res
          .status(500)
          .json({ success: false, message: 'Failed to search posts' });
      }
      return res.json({ success: true, posts: posts || [] });
    });
  }
};

module.exports = postController;