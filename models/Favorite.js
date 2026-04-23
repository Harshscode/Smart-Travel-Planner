const mongoose = require('mongoose');

const FavoriteSchema = new mongoose.Schema({
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

module.exports = mongoose.model('Favorite', FavoriteSchema);
