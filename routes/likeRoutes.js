const express = require('express');
const likeController = require('../controllers/likeController');
const authenticate = require('../middlewares/authMiddleware');

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Like
 *   description: Like endpoints
 */

/**
 * @swagger
 * /api/posts/{id}/like:
 *   get:
 *     summary: Get all likes for a post
 *     tags: [Like]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *         description: The post id
 *     responses:
 *       200:
 *         description: The list of likes for the post
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Like'
 */
router.get('/:id/like', likeController.getLikesByPostId);

/**
 * @swagger
 * /api/posts/{id}/like:
 *   post:
 *     summary: Add a like to a post
 *     tags: [Like]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *         description: The post id
 *     responses:
 *       201:
 *         description: Like added successfully
 *       400:
 *         description: Bad request
 */
router.post('/:id/like', authenticate, likeController.addLike);

module.exports = router;
