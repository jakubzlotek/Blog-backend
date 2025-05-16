const Like = require('../models/likeModel');
const Post = require('../models/postModel');

const likeController = {
    getLikesByPostId: (req, res) => {
        const { id } = req.params;

        Like.findAllByPostId(id, (err, likes) => {
            if (err) return res.status(500).send('Database error');
            res.json(likes);
        });
    },

    addLike: (req, res) => {
        const { id } = req.params;
        const userId = req.user.id;

        if (!id) return res.status(400).send('Post ID is required');

        Post.findById(id, (err, post) => {
            if (err) return res.status(500).send('Database error');
            if (!post) return res.status(404).send('Post not found');

            // Check if the user already liked this post
            Like.findAllByPostId(id, (err, likes) => {
                if (err) return res.status(500).send('Database error');
                if (likes.some(like => like.user_id === userId)) {
                    return res.status(409).send('Already liked');
                }
                Like.create(id, userId, (err) => {
                    if (err) return res.status(500).send('Database error');
                    res.status(201).send('Like added');
                });
            });
        });

    }
};

module.exports = likeController;
