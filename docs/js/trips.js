// ============================================================
// trips.js - Trip Management Logic
// ============================================================
// All functions are exposed as window.trips.*
// ============================================================

(function(window) {
    'use strict';

    // --- Validation ---

    function validateTrip(data) {
        if (!data.destination || data.destination.trim() === '') {
            return 'Destination is required.';
        }
        if (!data.startDate) {
            return 'Start date is required.';
        }
        if (!data.endDate) {
            return 'End date is required.';
        }
        if (new Date(data.endDate) < new Date(data.startDate)) {
            return 'End date must be the same as or after the start date.';
        }
        return null;
    }

    // --- Trip CRUD ---

    function addTrip(tripData) {
        var user = window.storage.getCurrentUser();
        if (!user) {
            return { success: false, error: 'You must be logged in to add a trip.' };
        }

        var validationError = validateTrip(tripData);
        if (validationError) {
            return { success: false, error: validationError };
        }

        var trip = window.storage.addTrip(tripData, user.id);
        console.log('Trip added: ' + trip.destination + ' by ' + user.name);
        return { success: true, trip: trip };
    }

    function updateTrip(tripId, updateData) {
        var user = window.storage.getCurrentUser();
        if (!user) {
            return { success: false, error: 'You must be logged in.' };
        }

        var existingTrip = window.storage.getTripById(tripId);
        if (!existingTrip) {
            return { success: false, error: 'Trip not found.' };
        }
        if (existingTrip.userId !== user.id) {
            return { success: false, error: 'You can only edit your own trips.' };
        }

        var validationError = validateTrip(updateData);
        if (validationError) {
            return { success: false, error: validationError };
        }

        var updatedTrip = window.storage.updateTrip(tripId, updateData);
        if (!updatedTrip) {
            return { success: false, error: 'Trip not found.' };
        }

        console.log('Trip updated: ' + updatedTrip.destination);
        return { success: true, trip: updatedTrip };
    }

    function deleteTrip(tripId) {
        var user = window.storage.getCurrentUser();
        if (!user) {
            return { success: false, error: 'You must be logged in.' };
        }

        var existingTrip = window.storage.getTripById(tripId);
        if (!existingTrip) {
            return { success: false, error: 'Trip not found.' };
        }
        if (existingTrip.userId !== user.id) {
            return { success: false, error: 'You can only delete your own trips.' };
        }

        var deleted = window.storage.deleteTrip(tripId);
        if (deleted) {
            console.log('Trip deleted: ' + tripId);
            return { success: true };
        }
        return { success: false, error: 'Failed to delete trip.' };
    }

    // --- Queries ---

    function getMyTrips() {
        var user = window.storage.getCurrentUser();
        if (!user) return [];
        return window.storage.getUserTrips(user.id);
    }

    function getTripById(tripId) {
        return window.storage.getTripById(tripId);
    }

    function calculateStats(trips) {
        var now = new Date();
        var upcomingTrips = 0;
        var pastTrips = 0;
        var totalBudget = 0;

        for (var i = 0; i < trips.length; i++) {
            var endDate = new Date(trips[i].endDate);
            if (endDate < now) {
                pastTrips++;
            } else {
                upcomingTrips++;
            }
            totalBudget += parseFloat(trips[i].budget) || 0;
        }

        return {
            totalTrips: trips.length,
            upcomingTrips: upcomingTrips,
            pastTrips: pastTrips,
            totalBudget: totalBudget
        };
    }

    function getTripDuration(startDate, endDate) {
        var start = new Date(startDate);
        var end = new Date(endDate);
        var diffMs = end - start;
        var diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24)) + 1;
        return Math.max(1, diffDays);
    }

    function isUpcoming(startDate) {
        var start = new Date(startDate);
        var now = new Date();
        now.setHours(0, 0, 0, 0);
        return start >= now;
    }

    function isPast(endDate) {
        var end = new Date(endDate);
        var now = new Date();
        now.setHours(0, 0, 0, 0);
        return end < now;
    }

    // --- Expose globally as window.trips ---
    window.trips = {
        addTrip: addTrip,
        updateTrip: updateTrip,
        deleteTrip: deleteTrip,
        getMyTrips: getMyTrips,
        getTripById: getTripById,
        calculateStats: calculateStats,
        getTripDuration: getTripDuration,
        isUpcoming: isUpcoming,
        isPast: isPast
    };

})(window);
