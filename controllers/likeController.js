const Like = require('../models/likeModel');
const Post = require('../models/postModel');

const likeController = {
    getLikesByPostId: (req, res) => {
        const { id } = req.params;

        Like.findAllByPostId(id, (err, likes) => {
            if (err) return res.status(500).json({ success: false, message: 'Database error' });
            res.json({ success: true, likes });
        });
    },

    addLike: (req, res) => {
        const { id } = req.params;
        const userId = req.user.id;

        if (!id) return res.status(400).json({ success: false, message: 'Post ID is required' });

        Post.findById(id, (err, post) => {
            if (err) return res.status(500).json({ success: false, message: 'Database error' });
            if (!post) return res.status(404).json({ success: false, message: 'Post not found' });

            // Check if the user already liked this post
            Like.findAllByPostId(id, (err, likes) => {
                if (err) return res.status(500).json({ success: false, message: 'Database error' });
                if (likes.some(like => like.user_id === userId)) {
                    return res.status(409).json({ success: false, message: 'Already liked' });
                }
                Like.create(id, userId, (err) => {
                    if (err) return res.status(500).json({ success: false, message: 'Database error' });
                    res.status(201).json({ success: true, message: 'Like added' });
                });
            });
        });
    }
};

module.exports = likeController;
