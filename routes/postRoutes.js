const express = require('express');
const postController = require('../controllers/postController');
const authenticate = require('../middlewares/authMiddleware');
const likeController = require('../controllers/likeController')

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Posts
 *   description: Post endpoints
 */

/**
 * @swagger
 * /api/posts:
 *   get:
 *     summary: Get all posts
 *     description: This endpoint returns all the latest posts.
 *     tags:
 *       - Posts
 *     responses:
 *       200:
 *         description: Returns an array of posts
 *       500:
 *         description: Internal server error
 */
router.get('/', postController.getAllPosts);

/**
 * @swagger
 * /api/posts:
 *   post:
 *     summary: Create a new post
 *     description: This endpoint allows a logged-in user to create a new post.
 *     tags:
 *       - Posts
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *               content:
 *                 type: string
 *     responses:
 *       201:
 *         description: Post created successfully
 *       400:
 *         description: Missing fields or invalid data
 *       401:
 *         description: Unauthorized, user must be logged in
 *       500:
 *         description: Internal server error
 */
router.post('/', authenticate, postController.createPost);


/**
 * @swagger
 * /api/posts/search:
 *   get:
 *     summary: Search posts by hashtags or keywords
 *     description: This endpoint allows searching for posts using hashtags or keywords.
 *     tags:
 *       - Posts
 *     parameters:
 *       - name: query
 *         in: query
 *         required: true
 *         description: The search query, which can include hashtags or keywords
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Returns an array of matching posts
 *       500:
 *         description: Internal server error
 *       400:
 *        description: Missing query parameter
 */
router.get('/search', postController.searchPosts);


/**
 * @swagger
 * /api/posts/{id}:
 *   get:
 *     summary: Get a post by ID
 *     description: This endpoint returns a specific post by its ID.
 *     tags:
 *       - Posts
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         description: The ID of the post to retrieve
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Returns the post object
 *       404:
 *         description: Post not found
 *       500:
 *         description: Internal server error
 */
router.get('/:id', postController.getPostById);

/**
 * @swagger
 * /api/posts/{id}:
 *   delete:
 *     summary: Delete a post by ID
 *     description: This endpoint deletes a post if the logged-in user owns it.
 *     tags:
 *       - Posts
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         description: The ID of the post to delete
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Post deleted successfully
 *       401:
 *         description: Unauthorized, user must be the owner of the post
 *       404:
 *         description: Post not found
 *       500:
 *         description: Internal server error
 */
router.delete('/:id', authenticate, postController.deletePost);

router.post('/:id/like', authenticate, likeController.addLike);

router.delete('/:id/like', authenticate, likeController.removeLike);

module.exports = router;
