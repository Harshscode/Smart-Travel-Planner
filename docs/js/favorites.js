// ============================================================
// favorites.js - Favorites List UI Logic
// ============================================================
// All functions are exposed as window.favorites.*
// ============================================================

(function(window) {
    'use strict';

    // Render a single favorite card
    function renderFavoriteCard(favorite) {
        var dateFormatted = formatDate(favorite.createdAt);

        return '<div class="favorite-card" data-favorite-id="' + favorite.id + '">' +
            '<div class="favorite-icon"><i class="fas fa-heart"></i></div>' +
            '<div class="favorite-content">' +
            '<h3 class="favorite-destination">' +
            '<i class="fas fa-map-marker-alt"></i> ' + escapeHtml(favorite.destination) +
            '</h3>' +
            (favorite.notes ? '<p class="favorite-notes">' + escapeHtml(favorite.notes) + '</p>' : '') +
            '<div class="favorite-meta">' +
            '<span><i class="fas fa-calendar-plus"></i> Added ' + dateFormatted + '</span>' +
            '</div>' +
            '</div>' +
            '<div class="favorite-actions">' +
            '<button class="btn btn-sm btn-outline" onclick="window.favorites.planTrip(\'' + escapeHtml(favorite.destination).replace(/'/g, "\\'") + '\')">' +
            '<i class="fas fa-plane"></i> Plan Trip' +
            '</button>' +
            '<button class="btn btn-sm btn-secondary" onclick="window.favorites.editFavorite(\'' + favorite.id + '\')">' +
            '<i class="fas fa-edit"></i>' +
            '</button>' +
            '<button class="btn btn-sm btn-danger" onclick="window.favorites.deleteFavorite(\'' + favorite.id + '\')">' +
            '<i class="fas fa-trash"></i>' +
            '</button>' +
            '</div>' +
            '</div>';
    }

    // Render all favorites
    function renderFavorites(favorites) {
        var container = document.getElementById('favoritesList');
        if (!container) return;

        if (!favorites || favorites.length === 0) {
            container.innerHTML = '<div class="empty-state">' +
                '<div class="empty-icon"><i class="fas fa-heart"></i></div>' +
                '<h3>No favorites yet</h3>' +
                '<p>Start adding places you\'d love to visit someday!</p>' +
                '<button class="btn btn-primary" onclick="document.getElementById(\'showAddFavoriteBtn\').click()">' +
                '<i class="fas fa-plus"></i> Add Your First Favorite' +
                '</button>' +
                '</div>';
            return;
        }

        var html = '<div class="favorites-grid">';
        favorites.forEach(function(fav) {
            html += renderFavoriteCard(fav);
        });
        html += '</div>';
        container.innerHTML = html;
    }

    // Load all favorites
    async function loadFavorites() {
        var container = document.getElementById('favoritesList');
        if (container) {
            container.innerHTML = '<div class="skeleton-card" style="height:120px;margin-bottom:1rem;"></div>' +
                '<div class="skeleton-card" style="height:120px;margin-bottom:1rem;"></div>';
        }

        var result = await window.apiClient.getFavorites();
        if (result.success) {
            renderFavorites(result.favorites);
        } else {
            if (container) {
                container.innerHTML = '<div class="alert alert-error"><i class="fas fa-exclamation-circle"></i> ' +
                    (result.error || 'Failed to load favorites') + '</div>';
            }
        }
    }

    // Delete a favorite
    async function deleteFavorite(favoriteId) {
        if (!confirm('Remove this place from your favorites?')) return;

        var result = await window.apiClient.deleteFavorite(favoriteId);
        if (result.success) {
            loadFavorites();
        } else {
            document.getElementById('pageAlert').innerHTML =
                '<div class="alert alert-error"><i class="fas fa-exclamation-circle"></i> ' + result.error + '</div>';
        }
    }

    // Plan a trip from a favorite
    function planTrip(destination) {
        window.location.href = 'add-trip.html?destination=' + encodeURIComponent(destination);
    }

    // Edit a favorite
    function editFavorite(favoriteId) {
        var container = document.getElementById('favoritesList');
        var cards = container ? container.querySelectorAll('.favorite-card') : [];
        for (var i = 0; i < cards.length; i++) {
            if (cards[i].dataset.favoriteId === favoriteId) {
                var destEl = cards[i].querySelector('.favorite-destination');
                var notesEl = cards[i].querySelector('.favorite-notes');
                var dest = destEl ? destEl.textContent.replace(/^\s*[\u00a0\s]*/, '').trim() : '';
                var notes = notesEl ? notesEl.textContent.trim() : '';

                document.getElementById('favoriteItemId').value = favoriteId;
                document.getElementById('favoriteDestination').value = dest;
                document.getElementById('favoriteNotes').value = notes;
                document.getElementById('favoriteFormTitle').textContent = 'Edit Favorite Place';
                document.getElementById('favoriteFormCard').classList.remove('hidden');
                break;
            }
        }
    }

    // --- Helpers ---
    function formatDate(dateStr) {
        if (!dateStr) return '';
        try {
            var date = new Date(dateStr);
            return date.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
        } catch (e) {
            return dateStr;
        }
    }

    function escapeHtml(str) {
        if (str === null || str === undefined) return '';
        var div = document.createElement('div');
        div.textContent = str;
        return div.innerHTML;
    }

    // --- Expose globally ---
    window.favorites = {
        loadFavorites: loadFavorites,
        deleteFavorite: deleteFavorite,
        planTrip: planTrip,
        editFavorite: editFavorite
    };

})(window);
