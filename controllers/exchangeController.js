// ============================================================
// exchangeController.js - Exchange Rate API Integration
// ============================================================
// Fetches currency exchange rates from exchangerate-api.com
// API Docs: https://www.exchangerate-api.com/docs/overview
// ============================================================

const fetch = require('node-fetch');

const EXCHANGE_API_BASE = 'https://v6.exchangerate-api.com/v6';
const API_KEY = process.env.EXCHANGE_API_KEY;

/**
 * Get exchange rates for a base currency.
 * @param {string} baseCurrency - Base currency code (e.g., "USD", "EUR")
 * @returns {Object} Exchange rate data or error object
 */
async function getExchangeRates(baseCurrency) {
    if (!API_KEY || API_KEY === 'your_exchange_rate_api_key_here') {
        return { error: 'Exchange rate API key not configured. Add it to your .env file.' };
    }

    if (!baseCurrency || baseCurrency.trim() === '') {
        return { error: 'Please provide a base currency code.' };
    }

    const currency = baseCurrency.toUpperCase().trim();

    // Validate currency code format (3 letters)
    if (!/^[A-Z]{3}$/.test(currency)) {
        return { error: 'Invalid currency code. Use a 3-letter code like USD, EUR, GBP.' };
    }

    try {
        const url = `${EXCHANGE_API_BASE}/${API_KEY}/latest/${currency}`;
        const response = await fetch(url);

        if (!response.ok) {
            if (response.status === 404) {
                return { error: `Currency code "${currency}" is not supported.` };
            }
            if (response.status === 429) {
                return { error: 'Exchange rate API rate limit reached. Try again later.' };
            }
            return { error: `Exchange rate service error: ${response.status}` };
        }

        const data = await response.json();

        if (data.result === 'error') {
            return { error: data['error-type'] || 'Exchange rate API error.' };
        }

        // Return only the most common currencies to keep the response small
        const commonCurrencies = ['EUR', 'GBP', 'JPY', 'CAD', 'AUD', 'CHF', 'CNY', 'INR', 'MXN', 'BRL', 'KRW', 'SGD', 'HKD', 'THB', 'ZAR'];
        const filteredRates = {};
        commonCurrencies.forEach(curr => {
            if (data.conversion_rates && data.conversion_rates[curr] !== undefined) {
                filteredRates[curr] = data.conversion_rates[curr];
            }
        });

        return {
            success: true,
            data: {
                base: data.base_code,
                baseName: getCurrencyName(data.base_code),
                rates: filteredRates,
                lastUpdated: data.time_last_update_utc
            }
        };
    } catch (err) {
        console.error('Exchange rate API error:', err.message);
        return { error: 'Unable to fetch exchange rates. Please try again later.' };
    }
}

/**
 * Convert an amount from one currency to another.
 * @param {string} fromCurrency - Source currency code
 * @param {string} toCurrency - Target currency code
 * @param {number} amount - Amount to convert
 * @returns {Object} Conversion result or error
 */
async function convertCurrency(fromCurrency, toCurrency, amount) {
    if (!API_KEY || API_KEY === 'your_exchange_rate_api_key_here') {
        return { error: 'Exchange rate API key not configured.' };
    }

    const from = fromCurrency.toUpperCase().trim();
    const to = toCurrency.toUpperCase().trim();

    if (!/^[A-Z]{3}$/.test(from) || !/^[A-Z]{3}$/.test(to)) {
        return { error: 'Invalid currency code.' };
    }

    try {
        const url = `${EXCHANGE_API_BASE}/${API_KEY}/latest/${from}`;
        const response = await fetch(url);

        if (!response.ok) {
            return { error: `Exchange rate error: ${response.status}` };
        }

        const data = await response.json();

        if (data.result === 'error' || !data.conversion_rates || !data.conversion_rates[to]) {
            return { error: `Cannot convert from ${from} to ${to}.` };
        }

        const rate = data.conversion_rates[to];
        const converted = (parseFloat(amount) * rate).toFixed(2);

        return {
            success: true,
            data: {
                from,
                fromName: getCurrencyName(from),
                to,
                toName: getCurrencyName(to),
                rate,
                originalAmount: parseFloat(amount),
                convertedAmount: parseFloat(converted)
            }
        };
    } catch (err) {
        console.error('Conversion error:', err.message);
        return { error: 'Unable to convert currency. Please try again.' };
    }
}

/**
 * Get the full name of a currency code.
 * @param {string} code - 3-letter currency code
 * @returns {string} Currency name
 */
function getCurrencyName(code) {
    const names = {
        USD: 'US Dollar', EUR: 'Euro', GBP: 'British Pound', JPY: 'Japanese Yen',
        CAD: 'Canadian Dollar', AUD: 'Australian Dollar', CHF: 'Swiss Franc',
        CNY: 'Chinese Yuan', INR: 'Indian Rupee', MXN: 'Mexican Peso',
        BRL: 'Brazilian Real', KRW: 'South Korean Won', SGD: 'Singapore Dollar',
        HKD: 'Hong Kong Dollar', THB: 'Thai Baht', ZAR: 'South African Rand',
        NZD: 'New Zealand Dollar', SEK: 'Swedish Krona', NOK: 'Norwegian Krone',
        DKK: 'Danish Krone', PLN: 'Polish Zloty', CZK: 'Czech Koruna',
        HUF: 'Hungarian Forint', TRY: 'Turkish Lira', RUB: 'Russian Ruble',
        AED: 'UAE Dirham', SAR: 'Saudi Riyal', PHP: 'Philippine Peso',
        IDR: 'Indonesian Rupiah', MYR: 'Malaysian Ringgit', VND: 'Vietnamese Dong'
    };
    return names[code] || code;
}

module.exports = { getExchangeRates, convertCurrency };
