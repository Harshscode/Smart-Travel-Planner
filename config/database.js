const mongoose = require('mongoose');

function connectDB() {
    const mongoURI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/smartTravelPlanner';
    mongoose.connect(mongoURI)
        .then(() => console.log('MongoDB connected successfully'))
        .catch(err => console.error('MongoDB connection error:', err));
}

module.exports = connectDB;
