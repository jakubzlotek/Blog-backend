const Post = require('../models/postModel');
const Comment = require('../models/commentModel');
const Like = require('../models/likeModel');

const postController = {
  getAllPosts: (req, res) => {
    const currentUserId = req.user?.id;
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 10;

    Post.findAllPaginated(page, limit, async (err, posts) => {
      if (err) {
        return res.status(500).json({ success: false, message: 'Database error' });
      }
      const postsWithExtras = await Promise.all(
        posts.map(async post => {
          const comments = await new Promise(resolve =>
            Comment.findAllByPostId(post.id, (err, comments) => resolve(comments || []))
          );
          const likes = await new Promise(resolve =>
            Like.findAllByPostId(post.id, (err, likes) => resolve(likes || []))
          );
          const likedUserIds = likes.map(like => like.user_id);
          const likedByCurrentUser = !!(currentUserId && likedUserIds.includes(currentUserId));
          return {
            ...post,
            comments,
            likesCount: likes.length,
            likedByCurrentUser,
            likedUserIds,
          };
        })
      );
      res.json({ success: true, posts: postsWithExtras });
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

  searchPosts: async (req, res) => {
    const { query } = req.query;
    if (!query) {
      return res.status(400).json({ success: false, message: 'Query is required' });
    }

    Post.search(query, async (err, posts) => {
      if (err) {
        console.error('searchPosts SQL error:', err);
        return res.status(500).json({ success: false, message: 'Failed to search posts' });
      }
      // Attach comments, likes, avatar, likedUserIds, etc.
      const postsWithExtras = await Promise.all(
        (posts || []).map(async post => {
          const comments = await new Promise(resolve =>
            Comment.findAllByPostId(post.id, (err, comments) => resolve(comments || []))
          );
          const likes = await new Promise(resolve =>
            Like.findAllByPostId(post.id, (err, likes) => resolve(likes || []))
          );
          const likedUserIds = likes.map(like => like.user_id);
          // If avatar_url is not present, fetch it (for compatibility)
          let avatar_url = post.avatar_url;
          if (!avatar_url && post.user_id) {
            // Try to get avatar_url from users table
            avatar_url = await new Promise(resolve => {
              const db = require('../database');
              db.get('SELECT avatar_url FROM users WHERE id = ?', [post.user_id], (err, row) => {
                resolve(row ? row.avatar_url : null);
              });
            });
          }
          return {
            ...post,
            comments,
            likesCount: likes.length,
            likedUserIds,
            avatar_url,
          };
        })
      );
      return res.json({ success: true, posts: postsWithExtras });
    });
  }
};

module.exports = postController;