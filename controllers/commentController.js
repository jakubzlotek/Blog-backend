const Comment = require('../models/commentModel');

const commentController = {
    getCommentsByPostId: (req, res) => {
        const { id } = req.params;

        Comment.findAllByPostId(id, (err, comments) => {
            if (err) return res.status(500).send('Database error');
            res.json(comments);
        });
    },

    addComment: (req, res) => {
        const { id } = req.params;
        const { content } = req.body;
        const userId = req.user.id;

        if (!content) return res.status(400).send('Content is required');

        Comment.create(content, id, userId, (err) => {
            if (err) return res.status(500).send('Database error');
            res.status(201).send('Comment added');
        });
    },
    deleteComment: (req, res) => {
        const { commentId } = req.params;
        const userId = req.user.id;
        console.log(userId, commentId);

        Comment.findById(commentId, (err, comment) => {
            if (err || !comment) return res.status(404).send('Comment not found');
            if (comment.user_id !== userId) return res.status(403).send('Forbidden');
    
            // Proceed to delete the comment if the user is authorized
            Comment.delete(commentId, (err) => {
                if (err) return res.status(500).send('Database error');
                res.status(200).send('Comment deleted');
            });
        });
    }
};

module.exports = commentController;
