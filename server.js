require('dotenv').config();
const express = require('express');
const session = require('express-session');
const path = require('path');
const connectDB = require('./config/database');

// Import routes
const authRoutes = require('./routes/auth');
const tripsRoutes = require('./routes/trips');
const itineraryRoutes = require('./routes/itinerary');
const expensesRoutes = require('./routes/expenses');
const favoritesRoutes = require('./routes/favorites');
const weatherRoutes = require('./routes/weather');
const currencyRoutes = require('./routes/currency');

const app = express();
const PORT = process.env.PORT || 3000;

// Connect to MongoDB
connectDB();

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Session configuration
app.use(session({
    secret: process.env.SESSION_SECRET || 'dev_secret_key_change_in_production',
    resave: false,
    saveUninitialized: false,
    cookie: {
        secure: false, // Set to true in production with HTTPS
        httpOnly: true,
        maxAge: 24 * 60 * 60 * 1000 // 24 hours
    }
}));

// Serve static files from docs/
app.use(express.static(path.join(__dirname, 'docs')));

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/trips', tripsRoutes);
app.use('/api', itineraryRoutes); // itinerary has /trips/:tripId/itinerary and /itinerary/:id
app.use('/api', expensesRoutes);   // expenses has /trips/:tripId/expenses and /expenses/:id
app.use('/api/favorites', favoritesRoutes);
app.use('/api/weather', weatherRoutes);
app.use('/api/currency', currencyRoutes);

// Serve index.html for root
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'docs', 'index.html'));
});

// Handle SPA routes - serve dashboard for protected routes
app.get('/dashboard', (req, res) => {
    res.sendFile(path.join(__dirname, 'docs', 'dashboard.html'));
});

app.get('/login', (req, res) => {
    res.sendFile(path.join(__dirname, 'docs', 'login.html'));
});

app.get('/register', (req, res) => {
    res.sendFile(path.join(__dirname, 'docs', 'register.html'));
});

// 404 handler
app.use((req, res) => {
    res.status(404).send('Page not found');
});

// Start server
app.listen(PORT, () => {
    console.log(`Smart Travel Planner server running on http://localhost:${PORT}`);
    console.log(`MongoDB URI: ${process.env.MONGODB_URI ? 'configured' : 'NOT CONFIGURED - set MONGODB_URI in .env'}`);
});
