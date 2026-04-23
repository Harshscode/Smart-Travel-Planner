const mongoose = require('mongoose');

const ItineraryItemSchema = new mongoose.Schema({
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
    date: {
        type: String, // 'YYYY-MM-DD' format
        required: [true, 'Date is required']
    },
    time: {
        type: String, // 'HH:MM' 24-hour format
        default: ''
    },
    activity: {
        type: String,
        required: [true, 'Activity is required'],
        trim: true
    },
    location: {
        type: String,
        default: '',
        trim: true
    },
    category: {
        type: String,
        enum: ['food', 'transport', 'sightseeing', 'lodging', 'other'],
        default: 'other'
    },
    notes: {
        type: String,
        default: '',
        trim: true
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('ItineraryItem', ItineraryItemSchema);
