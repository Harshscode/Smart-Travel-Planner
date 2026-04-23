const express = require('express');
const Expense = require('../models/Expense');
const Trip = require('../models/Trip');
const requireAuth = require('../middleware/auth');
const router = express.Router();

// Helper to verify trip ownership
async function verifyTripOwnership(tripId, userId) {
    const trip = await Trip.findOne({ _id: tripId, userId });
    return trip !== null;
}

// GET /api/trips/:tripId/expenses - Get all expenses for a trip
router.get('/trips/:tripId/expenses', requireAuth, async (req, res) => {
    try {
        const tripId = req.params.tripId;
        const isOwner = await verifyTripOwnership(tripId, req.session.userId);
        if (!isOwner) {
            return res.status(404).json({ success: false, error: 'Trip not found' });
        }
        const expenses = await Expense.find({ tripId }).sort({ date: -1 });
        res.json({ success: true, expenses });
    } catch (err) {
        console.error('Get expenses error:', err);
        res.status(500).json({ success: false, error: 'Server error fetching expenses' });
    }
});

// POST /api/trips/:tripId/expenses - Add expense
router.post('/trips/:tripId/expenses', requireAuth, async (req, res) => {
    try {
        const tripId = req.params.tripId;
        const isOwner = await verifyTripOwnership(tripId, req.session.userId);
        if (!isOwner) {
            return res.status(404).json({ success: false, error: 'Trip not found' });
        }

        const { amount, currency, category, description, date } = req.body;

        if (!amount || parseFloat(amount) <= 0) {
            return res.status(400).json({ success: false, error: 'Amount must be greater than 0' });
        }
        if (!description || description.trim() === '') {
            return res.status(400).json({ success: false, error: 'Description is required' });
        }
        if (!date) {
            return res.status(400).json({ success: false, error: 'Date is required' });
        }

        const expense = new Expense({
            tripId,
            userId: req.session.userId,
            amount: parseFloat(amount),
            currency: currency || 'USD',
            category: category || 'other',
            description: description.trim(),
            date
        });
        await expense.save();
        res.status(201).json({ success: true, expense });
    } catch (err) {
        console.error('Create expense error:', err);
        res.status(500).json({ success: false, error: 'Server error creating expense' });
    }
});

// PUT /api/expenses/:id - Update expense
router.put('/expenses/:id', requireAuth, async (req, res) => {
    try {
        const expense = await Expense.findOne({
            _id: req.params.id,
            userId: req.session.userId
        });
        if (!expense) {
            return res.status(404).json({ success: false, error: 'Expense not found' });
        }

        const { amount, currency, category, description, date } = req.body;

        if (amount !== undefined) expense.amount = parseFloat(amount);
        if (currency !== undefined) expense.currency = currency;
        if (category !== undefined) expense.category = category;
        if (description !== undefined) expense.description = description.trim();
        if (date !== undefined) expense.date = date;

        await expense.save();
        res.json({ success: true, expense });
    } catch (err) {
        console.error('Update expense error:', err);
        res.status(500).json({ success: false, error: 'Server error updating expense' });
    }
});

// DELETE /api/expenses/:id - Delete expense
router.delete('/expenses/:id', requireAuth, async (req, res) => {
    try {
        const expense = await Expense.findOne({
            _id: req.params.id,
            userId: req.session.userId
        });
        if (!expense) {
            return res.status(404).json({ success: false, error: 'Expense not found' });
        }
        await expense.deleteOne();
        res.json({ success: true, message: 'Expense deleted successfully' });
    } catch (err) {
        console.error('Delete expense error:', err);
        res.status(500).json({ success: false, error: 'Server error deleting expense' });
    }
});

// GET /api/trips/:tripId/expenses/summary - Get expense totals by category
router.get('/trips/:tripId/expenses/summary', requireAuth, async (req, res) => {
    try {
        const tripId = req.params.tripId;
        const isOwner = await verifyTripOwnership(tripId, req.session.userId);
        if (!isOwner) {
            return res.status(404).json({ success: false, error: 'Trip not found' });
        }

        const expenses = await Expense.find({ tripId });

        const categoryTotals = {};
        let totalSpent = 0;

        expenses.forEach(exp => {
            const cat = exp.category || 'other';
            categoryTotals[cat] = (categoryTotals[cat] || 0) + exp.amount;
            totalSpent += exp.amount;
        });

        res.json({
            success: true,
            summary: { totalSpent, categoryTotals, count: expenses.length }
        });
    } catch (err) {
        console.error('Get expense summary error:', err);
        res.status(500).json({ success: false, error: 'Server error fetching expense summary' });
    }
});

module.exports = router;
