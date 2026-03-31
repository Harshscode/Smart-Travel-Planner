// ============================================================
// tripController.js - Trip Management Logic
// ============================================================
// Handles the dashboard, adding, editing, and deleting trips.
// ============================================================

const dataStore = require('./dataStore');

// --- DASHBOARD ---
function getDashboard(req, res) {
    const user = req.session.user;
    if (!user) return res.redirect('/login');

    const trips = dataStore.getTripsByUser(user.id);

    // Sort trips: upcoming first, then by start date
    const sortedTrips = trips.sort((a, b) => {
        const now = new Date();
        const aStart = new Date(a.startDate);
        const bStart = new Date(b.startDate);
        const aEnded = aStart < now;
        const bEnded = bStart < now;

        // Past trips go to the bottom
        if (aEnded && !bEnded) return 1;
        if (!aEnded && bEnded) return -1;

        // Sort by start date (soonest first)
        return aStart - bStart;
    });

    // Calculate some stats
    const totalTrips = trips.length;
    const upcomingTrips = trips.filter(t => new Date(t.startDate) >= new Date()).length;
    const pastTrips = totalTrips - upcomingTrips;
    const totalBudget = trips.reduce((sum, t) => sum + (parseFloat(t.budget) || 0), 0);

    res.render('dashboard', {
        title: 'Dashboard',
        user: user,
        trips: sortedTrips,
        stats: { totalTrips, upcomingTrips, pastTrips, totalBudget }
    });
}

// --- ADD TRIP PAGE ---
function getAddTripPage(req, res) {
    if (!req.session.user) return res.redirect('/login');

    res.render('addTrip', {
        title: 'Add Trip',
        user: req.session.user,
        error: null
    });
}

function handleAddTrip(req, res) {
    if (!req.session.user) return res.redirect('/login');

    const { destination, startDate, endDate, budget, currency, notes } = req.body;

    // --- Validation ---
    if (!destination || !startDate || !endDate) {
        return res.render('addTrip', {
            title: 'Add Trip',
            user: req.session.user,
            error: 'Destination, start date, and end date are required.'
        });
    }

    // Check that end date is after start date
    if (new Date(endDate) < new Date(startDate)) {
        return res.render('addTrip', {
            title: 'Add Trip',
            user: req.session.user,
            error: 'End date must be after start date.'
        });
    }

    // Create the trip
    const trip = dataStore.addTrip({
        userId: req.session.user.id,
        destination,
        startDate,
        endDate,
        budget,
        currency: currency || 'USD',
        notes
    });

    console.log(`Trip added: ${trip.destination} by ${req.session.user.username}`);
    res.redirect('/dashboard');
}

// --- EDIT TRIP PAGE ---
function getEditTripPage(req, res) {
    if (!req.session.user) return res.redirect('/login');

    const trip = dataStore.getTripById(req.params.id, req.session.user.id);
    if (!trip) {
        return res.redirect('/dashboard');
    }

    res.render('editTrip', {
        title: 'Edit Trip',
        user: req.session.user,
        trip,
        error: null
    });
}

function handleEditTrip(req, res) {
    if (!req.session.user) return res.redirect('/login');

    const { destination, startDate, endDate, budget, currency, notes } = req.body;

    // --- Validation ---
    if (!destination || !startDate || !endDate) {
        const trip = dataStore.getTripById(req.params.id, req.session.user.id);
        return res.render('editTrip', {
            title: 'Edit Trip',
            user: req.session.user,
            trip,
            error: 'Destination, start date, and end date are required.'
        });
    }

    if (new Date(endDate) < new Date(startDate)) {
        const trip = dataStore.getTripById(req.params.id, req.session.user.id);
        return res.render('editTrip', {
            title: 'Edit Trip',
            user: req.session.user,
            trip,
            error: 'End date must be after start date.'
        });
    }

    const updated = dataStore.updateTrip(req.params.id, req.session.user.id, {
        destination,
        startDate,
        endDate,
        budget,
        currency: currency || 'USD',
        notes
    });

    if (!updated) {
        return res.redirect('/dashboard');
    }

    console.log(`Trip updated: ${updated.destination}`);
    res.redirect('/dashboard');
}

// --- DELETE TRIP ---
function handleDeleteTrip(req, res) {
    if (!req.session.user) return res.redirect('/login');

    const deleted = dataStore.deleteTrip(req.params.id, req.session.user.id);
    if (deleted) {
        console.log(`Trip deleted: ${req.params.id}`);
    }

    res.redirect('/dashboard');
}

module.exports = {
    getDashboard,
    getAddTripPage,
    handleAddTrip,
    getEditTripPage,
    handleEditTrip,
    handleDeleteTrip
};
