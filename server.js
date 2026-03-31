// ============================================================
// Smart Travel Planner - Main Server File
// ============================================================
// This is the entry point of the application.
// It sets up Express, middleware, routes, and session handling.
// ============================================================

// --- Load environment variables from .env file ---
require('dotenv').config();

const express = require('express');
const session = require('express-session');
const path = require('path');

// Import route handlers
const authRoutes = require('./routes/auth');
const tripRoutes = require('./routes/trips');
const apiRoutes = require('./routes/api');

const app = express();

// --- Middleware ---
app.use(express.json());                        // Parse JSON request bodies
app.use(express.urlencoded({ extended: true })); // Parse URL-encoded form data
app.use(express.static(path.join(__dirname, 'public'))); // Serve static files from /public

// --- Session Configuration ---
// Sessions keep users logged in across requests by storing data server-side
app.use(session({
    secret: process.env.SESSION_SECRET || 'dev_secret_key',
    resave: false,               // Don't save session if nothing changed
    saveUninitialized: false,   // Don't create session for unauthenticated users
    cookie: {
        maxAge: 24 * 60 * 60 * 1000 // Session expires after 24 hours
    }
}));

// --- Set View Engine ---
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// --- Make session available to all templates ---
app.use((req, res, next) => {
    res.locals.user = req.session.user || null;
    res.locals.currentPage = '';
    next();
});

// --- Routes ---
// All authentication routes (/login, /register, /logout)
app.use('/', authRoutes);

// Trip management routes (/dashboard, /add-trip, /edit-trip, etc.)
app.use('/', tripRoutes);

// API routes for AJAX calls (/api/weather, /api/exchange, /api/trips)
app.use('/api', apiRoutes);

// --- Root route: Redirect to landing or dashboard ---
app.get('/', (req, res) => {
    if (req.session.user) {
        res.redirect('/dashboard');
    } else {
        res.redirect('/landing');
    }
});

// --- 404 Handler ---
app.use((req, res) => {
    res.status(404).send('<h1>404 - Page Not Found</h1><a href="/">Go Home</a>');
});

// --- Start Server ---
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`========================================`);
    console.log(` Smart Travel Planner is running!`);
    console.log(` Visit: http://localhost:${PORT}`);
    console.log(`========================================`);
});
