// ============================================================
// authController.js - Authentication Logic
// ============================================================
// Handles user registration, login, and logout.
// Passwords are hashed using bcryptjs before storage.
// ============================================================

const bcrypt = require('bcryptjs');
const dataStore = require('./dataStore');

// --- Helper: Require Login Middleware ---
// Use this in routes that require authentication
function requireLogin(req, res, next) {
    if (!req.session.user) {
        return res.redirect('/login');
    }
    next();
}

// --- REGISTER PAGE ---
function getRegisterPage(req, res) {
    if (req.session.user) {
        return res.redirect('/dashboard');
    }
    res.render('register', {
        title: 'Register',
        error: null,
        formData: {}
    });
}

async function handleRegister(req, res) {
    const { username, email, password, confirmPassword } = req.body;

    // --- Validation ---
    // Check that all fields are filled
    if (!username || !email || !password || !confirmPassword) {
        return res.render('register', {
            title: 'Register',
            error: 'All fields are required.',
            formData: { username, email }
        });
    }

    // Check username length
    if (username.trim().length < 3) {
        return res.render('register', {
            title: 'Register',
            error: 'Username must be at least 3 characters.',
            formData: { username, email }
        });
    }

    // Check password length
    if (password.length < 6) {
        return res.render('register', {
            title: 'Register',
            error: 'Password must be at least 6 characters.',
            formData: { username, email }
        });
    }

    // Check passwords match
    if (password !== confirmPassword) {
        return res.render('register', {
            title: 'Register',
            error: 'Passwords do not match.',
            formData: { username, email }
        });
    }

    // Check if email is already registered
    if (dataStore.findUserByEmail(email)) {
        return res.render('register', {
            title: 'Register',
            error: 'An account with this email already exists.',
            formData: { username, email }
        });
    }

    // Check if username is taken
    if (dataStore.findUserByUsername(username)) {
        return res.render('register', {
            title: 'Register',
            error: 'This username is already taken.',
            formData: { username, email }
        });
    }

    // --- Hash password and create user ---
    try {
        const hashedPassword = await bcrypt.hash(password, 10); // 10 = salt rounds
        const user = dataStore.addUser({
            username: username.trim(),
            email: email.trim(),
            password: hashedPassword
        });

        // Log the user in automatically
        req.session.user = user;
        res.redirect('/dashboard');
    } catch (err) {
        console.error('Registration error:', err);
        res.render('register', {
            title: 'Register',
            error: 'Something went wrong. Please try again.',
            formData: { username, email }
        });
    }
}

// --- LOGIN PAGE ---
function getLoginPage(req, res) {
    if (req.session.user) {
        return res.redirect('/dashboard');
    }
    res.render('login', {
        title: 'Login',
        error: null
    });
}

async function handleLogin(req, res) {
    const { email, password } = req.body;

    // --- Validation ---
    if (!email || !password) {
        return res.render('login', {
            title: 'Login',
            error: 'Please enter both email and password.'
        });
    }

    // Find user by email
    const user = dataStore.findUserByEmail(email.trim().toLowerCase());
    if (!user) {
        return res.render('login', {
            title: 'Login',
            error: 'No account found with this email.'
        });
    }

    // Check password
    try {
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.render('login', {
                title: 'Login',
                error: 'Incorrect password. Please try again.'
            });
        }
    } catch (err) {
        console.error('Login error:', err);
        return res.render('login', {
            title: 'Login',
            error: 'Something went wrong. Please try again.'
        });
    }

    // --- Success: Create session ---
    const { password: _, ...userWithoutPassword } = user;
    req.session.user = userWithoutPassword;
    res.redirect('/dashboard');
}

// --- LOGOUT ---
function handleLogout(req, res) {
    req.session.destroy((err) => {
        if (err) {
            console.error('Logout error:', err);
        }
        res.redirect('/login');
    });
}

module.exports = {
    getRegisterPage,
    handleRegister,
    getLoginPage,
    handleLogin,
    handleLogout,
    requireLogin
};
