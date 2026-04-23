const mongoose = require('mongoose');

const TripSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        index: true
    },
    destination: {
        type: String,
        required: [true, 'Destination is required'],
        trim: true
    },
    startDate: {
        type: Date,
        required: [true, 'Start date is required']
    },
    endDate: {
        type: Date,
        required: [true, 'End date is required']
    },
    budget: {
        type: Number,
        default: 0,
        min: [0, 'Budget cannot be negative']
    },
    currency: {
        type: String,
        default: 'USD',
        uppercase: true
    },
    notes: {
        type: String,
        default: '',
        trim: true
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    updatedAt: {
        type: Date,
        default: Date.now
    }
});

// Validate end date is same as or after start date
TripSchema.pre('save', function() {
    this.updatedAt = Date.now();
    if (this.endDate < this.startDate) {
        throw new Error('End date must be the same as or after the start date');
    }
});

module.exports = mongoose.model('Trip', TripSchema);
