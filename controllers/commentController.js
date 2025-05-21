const Comment = require('../models/commentModel');
const Post = require('../models/postModel');

const commentController = {
    getCommentsByPostId: (req, res) => {
        const { id } = req.params;

        Comment.findAllByPostId(id, (err, comments) => {
            if (err) return res.status(500).json({ success: false, message: 'Database error' });
            res.json({ success: true, comments });
        });
    },

    addComment: (req, res) => {
        const { id } = req.params;
        const { content } = req.body;
        const userId = req.user.id;

        if (!content) return res.status(400).json({ success: false, message: 'Content is required' });
        if (content.length > 255) return res.status(400).json({ success: false, message: 'Content is too long' });
        if (content.length < 1) return res.status(400).json({ success: false, message: 'Content is too short' });
        if (!id) return res.status(400).json({ success: false, message: 'Post ID is required' });

        Post.findById(id, (err, post) => {
            if (err || !post) return res.status(404).json({ success: false, message: 'Post not found' });
            Comment.create(content, id, userId, (err) => {
                if (err) return res.status(500).json({ success: false, message: 'Database error' });
                res.status(201).json({ success: true, message: 'Comment added' });
            });
        });
    },
    deleteComment: (req, res) => {
        const { id, commentId } = req.params;

        if (!id || !commentId) return res.status(400).json({ success: false, message: 'Post ID and Comment ID are required' });

        Comment.findById(commentId, (err, comment) => {
            if (err || !comment) return res.status(404).json({ success: false, message: 'Comment not found' });
            if (comment.user_id !== req.user.id) return res.status(403).json({ success: false, message: 'Forbidden' });

            Comment.delete(commentId, (err) => {
                if (err) return res.status(500).json({ success: false, message: 'Database error' });
                res.json({ success: true, message: 'Comment deleted' });
            });
        });
    }
};

module.exports = commentController;
