const express = require('express');
const Favorite = require('../models/Favorite');
const requireAuth = require('../middleware/auth');
const router = express.Router();

// All routes require authentication
router.use(requireAuth);

// GET /api/favorites - Get all favorites for current user
router.get('/', async (req, res) => {
    try {
        const favorites = await Favorite.find({ userId: req.session.userId })
            .sort({ createdAt: -1 });
        res.json({ success: true, favorites });
    } catch (err) {
        console.error('Get favorites error:', err);
        res.status(500).json({ success: false, error: 'Server error fetching favorites' });
    }
});

// POST /api/favorites - Add a favorite
router.post('/', async (req, res) => {
    try {
        const { destination, notes } = req.body;

        if (!destination || destination.trim() === '') {
            return res.status(400).json({ success: false, error: 'Destination is required' });
        }

        const favorite = new Favorite({
            userId: req.session.userId,
            destination: destination.trim(),
            notes: notes || ''
        });
        await favorite.save();

        res.status(201).json({ success: true, favorite });
    } catch (err) {
        console.error('Create favorite error:', err);
        res.status(500).json({ success: false, error: 'Server error creating favorite' });
    }
});

// DELETE /api/favorites/:id - Remove a favorite
router.delete('/:id', async (req, res) => {
    try {
        const favorite = await Favorite.findOne({
            _id: req.params.id,
            userId: req.session.userId
        });
        if (!favorite) {
            return res.status(404).json({ success: false, error: 'Favorite not found' });
        }

        await favorite.deleteOne();
        res.json({ success: true, message: 'Favorite removed successfully' });
    } catch (err) {
        console.error('Delete favorite error:', err);
        res.status(500).json({ success: false, error: 'Server error deleting favorite' });
    }
});

// PUT /api/favorites/:id - Update a favorite
router.put('/:id', async (req, res) => {
    try {
        const { destination, notes } = req.body;
        if (!destination || destination.trim() === '') {
            return res.status(400).json({ success: false, error: 'Destination is required' });
        }

        const favorite = await Favorite.findOne({
            _id: req.params.id,
            userId: req.session.userId
        });
        if (!favorite) {
            return res.status(404).json({ success: false, error: 'Favorite not found' });
        }

        favorite.destination = destination.trim();
        favorite.notes = notes || '';
        await favorite.save();

        res.json({ success: true, favorite });
    } catch (err) {
        console.error('Update favorite error:', err);
        res.status(500).json({ success: false, error: 'Server error updating favorite' });
    }
});

module.exports = router;
