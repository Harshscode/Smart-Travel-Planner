const mongoose = require('mongoose');

const ExpenseSchema = new mongoose.Schema({
    tripId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Trip',
        required: true,
        index: true
    },
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        index: true
    },
    amount: {
        type: Number,
        required: [true, 'Amount is required'],
        min: [0.01, 'Amount must be greater than 0']
    },
    currency: {
        type: String,
        default: 'USD',
        uppercase: true
    },
    category: {
        type: String,
        enum: ['food', 'transport', 'lodging', 'activities', 'shopping', 'other'],
        default: 'other'
    },
    description: {
        type: String,
        required: [true, 'Description is required'],
        trim: true
    },
    date: {
        type: String, // 'YYYY-MM-DD' format
        required: [true, 'Date is required']
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('Expense', ExpenseSchema);
