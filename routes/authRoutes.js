const express = require('express');
const { body, validationResult } = require('express-validator');
const authController = require('../controllers/authController');

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Authentication
 *   description: Authentication endpoints
 */


/**
 * @swagger
 * /api/auth/register:
 *   post:
 *     summary: Register a new user
 *     description: This endpoint registers a new user with username, email, and password.
 *     tags:
 *       - Authentication
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
 *            username: test
 *            email: test@test.pl
 *            password: test
 *     responses:
 *       201:
 *         description: User created successfully
 *       400:
 *         description: Missing fields or user already exists
 *       500:
 *         description: Internal server error
 */
router.post(
  '/register',
  [
    body('username')
      .isLength({ min: 3 })
      .withMessage('Username must be at least 3 characters long'),
    body('email')
      .isEmail()
      .withMessage('Invalid email format'),
    body('password')
      .isLength({ min: 8 })
      .withMessage('Password must be at least 8 characters long')
      .matches(/[A-Z]/)
      .withMessage('Password must contain an uppercase letter')
      .matches(/[a-z]/)
      .withMessage('Password must contain a lowercase letter')
      .matches(/\d/)
      .withMessage('Password must contain a digit')
      .matches(/[\W_]/)
      .withMessage('Password must contain a special character'),
  ],
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    next();
  },
  authController.register
);
/**
 * @swagger
 * /api/auth/login:
 *   post:
 *     summary: Log in an existing user
 *     description: This endpoint logs in a user and returns a JWT token.
 *     tags:
 *       - Authentication
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               identifier:
 *                 type: string
 *               password:
 *                 type: string
 *           example:
 *            identifier: test@test.pl
 *            password: test
 *     responses:
 *       200:
 *         description: Login successful, returns JWT token
 *       400:
 *         description: Missing fields or invalid credentials
 *       500:
 *         description: Internal server error
 */
router.post(
  '/login',
  [
    body('identifier')
      .notEmpty().withMessage('Email lub nazwa użytkownika jest wymagana')
      .custom(val => {
        if (val.includes('@') && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val)) {
          throw new Error('Nieprawidłowy format email');
        }
        return true;
      }),
    body('password')
      .notEmpty().withMessage('Hasło jest wymagane'),
  ],
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    next();
  },
  authController.login
);
/**
 * @swagger
 * /api/auth/refresh:
 *   post:
 *     summary: Refresh JWT token
 *     description: Returns a new JWT token if the old one is valid (not expired).
 *     tags:
 *       - Authentication
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: New JWT token
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 */
router.post('/refresh', authController.refreshToken);

module.exports = router;


