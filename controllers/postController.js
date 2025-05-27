const Post = require('../models/postModel');
const Comment = require('../models/commentModel');
const Like = require('../models/likeModel');

const postController = {
    getAllPosts: (req, res) => {
        const page = req.query.page ? parseInt(req.query.page) : null;
        const limit = req.query.limit ? parseInt(req.query.limit) : null;

        const handlePosts = async (posts) => {
            try {
                // For each post, fetch comments and likes count
                const postsWithExtras = await Promise.all(
                    (posts || []).map(async (post) => {
                        const comments = await new Promise((resolve) => {
                            Comment.findAllByPostId(post.id, (err, comments) => {
                                resolve(comments || []);
                            });
                        });
                        const likes = await new Promise((resolve) => {
                            Like.findAllByPostId(post.id, (err, likes) => {
                                resolve(likes || []);
                            });
                        });
                        return {
                            ...post,
                            comments,
                            likesCount: Array.isArray(likes) ? likes.length : 0,
                        };
                    })
                );
                res.json({ success: true, posts: postsWithExtras });
            } catch (e) {
                res.status(500).json({ success: false, message: 'Database error' });
            }
        };
        if (page && limit) {
            Post.findAllPaginated(page, limit, (err, posts) => {
                if (err) return res.status(500).json({ success: false, message: 'Database error' });
                handlePosts(posts);
            });
        } else {
            Post.findAll((err, posts) => {
                if (err) return res.status(500).json({ success: false, message: 'Database error' });
                handlePosts(posts);
            });
        }
    },

    getPostById: (req, res) => {
        const { id } = req.params;
        Post.findById(id, async (err, post) => {
            if (err || !post) return res.status(404).json({ success: false, message: 'Post not found' });
            try {
                const comments = await new Promise((resolve) => {
                    Comment.findAllByPostId(post.id, (err, comments) => {
                        resolve(comments || []);
                    });
                });
                const likes = await new Promise((resolve) => {
                    Like.findAllByPostId(post.id, (err, likes) => {
                        resolve(likes || []);
                    });
                });
                res.json({
                    success: true,
                    post: {
                        ...post,
                        comments,
                        likesCount: Array.isArray(likes) ? likes.length : 0,
                    },
                });
            } catch (e) {
                res.status(500).json({ success: false, message: 'Database error' });
            }
        });
    },

    deletePost: (req, res) => {
        const { id } = req.params;
        const userId = req.user.id;


        if (!id) return res.status(400).json({ success: false, message: 'Post ID is required' });

        Post.findById(id, (err, post) => {
            if (err || !post) return res.status(404).json({ success: false, message: 'Post not found' });
            if (post.user_id !== userId) return res.status(403).json({ success: false, message: 'Forbidden' });

            Post.delete(id, (err) => {
                if (err) return res.status(500).json({ success: false, message: 'Database error' });
                res.json({ success: true, message: 'Post deleted' });
            });
        });
    },

    createPost: (req, res) => {
        const { title, content } = req.body;
        const userId = req.user.id;

        if (!title || !content) return res.status(400).json({ success: false, message: 'Title and content are required' });
        if (title.length > 255) return res.status(400).json({ success: false, message: 'Title is too long' });
        if (content.length > 1000) return res.status(400).json({ success: false, message: 'Content is too long' });

        Post.create(title, content, userId, (err) => {
            if (err) return res.status(500).json({ success: false, message: 'Database error' });
            res.status(201).json({ success: true, message: 'Post created' });
        });
    },
    searchPosts: (req, res) => {
        const { query } = req.query;
        if (!query) return res.status(400).json({ success: false, message: 'Query is required' });

        Post.search(query, (err, posts) => {
            if (err) return res.status(500).json({ success: false, message: 'Failed to search posts' });
            res.json({ success: true, posts });
        });
    },
};

module.exports = postController;
