// ============================================================
// weatherController.js - Weather API Integration
// ============================================================
// Fetches current weather data from weatherapi.com
// API Docs: https://www.weatherapi.com/docs/
// ============================================================

const fetch = require('node-fetch');

const WEATHER_API_BASE = 'https://api.weatherapi.com/v1/current.json';
const API_KEY = process.env.WEATHER_API_KEY;

/**
 * Get current weather for a destination.
 * @param {string} city - City name (e.g., "Paris", "New York")
 * @returns {Object} Weather data or error object
 */
async function getWeather(city) {
    if (!API_KEY || API_KEY === 'your_openweathermap_api_key_here') {
        return { error: 'Weather API key not configured. Add it to your .env file.' };
    }

    if (!city || city.trim() === '') {
        return { error: 'Please provide a destination city name.' };
    }

    try {
        const url = `${WEATHER_API_BASE}?key=${API_KEY}&q=${encodeURIComponent(city.trim())}&aqi=no`;
        const response = await fetch(url);

        if (!response.ok) {
            if (response.status === 401) {
                return { error: 'Invalid weather API key. Please check your .env file.' };
            }
            if (response.status === 400) {
                return { error: `City "${city}" not found. Please check the spelling.` };
            }
            return { error: `Weather service error: ${response.status}` };
        }

        const data = await response.json();

        return {
            success: true,
            data: {
                city: data.location.name,
                country: data.location.country,
                temp_c: data.current.temp_c,
                temp_f: data.current.temp_f,
                condition: data.current.condition.text,
                condition_icon: data.current.condition.icon,
                humidity: data.current.humidity,
                wind_kph: data.current.wind_kph,
                feelslike_c: data.current.feelslike_c,
                feelslike_f: data.current.feelslike_f,
                localtime: data.location.localtime
            }
        };
    } catch (err) {
        console.error('Weather API error:', err.message);
        return { error: 'Unable to fetch weather data. Please try again later.' };
    }
}

module.exports = { getWeather };
