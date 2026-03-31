// ============================================================
// ui.js - User Interface Helper Functions
// ============================================================
// All functions are exposed as window.ui.*
// ============================================================

(function(window) {
    'use strict';

    // --- Alerts ---

    function showAlert(containerId, message, type) {
        var container = document.getElementById(containerId);
        if (!container) return;
        type = type || 'error';
        var icon = type === 'error' ? 'exclamation-circle' : 'check-circle';
        var alertClass = type === 'error' ? 'alert-error' : 'alert-success';
        container.innerHTML = '<div class="alert ' + alertClass + '">' +
            '<i class="fas fa-' + icon + '"></i> ' + escapeHtml(message) +
            '</div>';
    }

    function clearAlert(containerId) {
        var container = document.getElementById(containerId);
        if (container) container.innerHTML = '';
    }

    // --- Modals ---

    function showModal(modalId) {
        var modal = document.getElementById(modalId);
        if (modal) modal.classList.remove('hidden');
    }

    function hideModal(modalId) {
        var modal = document.getElementById(modalId);
        if (modal) modal.classList.add('hidden');
    }

    // --- Date Formatting ---

    function formatDate(dateStr) {
        if (!dateStr) return '';
        var date = new Date(dateStr);
        var options = { year: 'numeric', month: 'short', day: 'numeric' };
        return date.toLocaleDateString('en-US', options);
    }

    function getDuration(startDate, endDate) {
        var start = new Date(startDate);
        var end = new Date(endDate);
        var diffMs = end - start;
        var diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24)) + 1;
        return Math.max(1, diffDays);
    }

    // --- HTML Generators ---

    function renderTripCard(trip) {
        var startStr = formatDate(trip.startDate);
        var endStr = formatDate(trip.endDate);
        var duration = getDuration(trip.startDate, trip.endDate);
        var tripUpcoming = window.trips.isUpcoming(trip.startDate);
        var tripPast = window.trips.isPast(trip.endDate);
        var tripStatusClass = tripPast ? 'status-past' : 'status-upcoming';
        var tripStatusText = tripPast ? 'Past' : 'Upcoming';
        var tripCardClass = tripPast ? 'trip-card trip-past' : 'trip-card';

        var notesHtml = '';
        if (trip.notes) {
            notesHtml = '<div class="trip-detail trip-notes">' +
                '<i class="fas fa-sticky-note"></i>' +
                '<span>' + escapeHtml(truncate(trip.notes, 80)) + '</span>' +
                '</div>';
        }

        return '<div class="' + tripCardClass + '" data-trip-id="' + trip.id + '">' +
            '<div class="trip-card-header">' +
            '<div class="trip-destination">' +
            '<i class="fas fa-map-marker-alt"></i>' +
            '<h3>' + escapeHtml(trip.destination) + '</h3>' +
            '</div>' +
            '<div class="trip-status ' + tripStatusClass + '">' + tripStatusText + '</div>' +
            '</div>' +
            '<div class="trip-card-body">' +
            '<div class="trip-detail">' +
            '<i class="fas fa-calendar-alt"></i>' +
            '<span>' + startStr + ' — ' + endStr + '</span>' +
            '</div>' +
            '<div class="trip-detail">' +
            '<i class="fas fa-clock"></i>' +
            '<span>' + duration + ' day' + (duration !== 1 ? 's' : '') + '</span>' +
            '</div>' +
            '<div class="trip-detail">' +
            '<i class="fas fa-wallet"></i>' +
            '<span>' + trip.currency + ' ' + parseFloat(trip.budget).toLocaleString() + '</span>' +
            '</div>' +
            notesHtml +
            '</div>' +
            '<div class="trip-card-footer">' +
            '<button class="btn btn-sm btn-outline" onclick="checkWeatherForTrip(\'' + escapeHtml(trip.destination).replace(/'/g, "\\'") + '\')">' +
            '<i class="fas fa-cloud-sun"></i> Weather' +
            '</button>' +
            '<div class="trip-actions">' +
            '<a href="edit-trip.html?id=' + trip.id + '" class="btn btn-sm btn-secondary">' +
            '<i class="fas fa-edit"></i> Edit' +
            '</a>' +
            '<button class="btn btn-sm btn-danger" onclick="confirmDelete(\'' + trip.id + '\', \'' + escapeHtml(trip.destination).replace(/'/g, "\\'") + '\')">' +
            '<i class="fas fa-trash"></i> Delete' +
            '</button>' +
            '</div>' +
            '</div>' +
            '</div>';
    }

    function renderEmptyState() {
        return '<div class="empty-state">' +
            '<div class="empty-icon"><i class="fas fa-globe-americas"></i></div>' +
            '<h3>No trips yet</h3>' +
            '<p>You haven\'t added any trips. Start planning your next adventure!</p>' +
            '<a href="add-trip.html" class="btn btn-primary">' +
            '<i class="fas fa-plus"></i> Add Your First Trip' +
            '</a></div>';
    }

    function renderLoading(message) {
        message = message || 'Loading...';
        return '<div class="tool-loading"><i class="fas fa-spinner fa-spin"></i> ' + escapeHtml(message) + '</div>';
    }

    function renderWeatherResult(w) {
        return '<div class="weather-display">' +
            '<div class="weather-main">' +
            '<img src="https:' + w.condition_icon + '" alt="' + escapeHtml(w.condition) + '" class="weather-icon">' +
            '<div class="weather-temp">' +
            '<span class="temp-value">' + Math.round(w.temp_c) + '°C</span>' +
            '<span class="temp-feels">Feels like ' + Math.round(w.feelslike_c) + '°C</span>' +
            '</div>' +
            '<div class="weather-info">' +
            '<div class="weather-location">' +
            '<i class="fas fa-map-marker-alt"></i> ' + escapeHtml(w.city) + ', ' + escapeHtml(w.country) +
            '</div>' +
            '<div class="weather-condition">' + escapeHtml(w.condition) + '</div>' +
            '</div>' +
            '</div>' +
            '<div class="weather-details">' +
            '<div class="weather-detail-item"><i class="fas fa-tint"></i><span>Humidity: ' + w.humidity + '%</span></div>' +
            '<div class="weather-detail-item"><i class="fas fa-wind"></i><span>Wind: ' + Math.round(w.wind_kph) + ' km/h</span></div>' +
            '<div class="weather-detail-item"><i class="fas fa-clock"></i><span>Local time: ' + escapeHtml(w.localtime) + '</span></div>' +
            '</div>' +
            '</div>';
    }

    function renderConversionResult(d) {
        return '<div class="conversion-display">' +
            '<div class="conversion-main">' +
            '<span class="conversion-amount">' + d.originalAmount.toLocaleString() + ' ' + d.from + '</span>' +
            '<i class="fas fa-arrow-right conversion-arrow-icon"></i>' +
            '<span class="conversion-result">' + d.convertedAmount.toLocaleString() + ' ' + d.to + '</span>' +
            '</div>' +
            '<div class="conversion-rate">' +
            '<i class="fas fa-info-circle"></i> 1 ' + d.from + ' = ' + d.rate.toFixed(4) + ' ' + d.to +
            '</div></div>';
    }

    // --- Stats ---

    function updateStats(stats) {
        var statValues = document.querySelectorAll('.stat-value');
        if (statValues[0]) statValues[0].textContent = stats.totalTrips;
        if (statValues[1]) statValues[1].textContent = stats.upcomingTrips;
        if (statValues[2]) statValues[2].textContent = stats.pastTrips;
        if (statValues[3]) statValues[3].textContent = '$' + Math.round(stats.totalBudget).toLocaleString();
    }

    function setUserGreeting(username) {
        var welcomeEl = document.getElementById('userGreeting');
        if (welcomeEl) welcomeEl.textContent = username;
        var boldEl = document.getElementById('userGreetingBold');
        if (boldEl) boldEl.textContent = username;
    }

    // --- Utilities ---

    function escapeHtml(str) {
        if (str === null || str === undefined) return '';
        var div = document.createElement('div');
        div.textContent = str;
        return div.innerHTML;
    }

    function truncate(str, maxLength) {
        if (!str) return '';
        if (str.length <= maxLength) return str;
        return str.substring(0, maxLength) + '...';
    }

    // --- Expose globally as window.ui ---
    window.ui = {
        showAlert: showAlert,
        clearAlert: clearAlert,
        showModal: showModal,
        hideModal: hideModal,
        formatDate: formatDate,
        getDuration: getDuration,
        renderTripCard: renderTripCard,
        renderEmptyState: renderEmptyState,
        renderLoading: renderLoading,
        renderWeatherResult: renderWeatherResult,
        renderConversionResult: renderConversionResult,
        updateStats: updateStats,
        setUserGreeting: setUserGreeting,
        escapeHtml: escapeHtml,
        truncate: truncate
    };

})(window);
