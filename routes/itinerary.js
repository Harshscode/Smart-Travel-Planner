const express = require('express');
const ItineraryItem = require('../models/ItineraryItem');
const Trip = require('../models/Trip');
const requireAuth = require('../middleware/auth');
const router = express.Router();

// Helper to verify trip ownership
async function verifyTripOwnership(tripId, userId) {
    const trip = await Trip.findOne({ _id: tripId, userId });
    return trip !== null;
}

// GET /api/trips/:tripId/itinerary - Get all items for a trip
router.get('/trips/:tripId/itinerary', requireAuth, async (req, res) => {
    try {
        const tripId = req.params.tripId;

        // Verify ownership
        const isOwner = await verifyTripOwnership(tripId, req.session.userId);
        if (!isOwner) {
            return res.status(404).json({ success: false, error: 'Trip not found' });
        }

        const items = await ItineraryItem.find({ tripId }).sort({ date: 1, time: 1 });
        res.json({ success: true, items });
    } catch (err) {
        console.error('Get itinerary error:', err);
        res.status(500).json({ success: false, error: 'Server error fetching itinerary' });
    }
});

// POST /api/trips/:tripId/itinerary - Add itinerary item
router.post('/trips/:tripId/itinerary', requireAuth, async (req, res) => {
    try {
        const tripId = req.params.tripId;

        // Verify ownership
        const isOwner = await verifyTripOwnership(tripId, req.session.userId);
        if (!isOwner) {
            return res.status(404).json({ success: false, error: 'Trip not found' });
        }

        const { date, time, activity, location, category, notes } = req.body;

        if (!date) {
            return res.status(400).json({ success: false, error: 'Date is required' });
        }
        if (!activity || activity.trim() === '') {
            return res.status(400).json({ success: false, error: 'Activity is required' });
        }

        const item = new ItineraryItem({
            tripId,
            userId: req.session.userId,
            date,
            time: time || '',
            activity: activity.trim(),
            location: location || '',
            category: category || 'other',
            notes: notes || ''
        });
        await item.save();

        res.status(201).json({ success: true, item });
    } catch (err) {
        console.error('Create itinerary item error:', err);
        res.status(500).json({ success: false, error: 'Server error creating itinerary item' });
    }
});

// PUT /api/itinerary/:id - Update itinerary item
router.put('/itinerary/:id', requireAuth, async (req, res) => {
    try {
        const item = await ItineraryItem.findOne({
            _id: req.params.id,
            userId: req.session.userId
        });
        if (!item) {
            return res.status(404).json({ success: false, error: 'Itinerary item not found' });
        }

        const { date, time, activity, location, category, notes } = req.body;

        if (date !== undefined) item.date = date;
        if (time !== undefined) item.time = time;
        if (activity !== undefined) item.activity = activity.trim();
        if (location !== undefined) item.location = location;
        if (category !== undefined) item.category = category;
        if (notes !== undefined) item.notes = notes;

        await item.save();
        res.json({ success: true, item });
    } catch (err) {
        console.error('Update itinerary item error:', err);
        res.status(500).json({ success: false, error: 'Server error updating itinerary item' });
    }
});

// DELETE /api/itinerary/:id - Delete itinerary item
router.delete('/itinerary/:id', requireAuth, async (req, res) => {
    try {
        const item = await ItineraryItem.findOne({
            _id: req.params.id,
            userId: req.session.userId
        });
        if (!item) {
            return res.status(404).json({ success: false, error: 'Itinerary item not found' });
        }

        await item.deleteOne();
        res.json({ success: true, message: 'Itinerary item deleted successfully' });
    } catch (err) {
        console.error('Delete itinerary item error:', err);
        res.status(500).json({ success: false, error: 'Server error deleting itinerary item' });
    }
});

module.exports = router;
