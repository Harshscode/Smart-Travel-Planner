// ============================================================
// api.js - External API Integration (Server-Side Proxy)
// ============================================================
// All functions are exposed as window.api.*
// Now delegates to apiClient which calls the backend proxy.
// ============================================================

(function(window) {
    'use strict';

    // --- Weather (delegates to apiClient which proxies through backend) ---

    function checkWeather(city) {
        return apiClient.checkWeather(city);
    }

    // --- Exchange Rate (delegates to apiClient which proxies through backend) ---

    function getCurrencyName(code) {
        return apiClient.getCurrencyName(code);
    }

    function convertCurrency(from, to, amount) {
        return apiClient.convertCurrency(from, to, amount);
    }

    // --- Expose globally as window.api ---
    window.api = {
        checkWeather: checkWeather,
        convertCurrency: convertCurrency,
        getCurrencyName: getCurrencyName
    };

})(window);
