// ============================================================
// trips.js - Trip Management Logic
// ============================================================
// Uses apiClient for data access. Pure utility functions are kept.
// All functions are exposed as window.trips.*
// ============================================================

(function(window) {
    'use strict';

    // --- Validation ---
    var TODAY = new Date();
    TODAY.setHours(0, 0, 0, 0);

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
        var start = new Date(data.startDate);
        start.setHours(0, 0, 0, 0);
        if (data._isNew && start < TODAY) {
            return 'Start date cannot be in the past.';
        }
        if (data.budget !== undefined && data.budget !== '' && parseFloat(data.budget) <= 0) {
            return 'Budget must be a positive number.';
        }
        return null;
    }

    // --- Sorting ---
    function sortTripsByDate(trips, direction) {
        var sorted = trips.slice().sort(function(a, b) {
            return new Date(a.startDate) - new Date(b.startDate);
        });
        if (direction === 'desc') sorted.reverse();
        return sorted;
    }

    function sortTripsByBudget(trips, direction) {
        var sorted = trips.slice().sort(function(a, b) {
            return (parseFloat(a.budget) || 0) - (parseFloat(b.budget) || 0);
        });
        if (direction === 'desc') sorted.reverse();
        return sorted;
    }

    function sortTripsByDestination(trips, direction) {
        var sorted = trips.slice().sort(function(a, b) {
            return a.destination.localeCompare(b.destination);
        });
        if (direction === 'desc') sorted.reverse();
        return sorted;
    }

    function sortTrips(trips, sortKey) {
        switch (sortKey) {
            case 'date-asc': return sortTripsByDate(trips, 'asc');
            case 'date-desc': return sortTripsByDate(trips, 'desc');
            case 'budget-asc': return sortTripsByBudget(trips, 'asc');
            case 'budget-desc': return sortTripsByBudget(trips, 'desc');
            case 'destination-asc': return sortTripsByDestination(trips, 'asc');
            default: return sortTripsByDate(trips, 'asc');
        }
    }

    // --- Relative Date ---
    function getRelativeDate(startDate) {
        var start = new Date(startDate);
        start.setHours(0, 0, 0, 0);
        var now = new Date();
        now.setHours(0, 0, 0, 0);
        var diffDays = Math.round((start - now) / (1000 * 60 * 60 * 24));

        if (diffDays === 0) return 'Today';
        if (diffDays === 1) return 'Tomorrow';
        if (diffDays === -1) return 'Yesterday';
        if (diffDays > 1) return 'In ' + diffDays + ' days';
        return diffDays * -1 + ' days ago';
    }

    // --- Trip CRUD (async via apiClient) ---

    function addTrip(tripData) {
        var user = apiClient.getCurrentUserSync();
        if (!user) {
            return { success: false, error: 'You must be logged in to add a trip.' };
        }

        var validationError = validateTrip(tripData);
        if (validationError) {
            return { success: false, error: validationError };
        }

        tripData._isNew = true;
        return apiClient.createTrip(tripData);
    }

    function updateTrip(tripId, updateData) {
        var user = apiClient.getCurrentUserSync();
        if (!user) {
            return { success: false, error: 'You must be logged in.' };
        }

        var validationError = validateTrip(updateData);
        if (validationError) {
            return { success: false, error: validationError };
        }

        return apiClient.updateTrip(tripId, updateData);
    }

    function deleteTrip(tripId) {
        var user = apiClient.getCurrentUserSync();
        if (!user) {
            return { success: false, error: 'You must be logged in.' };
        }

        return apiClient.deleteTrip(tripId);
    }

    // --- Queries (async via apiClient) ---

    function getMyTrips() {
        // This returns a promise - callers need to handle async
        return apiClient.getTrips();
    }

    function getTripById(tripId) {
        return apiClient.getTripById(tripId);
    }

    // --- Pure Utility Functions (no data access - keep as-is) ---

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
        validateTrip: validateTrip,
        addTrip: addTrip,
        updateTrip: updateTrip,
        deleteTrip: deleteTrip,
        getMyTrips: getMyTrips,
        getTripById: getTripById,
        calculateStats: calculateStats,
        getTripDuration: getTripDuration,
        isUpcoming: isUpcoming,
        isPast: isPast,
        sortTrips: sortTrips,
        getRelativeDate: getRelativeDate
    };

})(window);
