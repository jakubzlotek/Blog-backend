const express = require('express');
const userController = require('../controllers/userController');
const authenticate = require('../middlewares/authMiddleware');
const avatarUpload = require('../middlewares/avatarUpload');

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: User
 *   description: User management and profile endpoints
 */

/**
 * @swagger
 * /api/user/me:
 *   get:
 *     summary: Get the current authenticated user's profile
 *     tags: [User]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: User profile information
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: integer
 *                 username:
 *                   type: string
 *                 email:
 *                   type: string
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: User not found
 */
router.get('/me', authenticate, userController.getProfile);

/**
 * @swagger
 * /api/user/me:
 *   put:
 *     summary: Update the current authenticated user's profile
 *     tags: [User]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               username:
 *                 type: string
 *               email:
 *                 type: string
 *               password:
 *                 type: string
 *           example:
 *             username: newname
 *             email: new@example.com
 *             password: newpassword
 *     responses:
 *       200:
 *         description: User profile updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: integer
 *                 username:
 *                   type: string
 *                 email:
 *                   type: string
 *       400:
 *         description: Bad request
 *       401:
 *         description: Unauthorized
 */
router.put('/me', authenticate, userController.updateProfile);

/**
 * @swagger
 * /api/user/{userid}:
 *   get:
 *     summary: Get a user by ID
 *     tags: [User]
 *     parameters:
 *       - in: path
 *         name: userid
 *         required: true
 *         schema:
 *           type: integer
 *         description: The user ID
 *     responses:
 *       200:
 *         description: Public user info
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: integer
 *                 username:
 *                   type: string
 *                 email:
 *                   type: string
 *       404:
 *         description: User not found
 */
router.get('/:userid', userController.getUserById);

/**
 * @swagger
 * /api/user/me/avatar:
 *   post:
 *     summary: Upload an avatar for the current authenticated user
 *     tags: [User]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               avatar:
 *                 type: string
 *                 format: binary
 *     responses:
 *       200:
 *         description: Avatar uploaded successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 avatarUrl:
 *                   type: string
 */
router.post(
  '/me/avatar',
  authenticate,
  avatarUpload.single('avatar'),
  userController.uploadAvatar
);

module.exports = router;