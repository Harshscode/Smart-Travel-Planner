// ============================================================
// api.js - External API Integration
// ============================================================
// All functions are exposed as window.api.*
// ============================================================

(function(window) {
    'use strict';

    // API Keys (embedded for client-side use)
    var WEATHER_API_KEY = 'e5b14e5e327249128c1135910240105';
    var EXCHANGE_API_KEY = 'f781c5b5ecedaf552c7fa743';

    var WEATHER_API_BASE = 'https://api.weatherapi.com/v1/current.json';
    var EXCHANGE_API_BASE = 'https://v6.exchangerate-api.com/v6';

    // --- Weather ---

    function checkWeather(city) {
        return new Promise(function(resolve) {
            if (!city || city.trim() === '') {
                resolve({ success: false, error: 'Please enter a city name.' });
                return;
            }

            fetch(WEATHER_API_BASE + '?key=' + WEATHER_API_KEY + '&q=' + encodeURIComponent(city.trim()) + '&aqi=no')
                .then(function(response) {
                    if (!response.ok) {
                        if (response.status === 400) {
                            resolve({ success: false, error: 'City "' + city + '" not found. Please check the spelling.' });
                        } else if (response.status === 401) {
                            resolve({ success: false, error: 'Invalid weather API key.' });
                        } else {
                            resolve({ success: false, error: 'Weather service error: ' + response.status });
                        }
                        return;
                    }
                    return response.json();
                })
                .then(function(data) {
                    if (!data) return;
                    resolve({
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
                    });
                })
                .catch(function(err) {
                    console.error('Weather API error:', err);
                    resolve({ success: false, error: 'Unable to fetch weather data. Please try again.' });
                });
        });
    }

    // --- Exchange Rate ---

    function getCurrencyName(code) {
        var names = {
            USD: 'US Dollar', EUR: 'Euro', GBP: 'British Pound', JPY: 'Japanese Yen',
            CAD: 'Canadian Dollar', AUD: 'Australian Dollar', CHF: 'Swiss Franc',
            CNY: 'Chinese Yuan', INR: 'Indian Rupee', MXN: 'Mexican Peso',
            BRL: 'Brazilian Real', KRW: 'South Korean Won', SGD: 'Singapore Dollar',
            HKD: 'Hong Kong Dollar', THB: 'Thai Baht', ZAR: 'South African Rand'
        };
        return names[code] || code;
    }

    function convertCurrency(from, to, amount) {
        return new Promise(function(resolve) {
            if (!EXCHANGE_API_KEY) {
                resolve({ success: false, error: 'Exchange rate API key not configured.' });
                return;
            }

            var fromCurrency = (from || 'USD').toUpperCase().trim();
            var toCurrency = (to || 'EUR').toUpperCase().trim();

            if (!/^[A-Z]{3}$/.test(fromCurrency) || !/^[A-Z]{3}$/.test(toCurrency)) {
                resolve({ success: false, error: 'Invalid currency code.' });
                return;
            }

            var numAmount = parseFloat(amount);
            if (isNaN(numAmount) || numAmount <= 0) {
                resolve({ success: false, error: 'Please enter a valid amount greater than 0.' });
                return;
            }

            fetch(EXCHANGE_API_BASE + '/' + EXCHANGE_API_KEY + '/latest/' + fromCurrency)
                .then(function(response) {
                    if (!response.ok) {
                        if (response.status === 404) {
                            resolve({ success: false, error: 'Currency code "' + fromCurrency + '" is not supported.' });
                        } else {
                            resolve({ success: false, error: 'Exchange rate error: ' + response.status });
                        }
                        return;
                    }
                    return response.json();
                })
                .then(function(data) {
                    if (!data) return;
                    if (data.result === 'error' || !data.conversion_rates || data.conversion_rates[toCurrency] === undefined) {
                        resolve({ success: false, error: 'Cannot convert from ' + fromCurrency + ' to ' + toCurrency + '.' });
                        return;
                    }

                    var rate = data.conversion_rates[toCurrency];
                    var converted = (numAmount * rate).toFixed(2);

                    resolve({
                        success: true,
                        data: {
                            from: fromCurrency,
                            fromName: getCurrencyName(fromCurrency),
                            to: toCurrency,
                            toName: getCurrencyName(toCurrency),
                            rate: rate,
                            originalAmount: numAmount,
                            convertedAmount: parseFloat(converted)
                        }
                    });
                })
                .catch(function(err) {
                    console.error('Exchange rate API error:', err);
                    resolve({ success: false, error: 'Unable to fetch exchange rates. Please try again.' });
                });
        });
    }

    // --- Expose globally as window.api ---
    window.api = {
        checkWeather: checkWeather,
        convertCurrency: convertCurrency,
        getCurrencyName: getCurrencyName
    };

})(window);
