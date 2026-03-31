// ============================================================
// trips.js - Trip Management Routes
// ============================================================
// Routes: /dashboard, /add-trip, /edit-trip/:id, /delete-trip/:id
// ============================================================

const express = require('express');
const router = express.Router();
const tripController = require('../controllers/tripController');
const { requireLogin } = require('../controllers/authController');

// All routes require authentication
router.use(requireLogin);

// --- Dashboard ---
router.get('/dashboard', (req, res) => tripController.getDashboard(req, res));

// --- Add Trip ---
router.get('/add-trip', (req, res) => tripController.getAddTripPage(req, res));
router.post('/add-trip', (req, res) => tripController.handleAddTrip(req, res));

// --- Edit Trip ---
router.get('/edit-trip/:id', (req, res) => tripController.getEditTripPage(req, res));
router.post('/edit-trip/:id', (req, res) => tripController.handleEditTrip(req, res));

// --- Delete Trip ---
router.get('/delete-trip/:id', (req, res) => tripController.handleDeleteTrip(req, res));
router.post('/delete-trip/:id', (req, res) => tripController.handleDeleteTrip(req, res));

module.exports = router;
