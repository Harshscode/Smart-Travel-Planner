// ============================================================
// storage.js - LocalStorage Data Access Layer
// ============================================================
// All functions are exposed as window.storage.* for use across pages.
// ============================================================

(function(window) {
    'use strict';

    // --- Constants ---
    var STORAGE_KEYS = {
        USERS: 'stp_users',
        TRIPS: 'stp_trips',
        CURRENT_USER: 'stp_currentUser'
    };

    // --- Generic Helpers ---

    function generateId() {
        return Date.now().toString();
    }

    function getData(key) {
        try {
            var data = localStorage.getItem(key);
            return data ? JSON.parse(data) : [];
        } catch (err) {
            console.error('Error reading ' + key + ' from localStorage:', err);
            return [];
        }
    }

    function setData(key, data) {
        try {
            localStorage.setItem(key, JSON.stringify(data));
        } catch (err) {
            console.error('Error saving ' + key + ' to localStorage:', err);
        }
    }

    // --- User Functions ---

    function getUsers() {
        return getData(STORAGE_KEYS.USERS);
    }

    function saveUsers(users) {
        setData(STORAGE_KEYS.USERS, users);
    }

    function findUserByEmail(email) {
        var users = getUsers();
        var lowerEmail = email.toLowerCase().trim();
        for (var i = 0; i < users.length; i++) {
            if (users[i].email.toLowerCase() === lowerEmail) {
                return users[i];
            }
        }
        return null;
    }

    function findUserByName(name) {
        var users = getUsers();
        var lowerName = name.toLowerCase().trim();
        for (var i = 0; i < users.length; i++) {
            if (users[i].name.toLowerCase() === lowerName) {
                return users[i];
            }
        }
        return null;
    }

    function addUser(userData) {
        var users = getUsers();
        var newUser = {
            id: generateId(),
            name: userData.name.trim(),
            email: userData.email.trim().toLowerCase(),
            password: userData.password,
            createdAt: new Date().toISOString()
        };
        users.push(newUser);
        saveUsers(users);
        // Return user WITHOUT password
        var userWithoutPassword = {
            id: newUser.id,
            name: newUser.name,
            email: newUser.email,
            createdAt: newUser.createdAt
        };
        return userWithoutPassword;
    }

    function getCurrentUser() {
        try {
            var data = localStorage.getItem(STORAGE_KEYS.CURRENT_USER);
            return data ? JSON.parse(data) : null;
        } catch (err) {
            console.error('Error reading current user:', err);
            return null;
        }
    }

    function setCurrentUser(user) {
        if (user) {
            localStorage.setItem(STORAGE_KEYS.CURRENT_USER, JSON.stringify(user));
        } else {
            localStorage.removeItem(STORAGE_KEYS.CURRENT_USER);
        }
    }

    // --- Trip Functions ---

    function getTrips() {
        return getData(STORAGE_KEYS.TRIPS);
    }

    function saveTrips(trips) {
        setData(STORAGE_KEYS.TRIPS, trips);
    }

    function getUserTrips(userId) {
        var allTrips = getTrips();
        var userTrips = [];
        for (var i = 0; i < allTrips.length; i++) {
            if (allTrips[i].userId === userId) {
                userTrips.push(allTrips[i]);
            }
        }

        // Sort: upcoming first, then past
        var now = new Date();
        userTrips.sort(function(a, b) {
            var aStart = new Date(a.startDate);
            var bStart = new Date(b.startDate);
            var aEnded = new Date(a.endDate) < now;
            var bEnded = new Date(b.endDate) < now;

            if (aEnded && !bEnded) return 1;
            if (!aEnded && bEnded) return -1;
            return aStart - bStart;
        });

        return userTrips;
    }

    function getTripById(tripId) {
        var trips = getTrips();
        for (var i = 0; i < trips.length; i++) {
            if (trips[i].id === tripId) {
                return trips[i];
            }
        }
        return null;
    }

    function addTrip(tripData, userId) {
        var trips = getTrips();
        var newTrip = {
            id: generateId(),
            userId: userId,
            destination: tripData.destination.trim(),
            startDate: tripData.startDate,
            endDate: tripData.endDate,
            budget: parseFloat(tripData.budget) || 0,
            currency: tripData.currency || 'USD',
            notes: tripData.notes || '',
            createdAt: new Date().toISOString()
        };
        trips.push(newTrip);
        saveTrips(trips);
        return newTrip;
    }

    function updateTrip(tripId, updateData) {
        var trips = getTrips();
        var index = -1;
        for (var i = 0; i < trips.length; i++) {
            if (trips[i].id === tripId) {
                index = i;
                break;
            }
        }
        if (index === -1) return null;

        var updatedTrip = {
            id: trips[index].id,
            userId: trips[index].userId,
            destination: updateData.destination ? updateData.destination.trim() : trips[index].destination,
            startDate: updateData.startDate || trips[index].startDate,
            endDate: updateData.endDate || trips[index].endDate,
            budget: parseFloat(updateData.budget) || trips[index].budget,
            currency: updateData.currency || trips[index].currency,
            notes: updateData.notes !== undefined ? updateData.notes : trips[index].notes,
            createdAt: trips[index].createdAt,
            updatedAt: new Date().toISOString()
        };

        trips[index] = updatedTrip;
        saveTrips(trips);
        return updatedTrip;
    }

    function deleteTrip(tripId) {
        var trips = getTrips();
        var index = -1;
        for (var i = 0; i < trips.length; i++) {
            if (trips[i].id === tripId) {
                index = i;
                break;
            }
        }
        if (index === -1) return false;
        trips.splice(index, 1);
        saveTrips(trips);
        return true;
    }

    // --- Expose globally as window.storage ---
    window.storage = {
        generateId: generateId,
        getUsers: getUsers,
        saveUsers: saveUsers,
        findUserByEmail: findUserByEmail,
        findUserByName: findUserByName,
        addUser: addUser,
        getCurrentUser: getCurrentUser,
        setCurrentUser: setCurrentUser,
        getTrips: getTrips,
        saveTrips: saveTrips,
        getUserTrips: getUserTrips,
        getTripById: getTripById,
        addTrip: addTrip,
        updateTrip: updateTrip,
        deleteTrip: deleteTrip
    };

})(window);
