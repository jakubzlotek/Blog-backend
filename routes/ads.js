// routes/ads.js
const express = require('express');
const router = express.Router();


// Przykładowe dane reklam
const ads = [
  {
    id: 1,
    title: "Promocja na książki",
    image: "https://example.com/book.jpg",
    link: "https://example.com/book-sale"
  },
  {
    id: 2,
    title: "Nowe buty sportowe",
    image: "https://example.com/shoes.jpg",
    link: "https://example.com/shoes-sale"
  }
];

// Endpoint do pobierania reklam

/**
 * @swagger
 * tags:
 *   name: Ads
 *   description: Advertisement endpoints
 */

/**
 * @swagger
 * /api/ads:
 *   get:
 *     summary: Get all advertisements
 *     tags: [Ads]
 *     responses:
 *       200:
 *         description: Returns a list of advertisements
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   id:
 *                     type: integer
 *                   title:
 *                     type: string
 *                   image:
 *                     type: string
 *                   link:
 *                     type: string
 */
router.get('/', (req, res) => {
  res.json(ads);
});

module.exports = router;