const express = require('express');
const fetch = require('node-fetch');
const router = express.Router();

const SUPPORTED_CURRENCIES = ['USD', 'EUR', 'GBP', 'JPY', 'CAD', 'AUD', 'CHF', 'CNY', 'INR', 'MXN', 'BRL', 'KRW', 'SGD', 'HKD', 'THB', 'ZAR'];

// GET /api/currency/convert?from=X&to=Y&amount=N
router.get('/convert', async (req, res) => {
    try {
        const { from, to, amount } = req.query;

        if (!from || !to || !amount) {
            return res.status(400).json({ success: false, error: 'from, to, and amount are required' });
        }

        const fromUpper = from.toUpperCase();
        const toUpper = to.toUpperCase();
        const numAmount = parseFloat(amount);

        if (isNaN(numAmount) || numAmount < 0) {
            return res.status(400).json({ success: false, error: 'Invalid amount' });
        }

        if (!SUPPORTED_CURRENCIES.includes(fromUpper) || !SUPPORTED_CURRENCIES.includes(toUpper)) {
            return res.status(400).json({ success: false, error: 'Unsupported currency code' });
        }

        const apiKey = process.env.EXCHANGE_API_KEY;
        if (!apiKey) {
            return res.status(500).json({ success: false, error: 'Exchange API key not configured' });
        }

        const url = `https://v6.exchangerate-api.com/v6/${apiKey}/latest/${fromUpper}`;
        const response = await fetch(url);
        const data = await response.json();

        if (!response.ok || data.result === 'error') {
            return res.status(response.status).json({
                success: false,
                error: data['error-type'] || 'Exchange rate API error'
            });
        }

        const rate = data.conversion_rates[toUpper];
        const convertedAmount = (numAmount * rate).toFixed(2);

        res.json({
            success: true,
            data: {
                from: fromUpper,
                to: toUpper,
                originalAmount: numAmount,
                rate,
                convertedAmount: parseFloat(convertedAmount)
            }
        });
    } catch (err) {
        console.error('Currency API error:', err);
        res.status(500).json({ success: false, error: 'Server error converting currency' });
    }
});

module.exports = router;
