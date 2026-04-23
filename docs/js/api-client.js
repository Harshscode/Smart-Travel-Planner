// ============================================================
// api-client.js - Backend API Client
// ============================================================
// Replaces localStorage with fetch() calls to the Express backend.
// All functions are exposed as window.apiClient.*
// ============================================================

(function(window) {
    'use strict';

    // --- Session State ---
    var currentUser = null;

    // --- Helper ---
    var MAX_RETRIES = 2;
    var RETRY_DELAY = 500;
    var REQUEST_TIMEOUT = 10000;

    function apiFetch(endpoint, options, retries) {
        retries = retries || 0;
        var opts = options || {};
        opts.headers = opts.headers || {};
        opts.headers['Content-Type'] = 'application/json';

        // Build timeout abort controller
        var controller = new AbortController();
        var timeoutId = setTimeout(function() { controller.abort(); }, REQUEST_TIMEOUT);
        opts.signal = controller.signal;

        return fetch(endpoint, opts)
            .then(function(response) {
                clearTimeout(timeoutId);
                // Handle HTTP errors
                if (!response.ok) {
                    var msg = 'Request failed.';
                    if (response.status === 401) msg = 'Session expired. Please log in again.';
                    else if (response.status === 403) msg = 'Access denied.';
                    else if (response.status === 404) msg = 'Resource not found.';
                    else if (response.status >= 500) msg = 'Server error. Please try again later.';
                    return { success: false, error: msg, _status: response.status };
                }
                return response.json().then(function(data) {
                    data._status = response.status;
                    return data;
                });
            })
            .catch(function(err) {
                clearTimeout(timeoutId);
                console.error('API fetch error:', err);
                // Retry on network failures
                if (retries < MAX_RETRIES) {
                    return new Promise(function(resolve) {
                        setTimeout(function() {
                            resolve(apiFetch(endpoint, options, retries + 1));
                        }, RETRY_DELAY);
                    });
                }
                if (err.name === 'AbortError') {
                    return { success: false, error: 'Request timed out. Please try again.' };
                }
                return { success: false, error: 'Network error. Please check your connection.' };
            });
    }

    // --- Auth ---
    function register(name, email, password, confirmPassword) {
        return apiFetch('/api/auth/register', {
            method: 'POST',
            body: JSON.stringify({ name: name, email: email, password: password, confirmPassword: confirmPassword }),
            credentials: 'include'
        }).then(function(result) {
            if (result.success && result.user) {
                currentUser = result.user;
            }
            return result;
        });
    }

    function login(email, password) {
        return apiFetch('/api/auth/login', {
            method: 'POST',
            body: JSON.stringify({ email: email, password: password }),
            credentials: 'include'
        }).then(function(result) {
            if (result.success && result.user) {
                currentUser = result.user;
            }
            return result;
        });
    }

    function logout() {
        return apiFetch('/api/auth/logout', {
            method: 'POST',
            credentials: 'include'
        }).then(function(result) {
            currentUser = null;
            return result;
        });
    }

    function getCurrentUser() {
        // Return cached user if available
        if (currentUser) {
            return Promise.resolve({ success: true, user: currentUser });
        }
        return apiFetch('/api/auth/me', { credentials: 'include' })
            .then(function(result) {
                if (result.success && result.user) {
                    currentUser = result.user;
                }
                return result;
            });
    }

    function isLoggedIn() {
        return currentUser !== null;
    }

    // --- Trips ---
    function getTrips() {
        return apiFetch('/api/trips', { credentials: 'include' }).then(function(result) {
            if (result.success && result.trips) {
                result.trips.forEach(function(t) { t.id = t._id; });
            }
            return result;
        });
    }

    function getTripById(id) {
        return apiFetch('/api/trips/' + id, { credentials: 'include' }).then(function(result) {
            if (result.success && result.trip) {
                result.trip.id = result.trip._id;
            }
            return result;
        });
    }

    function createTrip(tripData) {
        return apiFetch('/api/trips', {
            method: 'POST',
            body: JSON.stringify(tripData),
            credentials: 'include'
        }).then(function(result) {
            if (result.success && result.trip) {
                result.trip.id = result.trip._id;
            }
            return result;
        });
    }

    function updateTrip(id, tripData) {
        return apiFetch('/api/trips/' + id, {
            method: 'PUT',
            body: JSON.stringify(tripData),
            credentials: 'include'
        });
    }

    function deleteTrip(id) {
        return apiFetch('/api/trips/' + id, {
            method: 'DELETE',
            credentials: 'include'
        });
    }

    // --- Itinerary ---
    function getItinerary(tripId) {
        return apiFetch('/api/trips/' + tripId + '/itinerary', { credentials: 'include' });
    }

    function addItineraryItem(tripId, itemData) {
        return apiFetch('/api/trips/' + tripId + '/itinerary', {
            method: 'POST',
            body: JSON.stringify(itemData),
            credentials: 'include'
        });
    }

    function updateItineraryItem(id, itemData) {
        return apiFetch('/api/itinerary/' + id, {
            method: 'PUT',
            body: JSON.stringify(itemData),
            credentials: 'include'
        });
    }

    function deleteItineraryItem(id) {
        return apiFetch('/api/itinerary/' + id, {
            method: 'DELETE',
            credentials: 'include'
        });
    }

    // --- Expenses ---
    function getExpenses(tripId) {
        return apiFetch('/api/trips/' + tripId + '/expenses', { credentials: 'include' });
    }

    function addExpense(tripId, expenseData) {
        return apiFetch('/api/trips/' + tripId + '/expenses', {
            method: 'POST',
            body: JSON.stringify(expenseData),
            credentials: 'include'
        });
    }

    function updateExpense(id, expenseData) {
        return apiFetch('/api/expenses/' + id, {
            method: 'PUT',
            body: JSON.stringify(expenseData),
            credentials: 'include'
        });
    }

    function deleteExpense(id) {
        return apiFetch('/api/expenses/' + id, {
            method: 'DELETE',
            credentials: 'include'
        });
    }

    function getExpenseSummary(tripId) {
        return apiFetch('/api/trips/' + tripId + '/expenses/summary', { credentials: 'include' });
    }

    // --- Favorites ---
    function getFavorites() {
        return apiFetch('/api/favorites', { credentials: 'include' });
    }

    function addFavorite(data) {
        return apiFetch('/api/favorites', {
            method: 'POST',
            body: JSON.stringify(data),
            credentials: 'include'
        });
    }

    function deleteFavorite(id) {
        return apiFetch('/api/favorites/' + id, {
            method: 'DELETE',
            credentials: 'include'
        });
    }

    function updateFavorite(id, data) {
        return apiFetch('/api/favorites/' + id, {
            method: 'PUT',
            body: JSON.stringify(data),
            credentials: 'include'
        });
    }

    // Create trip and then add all itinerary items
    function createTripWithItinerary(tripData, items) {
        return createTrip(tripData).then(function(result) {
            if (!result.success || !result.trip) return result;
            var tripId = result.trip._id || result.trip.id;
            if (!items || items.length === 0) return result;
            return Promise.all(items.map(function(item) {
                return addItineraryItem(tripId, item);
            })).then(function() { return result; });
        });
    }

    // --- Server-side API Proxy ---
    function checkWeather(city) {
        return apiFetch('/api/weather?city=' + encodeURIComponent(city), { credentials: 'include' });
    }

    function convertCurrency(from, to, amount) {
        return apiFetch('/api/currency/convert?from=' + from + '&to=' + to + '&amount=' + amount, { credentials: 'include' });
    }

    // Currency names helper (used by main.js)
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

    // --- Expose globally ---
    window.apiClient = {
        // Auth
        register: register,
        login: login,
        logout: logout,
        getCurrentUser: getCurrentUser,
        isLoggedIn: isLoggedIn,
        getCurrentUserSync: function() { return currentUser; },
        setCurrentUser: function(user) { currentUser = user; },
        clearCurrentUser: function() { currentUser = null; },
        // Trips
        getTrips: getTrips,
        getTripById: getTripById,
        createTrip: createTrip,
        updateTrip: updateTrip,
        deleteTrip: deleteTrip,
        // Itinerary
        getItinerary: getItinerary,
        addItineraryItem: addItineraryItem,
        updateItineraryItem: updateItineraryItem,
        deleteItineraryItem: deleteItineraryItem,
        // Expenses
        getExpenses: getExpenses,
        addExpense: addExpense,
        updateExpense: updateExpense,
        deleteExpense: deleteExpense,
        getExpenseSummary: getExpenseSummary,
        // Favorites
        getFavorites: getFavorites,
        addFavorite: addFavorite,
        deleteFavorite: deleteFavorite,
        updateFavorite: updateFavorite,
        createTripWithItinerary: createTripWithItinerary,
        // Proxies
        checkWeather: checkWeather,
        convertCurrency: convertCurrency,
        getCurrencyName: getCurrencyName
    };

})(window);
