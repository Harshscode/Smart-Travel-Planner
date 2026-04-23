// ============================================================
// itinerary.js - Itinerary Planner UI Logic
// ============================================================
// All functions are exposed as window.itinerary.*
// ============================================================

(function(window) {
    'use strict';

    var CATEGORY_ICONS = {
        sightseeing: 'fa-camera',
        food: 'fa-utensils',
        transport: 'fa-bus',
        lodging: 'fa-bed',
        other: 'fa-star'
    };

    var CATEGORY_LABELS = {
        sightseeing: 'Sightseeing',
        food: 'Food & Dining',
        transport: 'Transport',
        lodging: 'Lodging',
        other: 'Other'
    };

    // Group itinerary items by date
    function groupByDate(items) {
        var groups = {};
        items.forEach(function(item) {
            var date = item.date || 'unknown';
            if (!groups[date]) groups[date] = [];
            groups[date].push(item);
        });
        return groups;
    }

    // Render a single itinerary item
    function renderItem(item) {
        var icon = CATEGORY_ICONS[item.category] || CATEGORY_ICONS.other;
        var category = CATEGORY_LABELS[item.category] || 'Other';
        var timeStr = item.time ? formatTime(item.time) : '';
        var itemId = item.id || item._id;
        // Store full item data for edit-in-place
        var itemJson = JSON.stringify(item).replace(/'/g, "&#39;");

        return '<div class="itinerary-item" data-item-id="' + itemId + '" data-item=\'' + itemJson + '\'>' +
            '<div class="itinerary-item-icon">' +
            '<i class="fas ' + icon + '"></i>' +
            '</div>' +
            '<div class="itinerary-item-content">' +
            '<div class="itinerary-item-header">' +
            '<span class="itinerary-activity">' + escapeHtml(item.activity) + '</span>' +
            (item.time ? '<span class="itinerary-time"><i class="fas fa-clock"></i> ' + timeStr + '</span>' : '') +
            '</div>' +
            (item.location ? '<div class="itinerary-location"><i class="fas fa-map-pin"></i> ' + escapeHtml(item.location) + '</div>' : '') +
            '<div class="itinerary-item-meta">' +
            '<span class="itinerary-category"><i class="fas ' + icon + '"></i> ' + category + '</span>' +
            (item.notes ? '<span class="itinerary-notes"><i class="fas fa-sticky-note"></i> ' + escapeHtml(truncate(item.notes, 60)) + '</span>' : '') +
            '</div>' +
            '</div>' +
            '<div class="itinerary-item-actions">' +
            '<button class="btn btn-xs btn-secondary" onclick="window.itinerary.editItem(\'' + itemId + '\')">' +
            '<i class="fas fa-edit"></i>' +
            '</button>' +
            '<button class="btn btn-xs btn-danger" onclick="window.itinerary.deleteItem(\'' + itemId + '\')">' +
            '<i class="fas fa-trash"></i>' +
            '</button>' +
            '</div>' +
            '</div>';
    }

    // Render all itinerary grouped by date
    function renderList(items) {
        var container = document.getElementById('itineraryList');
        if (!container) return;

        if (!items || items.length === 0) {
            container.innerHTML = '<div class="empty-state-inline">' +
                '<i class="fas fa-calendar-times"></i>' +
                '<p>No activities planned yet. Click "Add Activity" to start planning!</p>' +
                '</div>';
            return;
        }

        var groups = groupByDate(items);
        var html = '';
        var dates = Object.keys(groups).sort();

        dates.forEach(function(date) {
            var dateItems = groups[date];
            var formattedDate = formatDateDisplay(date);
            html += '<div class="itinerary-day">' +
                '<div class="itinerary-day-header">' +
                '<i class="fas fa-calendar-day"></i> ' + formattedDate +
                '<span class="itinerary-day-count">' + dateItems.length + ' activit' + (dateItems.length !== 1 ? 'ies' : 'y') + '</span>' +
                '</div>' +
                '<div class="itinerary-items">';
            dateItems.forEach(function(item) {
                html += renderItem(item);
            });
            html += '</div></div>';
        });

        container.innerHTML = html;
    }

    // Load itinerary for a trip
    async function loadItinerary(tripId) {
        var result = await window.apiClient.getItinerary(tripId);
        if (result.success) {
            renderList(result.items);
        } else {
            var container = document.getElementById('itineraryList');
            if (container) {
                container.innerHTML = '<div class="alert alert-error"><i class="fas fa-exclamation-circle"></i> ' + (result.error || 'Failed to load itinerary') + '</div>';
            }
        }
    }

    // Edit an itinerary item
    function editItem(itemId) {
        var container = document.getElementById('itineraryList');
        var itemEl = container && container.querySelector('[data-item-id="' + itemId + '"]');
        if (!itemEl) return;

        var formCard = document.getElementById('itineraryFormCard');
        if (!formCard) return;

        // Read item data stored in data-item attribute (set during render)
        var itemData;
        try {
            itemData = JSON.parse(itemEl.getAttribute('data-item'));
        } catch (e) {
            return;
        }

        // Pre-fill form fields
        document.getElementById('itineraryItemId').value = itemData.id || itemData._id || itemId;
        document.getElementById('itinDate').value = itemData.date || '';
        document.getElementById('itinTime').value = itemData.time || '';
        document.getElementById('itinActivity').value = itemData.activity || '';
        document.getElementById('itinLocation').value = itemData.location || '';
        document.getElementById('itinCategory').value = itemData.category || 'other';
        document.getElementById('itinNotes').value = itemData.notes || '';

        document.getElementById('itineraryFormTitle').textContent = 'Edit Activity';
        formCard.classList.remove('hidden');

        // Scroll to form
        formCard.scrollIntoView({ behavior: 'smooth', block: 'top' });
    }

    // Delete an itinerary item
    async function deleteItem(itemId) {
        if (!confirm('Are you sure you want to delete this activity?')) return;

        var result = await window.apiClient.deleteItineraryItem(itemId);
        if (result.success) {
            // Reload - get trip ID from URL
            var urlParams = new URLSearchParams(window.location.search);
            var tripId = urlParams.get('id');
            if (tripId) loadItinerary(tripId);
        } else {
            document.getElementById('itineraryAlert').innerHTML =
                '<div class="alert alert-error"><i class="fas fa-exclamation-circle"></i> ' + result.error + '</div>';
        }
    }

    // --- Helpers ---
    function formatDateDisplay(dateStr) {
        if (!dateStr || dateStr === 'unknown') return 'Unknown Date';
        try {
            var date = new Date(dateStr + 'T00:00:00');
            return date.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
        } catch (e) {
            return dateStr;
        }
    }

    function formatTime(timeStr) {
        if (!timeStr) return '';
        try {
            var parts = timeStr.split(':');
            var hours = parseInt(parts[0]);
            var minutes = parts[1] || '00';
            var ampm = hours >= 12 ? 'PM' : 'AM';
            hours = hours % 12 || 12;
            return hours + ':' + minutes + ' ' + ampm;
        } catch (e) {
            return timeStr;
        }
    }

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

    // Generate shareable plain-text itinerary
    function generateShareText(trip, items) {
        if (!items || items.length === 0) return '';

        var lines = [];
        var dest = trip.destination || 'My Trip';
        var start = trip.startDate ? formatDateDisplay(trip.startDate.split('T')[0]) : '';
        var end = trip.endDate ? formatDateDisplay(trip.endDate.split('T')[0]) : '';
        lines.push('\uD83D\uDDFA\uFE0F  ' + dest + ' — ' + start + ' to ' + end);
        lines.push('');

        var groups = groupByDate(items);
        var dates = Object.keys(groups).sort();

        dates.forEach(function(date) {
            lines.push('\uD83D\uDCC5 ' + formatDateDisplay(date));
            groups[date].forEach(function(item) {
                var timeStr = item.time ? '\uD83D\uDD50 ' + formatTime(item.time) + ' — ' : '';
                var locStr = item.location ? ' \uD83D\uDCCD ' + item.location : '';
                lines.push('  \u2022 ' + timeStr + item.activity + locStr);
                if (item.notes) {
                    lines.push('    \uD83D\uDCCC ' + item.notes);
                }
            });
            lines.push('');
        });

        lines.push('Planned with Smart Travel Planner \uD83C\uDF34');
        return lines.join('\n');
    }

    // --- Expose globally ---
    window.itinerary = {
        loadItinerary: loadItinerary,
        editItem: editItem,
        deleteItem: deleteItem,
        groupByDate: groupByDate,
        generateShareText: generateShareText
    };

})(window);
