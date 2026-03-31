// ============================================================
// dataStore.js - Local JSON File Storage
// ============================================================
// This module handles reading and writing users and trips
// to JSON files. In Phase 2 this would be replaced by a
// database like MongoDB.
// ============================================================

const fs = require('fs');
const path = require('path');

// File paths for our data
const USERS_FILE = path.join(__dirname, '../data/users.json');
const TRIPS_FILE = path.join(__dirname, '../data/trips.json');

/**
 * Read data from a JSON file.
 * Returns an empty array if the file doesn't exist or is empty.
 * @param {string} filePath - Path to the JSON file
 * @returns {Array} Parsed JSON data or empty array
 */
function readData(filePath) {
    try {
        if (!fs.existsSync(filePath)) {
            return [];
        }
        const data = fs.readFileSync(filePath, 'utf8');
        return data ? JSON.parse(data) : [];
    } catch (err) {
        console.error(`Error reading ${filePath}:`, err.message);
        return [];
    }
}

/**
 * Write data to a JSON file.
 * @param {string} filePath - Path to the JSON file
 * @param {Array} data - Data to write
 */
function writeData(filePath, data) {
    try {
        fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf8');
    } catch (err) {
        console.error(`Error writing ${filePath}:`, err.message);
    }
}

// ============================================================
// USER FUNCTIONS
// ============================================================

/**
 * Get all users from the data store.
 * @returns {Array} Array of user objects
 */
function getAllUsers() {
    return readData(USERS_FILE);
}

/**
 * Find a user by their email address.
 * @param {string} email - User's email
 * @returns {Object|null} User object or null if not found
 */
function findUserByEmail(email) {
    const users = getAllUsers();
    return users.find(u => u.email.toLowerCase() === email.toLowerCase()) || null;
}

/**
 * Find a user by their username.
 * @param {string} username - User's username
 * @returns {Object|null} User object or null if not found
 */
function findUserByUsername(username) {
    const users = getAllUsers();
    return users.find(u => u.username.toLowerCase() === username.toLowerCase()) || null;
}

/**
 * Add a new user to the data store.
 * @param {Object} userData - User data (username, email, password)
 * @returns {Object} The newly created user (without password)
 */
function addUser(userData) {
    const users = getAllUsers();
    const newUser = {
        id: Date.now().toString(),         // Simple ID based on timestamp
        username: userData.username.trim(),
        email: userData.email.trim().toLowerCase(),
        password: userData.password,       // Will be hashed before storing
        createdAt: new Date().toISOString()
    };
    users.push(newUser);
    writeData(USERS_FILE, users);
    // Return user without password
    const { password, ...userWithoutPassword } = newUser;
    return userWithoutPassword;
}

/**
 * Find a user by their ID.
 * @param {string} id - User's ID
 * @returns {Object|null} User object or null
 */
function findUserById(id) {
    const users = getAllUsers();
    return users.find(u => u.id === id) || null;
}

// ============================================================
// TRIP FUNCTIONS
// ============================================================

/**
 * Get all trips from the data store.
 * @returns {Array} Array of trip objects
 */
function getAllTrips() {
    return readData(TRIPS_FILE);
}

/**
 * Get all trips for a specific user.
 * @param {string} userId - The owner's user ID
 * @returns {Array} Array of trip objects
 */
function getTripsByUser(userId) {
    const trips = getAllTrips();
    return trips.filter(t => t.userId === userId);
}

/**
 * Get a specific trip by its ID.
 * @param {string} tripId - Trip ID
 * @param {string} userId - User ID (for ownership check)
 * @returns {Object|null} Trip object or null
 */
function getTripById(tripId, userId) {
    const trips = getAllTrips();
    return trips.find(t => t.id === tripId && t.userId === userId) || null;
}

/**
 * Add a new trip.
 * @param {Object} tripData - Trip data
 * @returns {Object} The newly created trip
 */
function addTrip(tripData) {
    const trips = getAllTrips();
    const newTrip = {
        id: Date.now().toString(),
        userId: tripData.userId,
        destination: tripData.destination.trim(),
        startDate: tripData.startDate,
        endDate: tripData.endDate,
        budget: parseFloat(tripData.budget) || 0,
        currency: tripData.currency || 'USD',
        notes: tripData.notes || '',
        createdAt: new Date().toISOString()
    };
    trips.push(newTrip);
    writeData(TRIPS_FILE, trips);
    return newTrip;
}

/**
 * Update an existing trip.
 * @param {string} tripId - Trip ID
 * @param {string} userId - User ID (for ownership check)
 * @param {Object} updateData - Fields to update
 * @returns {Object|null} Updated trip or null
 */
function updateTrip(tripId, userId, updateData) {
    const trips = getAllTrips();
    const index = trips.findIndex(t => t.id === tripId && t.userId === userId);
    if (index === -1) return null;

    const updatedTrip = {
        ...trips[index],
        destination: updateData.destination ? updateData.destination.trim() : trips[index].destination,
        startDate: updateData.startDate || trips[index].startDate,
        endDate: updateData.endDate || trips[index].endDate,
        budget: parseFloat(updateData.budget) || trips[index].budget,
        currency: updateData.currency || trips[index].currency,
        notes: updateData.notes !== undefined ? updateData.notes : trips[index].notes,
        updatedAt: new Date().toISOString()
    };

    trips[index] = updatedTrip;
    writeData(TRIPS_FILE, trips);
    return updatedTrip;
}

/**
 * Delete a trip.
 * @param {string} tripId - Trip ID
 * @param {string} userId - User ID (for ownership check)
 * @returns {boolean} True if deleted, false if not found
 */
function deleteTrip(tripId, userId) {
    const trips = getAllTrips();
    const index = trips.findIndex(t => t.id === tripId && t.userId === userId);
    if (index === -1) return false;

    trips.splice(index, 1);
    writeData(TRIPS_FILE, trips);
    return true;
}

module.exports = {
    // User exports
    getAllUsers,
    findUserByEmail,
    findUserByUsername,
    findUserById,
    addUser,
    // Trip exports
    getAllTrips,
    getTripsByUser,
    getTripById,
    addTrip,
    updateTrip,
    deleteTrip
};
