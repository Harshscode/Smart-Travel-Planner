// ============================================================
// auth.js - Authentication Logic
// ============================================================
// Handles user registration, login, and logout.
// All functions are exposed as window.auth.*
// ============================================================

(function(window) {
    'use strict';

    // --- Validation ---

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

    // --- Auth Functions ---

    function register(name, email, password, confirmPassword) {
        var validationError = validateRegistration(name, email, password, confirmPassword);
        if (validationError) {
            return { success: false, error: validationError };
        }

        if (window.storage.findUserByEmail(email)) {
            return { success: false, error: 'An account with this email already exists.' };
        }

        if (window.storage.findUserByName(name)) {
            return { success: false, error: 'This username is already taken.' };
        }

        var user = window.storage.addUser({ name: name, email: email, password: password });
        window.storage.setCurrentUser(user);

        console.log('New user registered: ' + user.name + ' (' + user.email + ')');
        return { success: true, user: user };
    }

    function login(email, password) {
        var validationError = validateLogin(email, password);
        if (validationError) {
            return { success: false, error: validationError };
        }

        var user = window.storage.findUserByEmail(email.trim().toLowerCase());
        if (!user) {
            return { success: false, error: 'No account found with this email.' };
        }

        if (user.password !== password) {
            return { success: false, error: 'Incorrect password. Please try again.' };
        }

        // Remove password before storing session
        var userWithoutPassword = {
            id: user.id,
            name: user.name,
            email: user.email,
            createdAt: user.createdAt
        };

        window.storage.setCurrentUser(userWithoutPassword);
        console.log('User logged in: ' + user.name);
        return { success: true, user: userWithoutPassword };
    }

    function logout() {
        var currentUser = window.storage.getCurrentUser();
        if (currentUser) {
            console.log('User logged out: ' + currentUser.name);
        }
        window.storage.setCurrentUser(null);
    }

    function isLoggedIn() {
        return window.storage.getCurrentUser() !== null;
    }

    function requireAuth(redirectUrl) {
        redirectUrl = redirectUrl || 'login.html';
        if (!isLoggedIn()) {
            window.location.href = redirectUrl;
            return false;
        }
        return true;
    }

    function redirectIfLoggedIn(redirectUrl) {
        redirectUrl = redirectUrl || 'dashboard.html';
        if (isLoggedIn()) {
            window.location.href = redirectUrl;
            return true;
        }
        return false;
    }

    // --- Expose globally as window.auth ---
    window.auth = {
        register: register,
        login: login,
        logout: logout,
        isLoggedIn: isLoggedIn,
        requireAuth: requireAuth,
        redirectIfLoggedIn: redirectIfLoggedIn
    };

})(window);
