const express = require('express');
const bcrypt = require('bcryptjs');
const User = require('../models/User');
const router = express.Router();

// POST /api/auth/register
router.post('/register', async (req, res) => {
    try {
        const { name, email, password, confirmPassword } = req.body;

        // Validation
        if (!name || !email || !password || !confirmPassword) {
            return res.status(400).json({ success: false, error: 'All fields are required' });
        }
        if (name.trim().length < 3) {
            return res.status(400).json({ success: false, error: 'Username must be at least 3 characters' });
        }
        if (password.length < 6) {
            return res.status(400).json({ success: false, error: 'Password must be at least 6 characters' });
        }
        if (password !== confirmPassword) {
            return res.status(400).json({ success: false, error: 'Passwords do not match' });
        }
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email.trim())) {
            return res.status(400).json({ success: false, error: 'Please enter a valid email address' });
        }

        // Check if email already exists
        const existingUser = await User.findOne({ email: email.toLowerCase().trim() });
        if (existingUser) {
            return res.status(400).json({ success: false, error: 'An account with this email already exists' });
        }

        // Check if name already exists
        const existingName = await User.findOne({ name: { $regex: new RegExp(`^${name.trim()}$`, 'i') } });
        if (existingName) {
            return res.status(400).json({ success: false, error: 'This username is already taken' });
        }

        // Hash password and create user
        const hashedPassword = await bcrypt.hash(password, 10);
        const user = new User({
            name: name.trim(),
            email: email.toLowerCase().trim(),
            password: hashedPassword
        });
        await user.save();

        // Set session
        req.session.userId = user._id;
        req.session.userName = user.name;

        // Return user without password
        res.status(201).json({
            success: true,
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                createdAt: user.createdAt
            }
        });
    } catch (err) {
        console.error('Register error:', err);
        res.status(500).json({ success: false, error: 'Server error during registration' });
    }
});

// POST /api/auth/login
router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ success: false, error: 'Please enter both email and password' });
        }

        const user = await User.findOne({ email: email.toLowerCase().trim() });
        if (!user) {
            return res.status(401).json({ success: false, error: 'No account found with this email' });
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(401).json({ success: false, error: 'Incorrect password. Please try again' });
        }

        // Set session
        req.session.userId = user._id;
        req.session.userName = user.name;

        res.json({
            success: true,
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                createdAt: user.createdAt
            }
        });
    } catch (err) {
        console.error('Login error:', err);
        res.status(500).json({ success: false, error: 'Server error during login' });
    }
});

// POST /api/auth/logout
router.post('/logout', (req, res) => {
    req.session.destroy((err) => {
        if (err) {
            return res.status(500).json({ success: false, error: 'Error logging out' });
        }
        res.clearCookie('connect.sid');
        res.json({ success: true, message: 'Logged out successfully' });
    });
});

// GET /api/auth/me
router.get('/me', async (req, res) => {
    if (!req.session.userId) {
        return res.status(401).json({ success: false, error: 'Not logged in' });
    }

    try {
        const user = await User.findById(req.session.userId).select('-password');
        if (!user) {
            req.session.destroy();
            return res.status(401).json({ success: false, error: 'User not found' });
        }
        res.json({
            success: true,
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                createdAt: user.createdAt
            }
        });
    } catch (err) {
        console.error('Get user error:', err);
        res.status(500).json({ success: false, error: 'Server error' });
    }
});

module.exports = router;
