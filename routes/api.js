// ============================================================
// api.js - API Routes (AJAX Endpoints)
// ============================================================
// Routes: /api/weather, /api/exchange, /api/convert
// These return JSON data for the frontend JavaScript to use.
// ============================================================

const express = require('express');
const router = express.Router();
const weatherController = require('../controllers/weatherController');
const exchangeController = require('../controllers/exchangeController');
const { requireLogin } = require('../controllers/authController');

// All API routes require authentication
router.use(requireLogin);

// --- Weather API ---
// GET /api/weather?city=Paris
router.get('/weather', async (req, res) => {
    const { city } = req.query;
    const result = await weatherController.getWeather(city);
    res.json(result);
});

// --- Exchange Rate API ---
// GET /api/exchange?base=USD
router.get('/exchange', async (req, res) => {
    const { base } = req.query;
    const result = await exchangeController.getExchangeRates(base || 'USD');
    res.json(result);
});

// --- Currency Conversion API ---
// GET /api/convert?from=USD&to=EUR&amount=100
router.get('/convert', async (req, res) => {
    const { from, to, amount } = req.query;
    if (!amount || isNaN(parseFloat(amount))) {
        return res.json({ error: 'Please provide a valid amount.' });
    }
    const result = await exchangeController.convertCurrency(from, to, amount);
    res.json(result);
});

module.exports = router;
