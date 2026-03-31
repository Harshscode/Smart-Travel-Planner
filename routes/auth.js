// ============================================================
// auth.js - Authentication Routes
// ============================================================
// Routes: /landing, /login, /register, /logout
// ============================================================

const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');

// --- Landing Page ---
router.get('/landing', (req, res) => {
    if (req.session.user) {
        return res.redirect('/dashboard');
    }
    res.render('landing', { title: 'Smart Travel Planner' });
});

// --- Register Routes ---
router.get('/register', (req, res) => authController.getRegisterPage(req, res));
router.post('/register', (req, res) => authController.handleRegister(req, res));

// --- Login Routes ---
router.get('/login', (req, res) => authController.getLoginPage(req, res));
router.post('/login', (req, res) => authController.handleLogin(req, res));

// --- Logout Route ---
router.get('/logout', (req, res) => authController.handleLogout(req, res));
router.post('/logout', (req, res) => authController.handleLogout(req, res));

module.exports = router;
