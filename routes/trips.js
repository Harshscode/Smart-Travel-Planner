const express = require('express');
const Trip = require('../models/Trip');
const ItineraryItem = require('../models/ItineraryItem');
const Expense = require('../models/Expense');
const requireAuth = require('../middleware/auth');
const router = express.Router();

// All routes require authentication
router.use(requireAuth);

// GET /api/trips - Get all trips for current user
router.get('/', async (req, res) => {
    try {
        const trips = await Trip.find({ userId: req.session.userId })
            .sort({ startDate: 1 });
        res.json({ success: true, trips });
    } catch (err) {
        console.error('Get trips error:', err);
        res.status(500).json({ success: false, error: 'Server error fetching trips' });
    }
});

// GET /api/trips/:id - Get single trip
router.get('/:id', async (req, res) => {
    try {
        const trip = await Trip.findOne({
            _id: req.params.id,
            userId: req.session.userId
        });
        if (!trip) {
            return res.status(404).json({ success: false, error: 'Trip not found' });
        }
        res.json({ success: true, trip });
    } catch (err) {
        console.error('Get trip error:', err);
        res.status(500).json({ success: false, error: 'Server error fetching trip' });
    }
});

// POST /api/trips - Create new trip
router.post('/', async (req, res) => {
    try {
        const { destination, startDate, endDate, budget, currency, notes } = req.body;

        if (!destination || destination.trim() === '') {
            return res.status(400).json({ success: false, error: 'Destination is required' });
        }
        if (!startDate) {
            return res.status(400).json({ success: false, error: 'Start date is required' });
        }
        if (!endDate) {
            return res.status(400).json({ success: false, error: 'End date is required' });
        }
        if (new Date(endDate) < new Date(startDate)) {
            return res.status(400).json({ success: false, error: 'End date must be the same as or after the start date' });
        }
        if (budget !== undefined && budget !== '' && parseFloat(budget) < 0) {
            return res.status(400).json({ success: false, error: 'Budget cannot be negative.' });
        }
        var today = new Date();
        today.setHours(0, 0, 0, 0);
        if (new Date(startDate) < today) {
            return res.status(400).json({ success: false, error: 'Start date cannot be in the past.' });
        }

        const trip = new Trip({
            userId: req.session.userId,
            destination: destination.trim(),
            startDate: new Date(startDate),
            endDate: new Date(endDate),
            budget: parseFloat(budget) || 0,
            currency: currency || 'USD',
            notes: notes || ''
        });
        await trip.save();

        res.status(201).json({ success: true, trip });
    } catch (err) {
        console.error('Create trip error:', err);
        res.status(500).json({ success: false, error: 'Server error creating trip' });
    }
});

// PUT /api/trips/:id - Update trip
router.put('/:id', async (req, res) => {
    try {
        const trip = await Trip.findOne({
            _id: req.params.id,
            userId: req.session.userId
        });
        if (!trip) {
            return res.status(404).json({ success: false, error: 'Trip not found' });
        }

        const { destination, startDate, endDate, budget, currency, notes } = req.body;

        if (destination !== undefined) trip.destination = destination.trim();
        if (startDate !== undefined) trip.startDate = new Date(startDate);
        if (endDate !== undefined) trip.endDate = new Date(endDate);
        if (budget !== undefined) trip.budget = parseFloat(budget) || 0;
        if (currency !== undefined) trip.currency = currency;
        if (notes !== undefined) trip.notes = notes;

        if (trip.endDate < trip.startDate) {
            return res.status(400).json({ success: false, error: 'End date must be the same as or after the start date' });
        }

        await trip.save();
        res.json({ success: true, trip });
    } catch (err) {
        console.error('Update trip error:', err);
        res.status(500).json({ success: false, error: 'Server error updating trip' });
    }
});

// DELETE /api/trips/:id - Delete trip and cascade delete itinerary + expenses
router.delete('/:id', async (req, res) => {
    try {
        const trip = await Trip.findOne({
            _id: req.params.id,
            userId: req.session.userId
        });
        if (!trip) {
            return res.status(404).json({ success: false, error: 'Trip not found' });
        }

        // Cascade delete related items
        await Promise.all([
            ItineraryItem.deleteMany({ tripId: trip._id }),
            Expense.deleteMany({ tripId: trip._id })
        ]);

        await trip.deleteOne();
        res.json({ success: true, message: 'Trip deleted successfully' });
    } catch (err) {
        console.error('Delete trip error:', err);
        res.status(500).json({ success: false, error: 'Server error deleting trip' });
    }
});

module.exports = router;
