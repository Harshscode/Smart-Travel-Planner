// ============================================================
// auth.js - Authentication Logic
// ============================================================
// Handles user registration, login, and logout.
// Uses apiClient to communicate with the backend.
// All functions are exposed as window.auth.*
// ============================================================

(function(window) {
    'use strict';

    // --- Validation (client-side, same as before) ---

    function validateRegistration(name, email, password, confirmPassword) {
        if (!name || !email || !password || !confirmPassword) {
            return 'All fields are required.';
        }
        if (name.trim().length < 3) {
            return 'Username must be at least 3 characters.';
        }
        if (password.length < 6) {
            return 'Password must be at least 6 characters.';
        }
        if (password !== confirmPassword) {
            return 'Passwords do not match.';
        }
        var emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email.trim())) {
            return 'Please enter a valid email address.';
        }
        return null;
    }

    function validateLogin(email, password) {
        if (!email || !password) {
            return 'Please enter both email and password.';
        }
        return null;
    }

    // --- Auth Functions (async, using apiClient) ---

    function register(name, email, password, confirmPassword) {
        var validationError = validateRegistration(name, email, password, confirmPassword);
        if (validationError) {
            return { success: false, error: validationError };
        }

        // Call backend - apiClient.register handles the async call
        // Since the HTML form uses synchronous-like pattern, we use a sync wrapper
        // but register is actually async - the HTML handler will work with promises
        return apiClient.register(name, email, password, confirmPassword);
    }

    function login(email, password) {
        var validationError = validateLogin(email, password);
        if (validationError) {
            return { success: false, error: validationError };
        }

        return apiClient.login(email, password);
    }

    function logout() {
        return apiClient.logout().then(function(result) {
            apiClient.clearCurrentUser();
            return result;
        });
    }

    function isLoggedIn() {
        return apiClient.isLoggedIn();
    }

    function requireAuth(redirectUrl) {
        redirectUrl = redirectUrl || 'login.html';
        if (!apiClient.isLoggedIn()) {
            // Try to restore session from server
            apiClient.getCurrentUser().then(function(result) {
                if (!result.success) {
                    window.location.href = redirectUrl;
                }
            });
            return false;
        }
        return true;
    }

    function redirectIfLoggedIn(redirectUrl) {
        redirectUrl = redirectUrl || 'dashboard.html';
        if (apiClient.isLoggedIn()) {
            window.location.href = redirectUrl;
            return true;
        }
        // Async check
        apiClient.getCurrentUser().then(function(result) {
            if (result.success) {
                window.location.href = redirectUrl;
            }
        });
        return false;
    }

    // --- Expose globally as window.auth ---
    window.auth = {
        validateRegistration: validateRegistration,
        validateLogin: validateLogin,
        register: register,
        login: login,
        logout: logout,
        isLoggedIn: isLoggedIn,
        requireAuth: requireAuth,
        redirectIfLoggedIn: redirectIfLoggedIn
    };

})(window);
