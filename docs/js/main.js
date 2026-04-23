// ============================================================
// main.js - Page Initialization & Event Handlers
// ============================================================
// Updated for Phase 2 to use apiClient instead of localStorage.
// ============================================================

// ============================================================
// GLOBAL: Weather & Currency Tool Functions
// These are called from onclick attributes in HTML,
// so they must be global (not wrapped in an object).
// ============================================================

async function checkWeather() {
    var city = document.getElementById('weatherCity') && document.getElementById('weatherCity').value.trim();
    var resultDiv = document.getElementById('weatherResult');
    if (!resultDiv) return;

    if (!city) {
        ui.showAlert('weatherAlert', 'Please enter a city name.', 'error');
        return;
    }

    resultDiv.innerHTML = ui.renderLoading('Checking weather for ' + city + '...');
    resultDiv.classList.remove('hidden');
    var oldAlert = document.getElementById('weatherAlert');
    if (oldAlert) oldAlert.remove();

    var result = await window.api.checkWeather(city);

    if (!result.success) {
        resultDiv.innerHTML = '';
        ui.showAlert('weatherAlert', result.error, 'error');
        return;
    }

    resultDiv.innerHTML = ui.renderWeatherResult(result.data);
}

async function checkWeatherForTrip(destination) {
    var resultDiv = document.getElementById('weatherResult');
    var input = document.getElementById('weatherCity');
    if (!resultDiv) return;

    if (input) input.value = destination;
    resultDiv.innerHTML = ui.renderLoading('Checking weather for ' + destination + '...');
    resultDiv.classList.remove('hidden');
    var oldAlert = document.getElementById('weatherAlert');
    if (oldAlert) oldAlert.remove();

    var result = await window.api.checkWeather(destination);

    if (!result.success) {
        resultDiv.innerHTML = '';
        ui.showAlert('weatherAlert', result.error, 'error');
        return;
    }

    resultDiv.innerHTML = ui.renderWeatherResult(result.data);
    if (resultDiv.scrollIntoView) resultDiv.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
}

async function convertCurrency() {
    var amount = document.getElementById('convertAmount') && document.getElementById('convertAmount').value;
    var from = document.getElementById('convertFrom') && document.getElementById('convertFrom').value;
    var to = document.getElementById('convertTo') && document.getElementById('convertTo').value;
    var resultDiv = document.getElementById('conversionResult');
    if (!resultDiv) return;

    var numAmount = parseFloat(amount);
    if (!amount || isNaN(numAmount) || numAmount <= 0) {
        ui.showAlert('conversionAlert', 'Please enter a valid amount greater than 0.', 'error');
        return;
    }

    resultDiv.innerHTML = ui.renderLoading('Converting...');
    resultDiv.classList.remove('hidden');
    var oldAlert = document.getElementById('conversionAlert');
    if (oldAlert) oldAlert.remove();

    var result = await window.api.convertCurrency(from, to, amount);

    if (!result.success) {
        resultDiv.innerHTML = '';
        ui.showAlert('conversionAlert', result.error, 'error');
        return;
    }

    resultDiv.innerHTML = ui.renderConversionResult(result.data);
}

// ============================================================
// DELETE MODAL
// ============================================================

var allTrips = [];

function confirmDelete(tripId, destination) {
    var modal = document.getElementById('deleteModal');
    var text = document.getElementById('deleteModalText');
    var confirmBtn = document.getElementById('confirmDeleteBtn');

    if (!modal || !text || !confirmBtn) return;

    text.textContent = 'Are you sure you want to delete your trip to "' + destination + '"? This action cannot be undone.';
    confirmBtn.href = '#';
    confirmBtn.onclick = function() { handleDelete(tripId); };
    modal.classList.remove('hidden');
}

async function handleDelete(tripId) {
    var confirmBtn = document.getElementById('confirmDeleteBtn');
    if (confirmBtn) {
        confirmBtn.disabled = true;
        confirmBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Deleting...';
    }

    var result = await window.trips.deleteTrip(tripId);
    if (result.success) {
        ui.hideModal('deleteModal');
        loadTrips();
    } else {
        ui.showAlert('deleteAlert', result.error, 'error');
        if (confirmBtn) {
            confirmBtn.disabled = false;
            confirmBtn.innerHTML = '<i class="fas fa-trash"></i> Yes, Delete';
        }
    }
}

function closeDeleteModal() {
    ui.hideModal('deleteModal');
}

document.addEventListener('click', function(e) {
    var modal = document.getElementById('deleteModal');
    if (modal && e.target === modal) {
        closeDeleteModal();
    }
});

// ============================================================
// DASHBOARD PAGE
// ============================================================

async function loadTrips() {
    var tripsContainer = document.getElementById('tripsContainer');
    if (!tripsContainer) return;

    // Show skeleton loading
    tripsContainer.innerHTML = ui.renderSkeletonTripCards(3);

    var result = await window.trips.getMyTrips();

    if (!result.success) {
        tripsContainer.innerHTML = ui.renderErrorState(result.error || 'Failed to load trips.');
        return;
    }

    allTrips = result.trips || [];
    var stats = window.trips.calculateStats(allTrips);
    ui.updateStats(stats);

    // Update filter count badges
    var total = allTrips.length;
    var upcoming = stats.upcomingTrips;
    var past = stats.pastTrips;
    var countAllEl = document.getElementById('countAll');
    var countUpcomingEl = document.getElementById('countUpcoming');
    var countPastEl = document.getElementById('countPast');
    if (countAllEl) countAllEl.textContent = total;
    if (countUpcomingEl) countUpcomingEl.textContent = upcoming;
    if (countPastEl) countPastEl.textContent = past;

    // Apply current filter and sort
    var activeFilter = document.querySelector('.filter-tab.active');
    var filter = activeFilter ? activeFilter.dataset.filter : 'all';
    var sortSelect = document.getElementById('sortSelect');
    var sortKey = sortSelect ? sortSelect.value : 'date-asc';

    filterAndRenderTrips(filter, sortKey);
}

function filterAndRenderTrips(filter, sortKey) {
    var tripsContainer = document.getElementById('tripsContainer');
    if (!tripsContainer) return;

    var filtered = allTrips.filter(function(trip) {
        if (filter === 'upcoming') return window.trips.isUpcoming(trip.startDate);
        if (filter === 'past') return window.trips.isPast(trip.endDate);
        return true;
    });

    var sorted = window.trips.sortTrips(filtered, sortKey);

    if (sorted.length === 0) {
        tripsContainer.innerHTML = filter === 'all'
            ? ui.renderEmptyState()
            : '<div class="empty-state">' +
              '<div class="empty-icon"><i class="fas fa-filter"></i></div>' +
              '<h3>No ' + filter + ' trips</h3>' +
              '<p>You don\'t have any ' + filter + ' trips at the moment.</p>' +
              '</div>';
        return;
    }

    tripsContainer.innerHTML = sorted.map(function(trip) { return ui.renderTripCard(trip); }).join('');

    // Announce to screen readers
    var liveRegion = document.getElementById('liveRegion');
    if (liveRegion) liveRegion.textContent = sorted.length + ' ' + filter + ' trips displayed.';
}

async function initDashboard() {
    // Check session with backend
    var sessionResult = await window.apiClient.getCurrentUser();

    if (!sessionResult.success) {
        window.location.href = 'login.html';
        return;
    }

    // Set user in apiClient cache
    window.apiClient.setCurrentUser(sessionResult.user);

    // Set user greeting
    if (sessionResult.user) {
        ui.setUserGreeting(sessionResult.user.name);
    }

    // Wire up keyboard shortcuts
    var weatherInput = document.getElementById('weatherCity');
    if (weatherInput) {
        weatherInput.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                e.preventDefault();
                checkWeather();
            }
        });
    }

    var amountInput = document.getElementById('convertAmount');
    if (amountInput) {
        amountInput.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                e.preventDefault();
                convertCurrency();
            }
        });
    }

    // Logout button
    var logoutBtn = document.getElementById('logoutBtn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', function(e) {
            e.preventDefault();
            logoutBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Logging out...';
            window.auth.logout().then(function() {
                window.location.href = 'login.html';
            });
        });
    }

    // Wire up dark mode toggle
    var darkToggle = document.getElementById('darkModeToggle');
    if (darkToggle) {
        darkToggle.addEventListener('click', function() {
            document.body.classList.toggle('dark-mode');
            var isDark = document.body.classList.contains('dark-mode');
            darkToggle.innerHTML = isDark ? '<i class="fas fa-sun"></i>' : '<i class="fas fa-moon"></i>';
        });
        // Sync icon if dark mode is already active
        if (document.body.classList.contains('dark-mode')) {
            darkToggle.innerHTML = '<i class="fas fa-sun"></i>';
        }
    }

    // Load data
    loadTrips();

    // Filter tabs
    document.querySelectorAll('.filter-tab').forEach(function(tab) {
        tab.addEventListener('click', function() {
            document.querySelectorAll('.filter-tab').forEach(function(t) { t.classList.remove('active'); });
            tab.classList.add('active');
            var sortSelect = document.getElementById('sortSelect');
            filterAndRenderTrips(tab.dataset.filter, sortSelect ? sortSelect.value : 'date-asc');
        });
    });

    // Sort dropdown
    var sortSelect = document.getElementById('sortSelect');
    if (sortSelect) {
        sortSelect.addEventListener('change', function() {
            var activeTab = document.querySelector('.filter-tab.active');
            filterAndRenderTrips(activeTab ? activeTab.dataset.filter : 'all', sortSelect.value);
        });
    }
}

// ============================================================
// REGISTER PAGE
// ============================================================

async function initRegister() {
    // Check if already logged in
    var sessionResult = await window.apiClient.getCurrentUser();
    if (sessionResult.success) {
        window.location.href = 'dashboard.html';
        return;
    }

    var form = document.getElementById('registerForm');
    if (!form) return;

    // Password visibility toggles
    setupPasswordToggle('password', 'password-icon');
    setupPasswordToggle('confirmPassword', 'confirmPassword-icon');

    form.addEventListener('submit', function(e) {
        e.preventDefault();

        var name = (document.getElementById('username') && document.getElementById('username').value) || '';
        var email = (document.getElementById('email') && document.getElementById('email').value) || '';
        var password = (document.getElementById('password') && document.getElementById('password').value) || '';
        var confirmPassword = (document.getElementById('confirmPassword') && document.getElementById('confirmPassword').value) || '';

        var validationError = window.auth.validateRegistration(name, email, password, confirmPassword);
        if (validationError) {
            ui.showAlert('formAlert', validationError, 'error');
            return;
        }

        var submitBtn = form.querySelector('button[type="submit"]');
        submitBtn.disabled = true;
        submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Creating account...';

        window.apiClient.register(name, email, password, confirmPassword).then(function(result) {
            if (!result.success) {
                ui.showAlert('formAlert', result.error, 'error');
                submitBtn.disabled = false;
                submitBtn.innerHTML = '<i class="fas fa-user-plus"></i> Create Account';
                return;
            }
            // Success — redirect to dashboard
            window.location.href = 'dashboard.html';
        });
    });
}

// ============================================================
// LOGIN PAGE
// ============================================================

async function initLogin() {
    // Check if already logged in
    var sessionResult = await window.apiClient.getCurrentUser();
    if (sessionResult.success) {
        window.location.href = 'dashboard.html';
        return;
    }

    var form = document.getElementById('loginForm');
    if (!form) return;

    // Password visibility toggle
    setupPasswordToggle('password', 'password-icon');

    form.addEventListener('submit', function(e) {
        e.preventDefault();

        var email = (document.getElementById('email') && document.getElementById('email').value) || '';
        var password = (document.getElementById('password') && document.getElementById('password').value) || '';

        var validationError = window.auth.validateLogin(email, password);
        if (validationError) {
            ui.showAlert('formAlert', validationError, 'error');
            return;
        }

        var submitBtn = form.querySelector('button[type="submit"]');
        submitBtn.disabled = true;
        submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Logging in...';

        window.apiClient.login(email, password).then(function(result) {
            if (!result.success) {
                ui.showAlert('formAlert', result.error, 'error');
                submitBtn.disabled = false;
                submitBtn.innerHTML = '<i class="fas fa-sign-in-alt"></i> Log In';
                return;
            }
            // Success — redirect to dashboard
            window.location.href = 'dashboard.html';
        });
    });
}

// ============================================================
// ADD TRIP PAGE (with inline itinerary planning)
// ============================================================

var planningItems = [];

function renderPlanningDays() {
    var container = document.getElementById('planningDays');
    if (!container) return;

    var startDate = document.getElementById('startDate') ? document.getElementById('startDate').value : '';
    var endDate = document.getElementById('endDate') ? document.getElementById('endDate').value : '';

    if (!startDate || !endDate) {
        container.innerHTML = '<div class="planning-day-empty" style="padding:1rem;text-align:center;color:#9ca3af;font-size:0.9rem;">' +
            '<i class="fas fa-info-circle"></i> Enter start and end dates above to start planning your itinerary.</div>';
        return;
    }

    var start = new Date(startDate + 'T00:00:00');
    var end = new Date(endDate + 'T00:00:00');
    var days = Math.ceil((end - start) / (1000 * 60 * 60 * 24)) + 1;

    if (days < 1 || days > 60) {
        container.innerHTML = '<div class="alert alert-error"><i class="fas fa-exclamation-circle"></i> Invalid date range</div>';
        return;
    }

    container.innerHTML = '';
    for (var i = 0; i < days; i++) {
        var dayDate = new Date(start);
        dayDate.setDate(start.getDate() + i);
        var dateStr = dayDate.toISOString().split('T')[0];
        var dayLabel = formatDateForDisplay(dateStr);
        var dayItems = planningItems.filter(function(it) { return it.date === dateStr; });

        var dayEl = document.createElement('div');
        dayEl.className = 'planning-day';
        dayEl.dataset.date = dateStr;

        var itemsHtml = '';
        if (dayItems.length === 0) {
            itemsHtml = '<div class="planning-day-empty">No activities yet</div>';
        } else {
            dayItems.forEach(function(item) {
                var timeStr = item.time ? item.time.substring(0, 5) : '';
                var timeDisplay = timeStr ? formatTime12(timeStr) : '';
                var removeIdx = planningItems.indexOf(item);
                itemsHtml += '<div class="planning-item-mini">' +
                    '<span class="mini-time">' + timeDisplay + '</span>' +
                    '<span class="mini-activity">' + escapeHtml(item.activity) + '</span>' +
                    (item.location ? '<span class="mini-loc">\uD83D\uDCCD ' + escapeHtml(item.location) + '</span>' : '') +
                    '<button type="button" class="mini-remove" data-idx="' + removeIdx + '">\u2715</button>' +
                    '</div>';
            });
        }

        dayEl.innerHTML =
            '<div class="planning-day-header">' +
            '<span class="day-date-label">Day ' + (i + 1) + ' \u2014 ' + dayLabel + '</span>' +
            '<span class="day-item-count">' + dayItems.length + ' activit' + (dayItems.length !== 1 ? 'ies' : 'y') + '</span>' +
            '</div>' +
            '<div class="planning-day-items">' + itemsHtml + '</div>' +
            '<div class="planning-day-footer">' +
            '<button type="button" class="btn btn-xs btn-secondary add-mini-activity-btn">' +
            '<i class="fas fa-plus"></i> Add Activity</button>' +
            '</div>' +
            '<div class="mini-form hidden" style="display:none;">' +
            '<input type="text" class="mini-activity-input" placeholder="Activity name *" style="padding:0.4rem;border:1px solid var(--border);border-radius:0.3rem;width:100%;">' +
            '<div class="mini-form-row">' +
            '<input type="time" class="mini-time-input" style="padding:0.4rem;border:1px solid var(--border);border-radius:0.3rem;">' +
            '<input type="text" class="mini-location-input" placeholder="Location" style="padding:0.4rem;border:1px solid var(--border);border-radius:0.3rem;">' +
            '</div>' +
            '<select class="mini-category-input" style="padding:0.4rem;border:1px solid var(--border);border-radius:0.3rem;width:100%;">' +
            '<option value="sightseeing">Sightseeing</option>' +
            '<option value="food">Food & Dining</option>' +
            '<option value="transport">Transport</option>' +
            '<option value="lodging">Lodging</option>' +
            '<option value="other">Other</option>' +
            '</select>' +
            '<input type="text" class="mini-notes-input" placeholder="Notes (optional)" style="padding:0.4rem;border:1px solid var(--border);border-radius:0.3rem;width:100%;">' +
            '<div class="mini-form-actions">' +
            '<button type="button" class="btn btn-xs btn-outline cancel-mini-form-btn">Cancel</button>' +
            '<button type="button" class="btn btn-xs btn-primary save-mini-form-btn"><i class="fas fa-check"></i> Add</button>' +
            '</div>' +
            '</div>';

        container.appendChild(dayEl);
    }

    // Wire up event listeners
    container.querySelectorAll('.add-mini-activity-btn').forEach(function(btn) {
        btn.addEventListener('click', function() {
            var dayEl = btn.closest('.planning-day');
            var miniForm = dayEl.querySelector('.mini-form');
            miniForm.classList.remove('hidden');
            miniForm.style.display = 'flex';
            miniForm.style.flexDirection = 'column';
            miniForm.style.gap = '0.5rem';
            miniForm.querySelector('.mini-activity-input').value = '';
            miniForm.querySelector('.mini-time-input').value = '';
            miniForm.querySelector('.mini-location-input').value = '';
            miniForm.querySelector('.mini-notes-input').value = '';
            miniForm.querySelector('.mini-activity-input').focus();
            btn.classList.add('hidden');
        });
    });

    container.querySelectorAll('.cancel-mini-form-btn').forEach(function(btn) {
        btn.addEventListener('click', function() {
            var dayEl = btn.closest('.planning-day');
            var miniForm = dayEl.querySelector('.mini-form');
            miniForm.classList.add('hidden');
            miniForm.style.display = 'none';
            dayEl.querySelector('.add-mini-activity-btn').classList.remove('hidden');
        });
    });

    container.querySelectorAll('.save-mini-form-btn').forEach(function(btn) {
        btn.addEventListener('click', function() {
            var dayEl = btn.closest('.planning-day');
            var miniForm = dayEl.querySelector('.mini-form');
            var activity = miniForm.querySelector('.mini-activity-input').value.trim();
            if (!activity) {
                miniForm.querySelector('.mini-activity-input').focus();
                return;
            }
            var dateStr = dayEl.dataset.date;
            planningItems.push({
                date: dateStr,
                time: miniForm.querySelector('.mini-time-input').value,
                activity: activity,
                location: miniForm.querySelector('.mini-location-input').value.trim(),
                category: miniForm.querySelector('.mini-category-input').value,
                notes: miniForm.querySelector('.mini-notes-input').value.trim()
            });
            miniForm.classList.add('hidden');
            miniForm.style.display = 'none';
            dayEl.querySelector('.add-mini-activity-btn').classList.remove('hidden');
            renderPlanningDays();
        });
    });

    container.querySelectorAll('.mini-remove').forEach(function(btn) {
        btn.addEventListener('click', function() {
            var idx = parseInt(btn.dataset.idx, 10);
            planningItems.splice(idx, 1);
            renderPlanningDays();
        });
    });
}

function formatDateForDisplay(dateStr) {
    if (!dateStr) return '';
    try {
        var d = new Date(dateStr + 'T00:00:00');
        return d.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
    } catch (e) { return dateStr; }
}

function formatTime12(timeStr) {
    if (!timeStr) return '';
    try {
        var parts = timeStr.split(':');
        var hours = parseInt(parts[0], 10);
        var minutes = parts[1] || '00';
        var ampm = hours >= 12 ? 'PM' : 'AM';
        hours = hours % 12 || 12;
        return hours + ':' + minutes + ' ' + ampm;
    } catch (e) { return timeStr; }
}

function escapeHtml(str) {
    if (!str) return '';
    var div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
}

function setupDateInputsForPlanning() {
    var startInput = document.getElementById('startDate');
    var endInput = document.getElementById('endDate');
    var today = new Date().toISOString().split('T')[0];

    if (startInput) {
        startInput.min = today;
        startInput.addEventListener('change', function() {
            if (endInput) endInput.min = startInput.value;
            renderPlanningDays();
        });
    }
    if (endInput) {
        endInput.min = today;
        endInput.addEventListener('change', function() {
            renderPlanningDays();
        });
    }
}

async function initAddTrip() {
    var sessionResult = await window.apiClient.getCurrentUser();
    if (!sessionResult.success) {
        window.location.href = 'login.html';
        return;
    }
    window.apiClient.setCurrentUser(sessionResult.user);
    document.getElementById('userGreeting').textContent = sessionResult.user.name;

    var logoutBtn = document.getElementById('logoutBtn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', function(e) {
            e.preventDefault();
            logoutBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Logging out...';
            window.auth.logout().then(function() {
                window.location.href = 'login.html';
            });
        });
    }

    // Setup date inputs and planning section
    setupDateInputsForPlanning();
    renderPlanningDays();

    var form = document.getElementById('tripForm');
    if (!form) return;

    form.addEventListener('submit', async function(e) {
        e.preventDefault();

        var dest = (document.getElementById('destination') && document.getElementById('destination').value) || ''.trim();
        var sDate = (document.getElementById('startDate') && document.getElementById('startDate').value) || '';
        var eDate = (document.getElementById('endDate') && document.getElementById('endDate').value) || '';
        var budget = (document.getElementById('budget') && document.getElementById('budget').value) || '';
        var currency = (document.getElementById('currency') && document.getElementById('currency').value) || 'USD';
        var notes = (document.getElementById('notes') && document.getElementById('notes').value) || '';

        if (!dest) { ui.showAlert('formAlert', 'Destination is required', 'error'); return; }
        if (!sDate || !eDate) { ui.showAlert('formAlert', 'Both dates are required', 'error'); return; }
        if (new Date(eDate) < new Date(sDate)) { ui.showAlert('formAlert', 'End date must be same or after start date', 'error'); return; }

        var saveBtn = document.getElementById('saveTripBtn');
        saveBtn.disabled = true;
        saveBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Saving...';

        var tripData = {
            destination: dest,
            startDate: sDate,
            endDate: eDate,
            budget: parseFloat(budget) || 0,
            currency: currency,
            notes: notes,
            _isNew: true
        };

        var result;
        if (planningItems.length > 0) {
            result = await window.apiClient.createTripWithItinerary(tripData, planningItems);
        } else {
            result = await window.apiClient.createTrip(tripData);
        }

        if (result.success && result.trip) {
            var tripId = result.trip._id || result.trip.id;
            window.location.href = 'trip-details.html?id=' + tripId;
        } else {
            var alertEl = document.getElementById('formAlert');
            if (alertEl) {
                alertEl.innerHTML = '<div class="alert alert-error"><i class="fas fa-exclamation-circle"></i> ' + (result.error || 'Failed to create trip') + '</div>';
            }
            saveBtn.disabled = false;
            saveBtn.innerHTML = '<i class="fas fa-save"></i> Save Trip';
        }
    });
}

// ============================================================
// EDIT TRIP PAGE
// ============================================================

async function initEditTrip() {
    // Auth check
    var sessionResult = await window.apiClient.getCurrentUser();
    if (!sessionResult.success) {
        window.location.href = 'login.html';
        return;
    }
    window.apiClient.setCurrentUser(sessionResult.user);

    // Set minimum dates
    setupDateInputs();

    // Wire up logout
    wireLogoutButton();

    // Get trip ID from URL parameter
    var urlParams = new URLSearchParams(window.location.search);
    var tripId = urlParams.get('id');

    if (!tripId) {
        window.location.href = 'dashboard.html';
        return;
    }

    // Load the trip
    var tripResult = await window.apiClient.getTripById(tripId);

    if (!tripResult.success || !tripResult.trip) {
        window.location.href = 'dashboard.html';
        return;
    }

    var trip = tripResult.trip;

    // Format dates for input fields
    var formatDate = function(date) {
        if (!date) return '';
        var d = new Date(date);
        return d.toISOString().split('T')[0];
    };

    // Fill in the form with existing data
    var destInput = document.getElementById('destination');
    var startInput = document.getElementById('startDate');
    var endInput = document.getElementById('endDate');
    var budgetInput = document.getElementById('budget');
    var currencySelect = document.getElementById('currency');
    var notesInput = document.getElementById('notes');
    var headingDest = document.getElementById('headingDestination');

    if (destInput) destInput.value = trip.destination || '';
    if (startInput) startInput.value = formatDate(trip.startDate);
    if (endInput) endInput.value = formatDate(trip.endDate);
    if (budgetInput) budgetInput.value = trip.budget || 0;
    if (currencySelect) currencySelect.value = trip.currency || 'USD';
    if (notesInput) notesInput.value = trip.notes || '';
    if (headingDest) headingDest.textContent = trip.destination || '';

    // Set minimum end date based on start date
    if (startInput && endInput) {
        endInput.setAttribute('min', startInput.value);
    }

    var form = document.getElementById('tripForm');
    if (!form) return;

    form.addEventListener('submit', function(e) {
        e.preventDefault();

        var updateData = getTripFormData();
        var validationError = window.trips.validateTrip(updateData);
        if (validationError) {
            ui.showAlert('formAlert', validationError, 'error');
            return;
        }

        window.apiClient.updateTrip(tripId, updateData).then(function(result) {
            if (!result.success) {
                ui.showAlert('formAlert', result.error, 'error');
                return;
            }
            // Success — redirect to dashboard
            window.location.href = 'dashboard.html';
        });
    });
}

// ============================================================
// SHARED HELPERS
// ============================================================

function getTripFormData() {
    return {
        destination: (document.getElementById('destination') && document.getElementById('destination').value) || '',
        startDate: (document.getElementById('startDate') && document.getElementById('startDate').value) || '',
        endDate: (document.getElementById('endDate') && document.getElementById('endDate').value) || '',
        budget: (document.getElementById('budget') && document.getElementById('budget').value) || '0',
        currency: (document.getElementById('currency') && document.getElementById('currency').value) || 'USD',
        notes: (document.getElementById('notes') && document.getElementById('notes').value) || ''
    };
}

function setupDateInputs() {
    var today = new Date().toISOString().split('T')[0];
    var startInput = document.getElementById('startDate');
    var endInput = document.getElementById('endDate');

    if (startInput) {
        startInput.setAttribute('min', today);
        startInput.addEventListener('change', function() {
            if (endInput) {
                endInput.setAttribute('min', this.value);
            }
        });
    }
}

function wireLogoutButton() {
    var logoutBtn = document.getElementById('logoutBtn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', function(e) {
            e.preventDefault();
            logoutBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Logging out...';
            window.auth.logout().then(function() {
                window.location.href = 'login.html';
            });
        });
    }
}

function setupPasswordToggle(inputId, iconId) {
    var input = document.getElementById(inputId);
    var icon = document.getElementById(iconId);
    var wrapper = input && input.parentElement;
    var btn = wrapper && wrapper.querySelector('.toggle-password');

    if (!input || !btn) return;

    btn.addEventListener('click', function() {
        if (input.type === 'password') {
            input.type = 'text';
            if (icon) icon.className = 'fas fa-eye-slash';
        } else {
            input.type = 'password';
            if (icon) icon.className = 'fas fa-eye';
        }
    });
}

// ============================================================
// PAGE INITIALIZATION
// ============================================================

document.addEventListener('DOMContentLoaded', function() {
    var body = document.body;

    if (body.classList.contains('dashboard-body')) {
        initDashboard();
    } else if (body.classList.contains('register-body')) {
        initRegister();
    } else if (body.classList.contains('login-body')) {
        initLogin();
    } else if (body.classList.contains('add-trip-body')) {
        initAddTrip();
    } else if (body.classList.contains('edit-trip-body')) {
        initEditTrip();
    }
});
