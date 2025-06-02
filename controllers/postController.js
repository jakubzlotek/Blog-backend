const Post = require('../models/postModel');

const postController = {
  getAllPosts: (req, res) => {
    Post.findAll((err, rows) => {
      if (err) {
        console.error('getAllPosts SQL error:', err);
        return res.status(500).json({ success: false, message: 'Database error' });
      }
      return res.json({ success: true, posts: rows || [] });
    });
  },

  getPostById: (req, res) => {
    const id = parseInt(req.params.id, 10);
    Post.findById(id, (err, post) => {
      if (err) {
        console.error('getPostById SQL error:', err);
        return res.status(500).json({ success: false, message: 'Database error' });
      }
      if (!post) {
        return res.status(404).json({ success: false, message: 'Post not found' });
      }
      return res.json({ success: true, post });
    });
  },

  deletePost: (req, res) => {
    const id = parseInt(req.params.id, 10);
    const userId = req.user.id;

    if (!id) {
      return res.status(400).json({ success: false, message: 'Post ID is required' });
    }

    // Najpierw sprawdź, czy użytkownik jest właścicielem
    Post.findById(id, (err, post) => {
      if (err) {
        console.error('deletePost SQL error (findById):', err);
        return res.status(500).json({ success: false, message: 'Database error' });
      }
      if (!post) {
        return res.status(404).json({ success: false, message: 'Post not found' });
      }
      if (post.user_id !== userId) {
        return res.status(403).json({ success: false, message: 'Forbidden' });
      }

      // Usuń post
      Post.delete(id, (err) => {
        if (err) {
          console.error('deletePost SQL error (delete):', err);
          return res.status(500).json({ success: false, message: 'Database error' });
        }
        return res.json({ success: true, message: 'Post deleted' });
      });
    });
  },

  createPost: (req, res) => {
    const { title, content } = req.body;
    const userId = req.user.id;

    if (!title || !content) {
      return res.status(400).json({ success: false, message: 'Title and content are required' });
    }
    if (title.length > 255) {
      return res.status(400).json({ success: false, message: 'Title is too long' });
    }
    if (content.length > 1000) {
      return res.status(400).json({ success: false, message: 'Content is too long' });
    }

    Post.create(title, content, userId, (err, newPostId) => {
      if (err) {
        console.error('createPost SQL error:', err);
        return res.status(500).json({ success: false, message: 'Database error' });
      }
      return res.status(201).json({ success: true, message: 'Post created', postId: newPostId });
    });
  },

  searchPosts: (req, res) => {
    const { query } = req.query;
    if (!query) {
      return res.status(400).json({ success: false, message: 'Query is required' });
    }

    Post.search(query, (err, rows) => {
      if (err) {
        console.error('searchPosts SQL error:', err);
        return res.status(500).json({ success: false, message: 'Failed to search posts' });
      }
      return res.json({ success: true, posts: rows || [] });
    });
  }
};

module.exports = postController;