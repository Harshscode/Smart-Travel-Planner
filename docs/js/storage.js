// ============================================================
// storage.js - LocalStorage Data Access Layer
// ============================================================
// DEPRECATED in Phase 2 - All data is now stored in MongoDB.
// This file is kept for compatibility but all functions are stubs.
// Use apiClient instead: window.apiClient.*
// ============================================================

(function(window) {
    'use strict';

    // --- Deprecated stubs (do not use) ---
    function generateId() { return Date.now().toString(); }
    function getUsers() { return []; }
    function saveUsers() {}
    function findUserByEmail() { return null; }
    function findUserByName() { return null; }
    function addUser() { return null; }
    function getCurrentUser() { return null; }
    function setCurrentUser() {}
    function getTrips() { return []; }
    function saveTrips() {}
    function getUserTrips() { return []; }
    function getTripById() { return null; }
    function addTrip() { return null; }
    function updateTrip() { return null; }
    function deleteTrip() { return false; }

    // --- Expose globally as window.storage (deprecated) ---
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
