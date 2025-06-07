// routes/ads.js
const express = require('express');
const router  = express.Router();

// ▶️ jeżeli używasz Node ⩾ 18 masz wbudowany globalny fetch.
//    Przy starszych wersjach doinstaluj:  npm i node-fetch@^3
//    i odkomentuj linię poniżej:
// import fetch from 'node-fetch';

const EXTERNAL_API = 'https://fakestoreapi.com/products?limit=10';

// ► proste cache w pamięci – żeby nie uderzać w API przy KAŻDYM request-cie
let cache       = null;          // przechowuje już zmapowane reklamy
let cacheExpiry = 0;             // timestamp (ms) kiedy straci ważność
const TTL       = 5 * 60 * 1e3;  // 5 minut


//generate swagger docs for ads
/**
 * @swagger
 * tags:
 *   name: Ads
 *   description: API for managing ads
 */


//generate swagger docs for get ads
/**
 * @swagger
 * paths:
 *   /api/ads:
 *     get:
 *       summary: Get all ads
 *       tags: [Ads]
 *       responses:
 *         200:
 *           description: A list of ads
 *           content:
 *             application/json:
 *               schema:
 *                 type: array
 *                 items:
 *                   $ref: '#/components/schemas/Ad'
 */

router.get('/', async (req, res, next) => {
  try {
    // 1. sprawdzamy cache
    if (cache && Date.now() < cacheExpiry) {
      return res.json(cache);
    }

    // 2. pobieramy dane zewnętrzne
    const resp = await fetch(EXTERNAL_API);
    if (!resp.ok) {
      throw new Error(`External API responded ${resp.status}`);
    }

    const products = await resp.json();

    // 3. mapujemy tylko potrzebne pola
    const ads = products.map(p => ({
      id:          p.id,
      title:       p.title,
      image:       p.image,
      link:        `https://fakestoreapi.com/products/${p.id}`,
      price:       p.price,
      description: p.description,
      category:    p.category,
      rating:      p.rating
    }));

    // 4. zapisujemy w cache i zwracamy
    cache       = ads;
    cacheExpiry = Date.now() + TTL;
    res.json(ads);

  } catch (err) {
    // 5. błąd zewnętrznego API: zwróć cokolwiek mamy w cache (jeśli jest),
    //    inaczej 502
    if (cache) {
      return res.json(cache);
    }
    console.error('Ads API error:', err);
    next(err); // Express wygeneruje 500; możesz zamienić na res.status(502)…
  }
});

module.exports = router;