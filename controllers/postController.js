const Post = require('../models/postModel');

const postController = {
    getAllPosts: (req, res) => {
        Post.findAll((err, posts) => {
            if (err) return res.status(500).send('Database error');
            if (!posts) return res.status(200).json([]);
            res.json(posts);
        });
    },

    getPostById: (req, res) => {
        const { id } = req.params;
        Post.findById(id, (err, post) => {
            if (err || !post) return res.status(404).send('Post not found');
            res.json(post);
        });
    },

    deletePost: (req, res) => {
        const { id } = req.params;
        const userId = req.user.id;


        if (!id) return res.status(400).send('Post ID is required');


        Post.findById(id, (err, post) => {
            if (err || !post) return res.status(404).send('Post not found');
            if (post.user_id !== userId) return res.status(403).send('Forbidden');

            Post.delete(id, (err) => {
                if (err) return res.status(500).send('Database error');
                res.send('Post deleted');
            });
        });
    },

    createPost: (req, res) => {
        const { title, content } = req.body;
        const userId = req.user.id;

        if (!title || !content) return res.status(400).send('Title and content are required');
        if (title.length > 255) return res.status(400).send('Title is too long');
        if (content.length > 1000) return res.status(400).send('Content is too long');

        Post.create(title, content, userId, (err) => {
            if (err) return res.status(500).send('Database error');
            res.send('Post created');
        });
    },
    searchPosts: (req, res) => {
        const { query } = req.query;
        if (!query) return res.status(400).send('Query is required');

        Post.search(query, (err, posts) => {
            if (err) return res.status(500).json({ error: 'Failed to search posts' });
            res.json(posts);
        });
    },
};

module.exports = postController;
