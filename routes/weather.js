const express = require('express');
const fetch = require('node-fetch');
const router = express.Router();

// GET /api/weather?city=:city
router.get('/', async (req, res) => {
    console.log('[WEATHER] Route hit! URL:', req.url, 'Query:', req.query);
    try {
        const { city } = req.query;

        if (!city || city.trim() === '') {
            return res.status(400).json({ success: false, error: 'City is required' });
        }

        const apiKey = process.env.WEATHER_API_KEY;
        if (!apiKey) {
            return res.status(500).json({ success: false, error: 'Weather API key not configured' });
        }

        const url = `https://api.weatherapi.com/v1/current.json?key=${apiKey}&q=${encodeURIComponent(city.trim())}&aqi=no`;

        const response = await fetch(url);
        const data = await response.json();

        if (!response.ok) {
            return res.status(response.status).json({
                success: false,
                error: data.error?.message || 'Weather API error'
            });
        }

        res.json({
            success: true,
            data: {
                city: data.location.name,
                country: data.location.country,
                temp_c: data.current.temp_c,
                temp_f: data.current.temp_f,
                condition: data.current.condition.text,
                icon: data.current.condition.icon,
                humidity: data.current.humidity,
                wind_kph: data.current.wind_kph,
                feelslike_c: data.current.feelslike_c,
                feelslike_f: data.current.feelslike_f,
                localtime: data.location.localtime
            }
        });
    } catch (err) {
        console.error('Weather API error:', err);
        res.status(500).json({ success: false, error: 'Server error fetching weather' });
    }
});

module.exports = router;
