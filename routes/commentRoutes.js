const express = require('express');
const commentController = require('../controllers/commentController');
const authenticate = require('../middlewares/authMiddleware');

const router = express.Router();

/**
 * @swagger
 * /api/posts/{id}/comments:
 *   get:
 *     summary: Get all comments for a post
 *     description: This endpoint retrieves all comments for a specific post.
 *     tags:
 *       - Comments
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: Post ID
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Comments retrieved successfully
 *       500:
 *         description: Internal server error
 */
router.get('/:id/comments', commentController.getCommentsByPostId);

/**
 * @swagger
 * /api/posts/{id}/comments:
 *   post:
 *     summary: Add a new comment to a post
 *     description: This endpoint adds a new comment to a specific post.
 *     tags:
 *       - Comments
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: Post ID
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               text:
 *                 type: string
 *     responses:
 *       201:
 *         description: Comment added successfully
 *       400:
 *         description: Missing fields
 *       500:
 *         description: Internal server error
 */
router.post('/:id/comments', authenticate, commentController.addComment);

//generate swagger documentation for the delete comment endpoint
/**
 * @swagger
 * /api/posts/{id}/comments:
 *   delete:
 *     summary: Delete a comment
 *     description: This endpoint deletes a specific comment.
 *     tags:
 *       - Comments
 *     parameters:
 *       - in: path
 *         name: commentId
 *         required: true
 *         description: Comment ID
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Comment deleted successfully
 *       403:
 *         description: Forbidden
 *       404:
 *         description: Comment not found
 *       500:
 *        description: Internal server error
 */
router.delete('/:id/comments', authenticate, commentController.deleteComment);

module.exports = router;
