// ============================================================
// main.js - Page Initialization & Event Handlers
// ============================================================
// This file initializes each page, wires up event listeners,
// and calls the appropriate functions from storage.js, auth.js,
// trips.js, api.js, and ui.js.
// ============================================================

// ============================================================
// GLOBAL: Weather & Currency Tool Functions
// These are called from onclick attributes in HTML,
// so they must be global (not wrapped in an object).
// ============================================================

/**
 * Check weather for a city from the search input field.
 */
async function checkWeather() {
    const city = document.getElementById('weatherCity')?.value.trim();
    const resultDiv = document.getElementById('weatherResult');
    if (!resultDiv) return;

    if (!city) {
        ui.showAlert('weatherAlert', 'Please enter a city name.', 'error');
        return;
    }

    resultDiv.innerHTML = ui.renderLoading(`Checking weather for ${city}...`);
    resultDiv.classList.remove('hidden');
    document.getElementById('weatherAlert')?.remove();

    const result = await api.checkWeather(city);

    if (!result.success) {
        resultDiv.innerHTML = '';
        ui.showAlert('weatherAlert', result.error, 'error');
        return;
    }

    resultDiv.innerHTML = ui.renderWeatherResult(result.data);
}

/**
 * Check weather for a trip destination (called from trip card button).
 * @param {string} destination - The trip destination
 */
async function checkWeatherForTrip(destination) {
    const resultDiv = document.getElementById('weatherResult');
    const input = document.getElementById('weatherCity');
    if (!resultDiv) return;

    if (input) input.value = destination;
    resultDiv.innerHTML = ui.renderLoading(`Checking weather for ${destination}...`);
    resultDiv.classList.remove('hidden');
    document.getElementById('weatherAlert')?.remove();

    const result = await api.checkWeather(destination);

    if (!result.success) {
        resultDiv.innerHTML = '';
        ui.showAlert('weatherAlert', result.error, 'error');
        return;
    }

    resultDiv.innerHTML = ui.renderWeatherResult(result.data);
    resultDiv.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
}

/**
 * Convert currency between two selected currencies.
 */
async function convertCurrency() {
    const amount = document.getElementById('convertAmount')?.value;
    const from = document.getElementById('convertFrom')?.value;
    const to = document.getElementById('convertTo')?.value;
    const resultDiv = document.getElementById('conversionResult');
    if (!resultDiv) return;

    const numAmount = parseFloat(amount);
    if (!amount || isNaN(numAmount) || numAmount <= 0) {
        ui.showAlert('conversionAlert', 'Please enter a valid amount greater than 0.', 'error');
        return;
    }

    resultDiv.innerHTML = ui.renderLoading('Converting...');
    resultDiv.classList.remove('hidden');
    document.getElementById('conversionAlert')?.remove();

    const result = await api.convertCurrency(from, to, amount);

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

/**
 * Show the delete confirmation modal.
 * @param {string} tripId - The trip ID to delete
 * @param {string} destination - The trip destination for display
 */
function confirmDelete(tripId, destination) {
    const modal = document.getElementById('deleteModal');
    const text = document.getElementById('deleteModalText');
    const confirmBtn = document.getElementById('confirmDeleteBtn');

    if (!modal || !text || !confirmBtn) return;

    text.textContent = `Are you sure you want to delete your trip to "${destination}"? This action cannot be undone.`;
    confirmBtn.href = '#';
    confirmBtn.onclick = () => handleDelete(tripId);
    modal.classList.remove('hidden');
}

/**
 * Handle the actual delete action after confirmation.
 * @param {string} tripId - The trip ID
 */
function handleDelete(tripId) {
    const result = trips.deleteTrip(tripId);
    if (result.success) {
        ui.hideModal('deleteModal');
        loadTrips(); // Reload the trips list
    } else {
        ui.showAlert('deleteAlert', result.error, 'error');
    }
}

/**
 * Close the delete modal.
 */
function closeDeleteModal() {
    ui.hideModal('deleteModal');
}

// Close modal when clicking outside
document.addEventListener('click', function(e) {
    const modal = document.getElementById('deleteModal');
    if (modal && e.target === modal) {
        closeDeleteModal();
    }
});

// ============================================================
// DASHBOARD PAGE
// ============================================================

/**
 * Load and display all trips for the current user.
 */
function loadTrips() {
    const tripsContainer = document.getElementById('tripsContainer');
    if (!tripsContainer) return;

    const myTrips = trips.getMyTrips();
    const stats = trips.calculateStats(myTrips);

    ui.updateStats(stats);

    if (myTrips.length === 0) {
        tripsContainer.innerHTML = ui.renderEmptyState();
        return;
    }

    tripsContainer.innerHTML = myTrips.map(trip => ui.renderTripCard(trip)).join('');
}

/**
 * Initialize the dashboard page.
 */
function initDashboard() {
    // Auth guard: must be logged in
    if (!auth.requireAuth()) return;

    // Set user greeting
    const user = storage.getCurrentUser();
    if (user) {
        ui.setUserGreeting(user.name);
    }

    // Wire up keyboard shortcuts
    const weatherInput = document.getElementById('weatherCity');
    if (weatherInput) {
        weatherInput.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                e.preventDefault();
                checkWeather();
            }
        });
    }

    const amountInput = document.getElementById('convertAmount');
    if (amountInput) {
        amountInput.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                e.preventDefault();
                convertCurrency();
            }
        });
    }

    // Logout button
    const logoutBtn = document.getElementById('logoutBtn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', function(e) {
            e.preventDefault();
            auth.logout();
            window.location.href = 'login.html';
        });
    }

    // Load data
    loadTrips();
}

// ============================================================
// REGISTER PAGE
// ============================================================

/**
 * Initialize the register page.
 */
function initRegister() {
    // Redirect if already logged in
    if (auth.redirectIfLoggedIn()) return;

    const form = document.getElementById('registerForm');
    if (!form) return;

    // Password visibility toggles
    setupPasswordToggle('password', 'password-icon');
    setupPasswordToggle('confirmPassword', 'confirmPassword-icon');

    form.addEventListener('submit', function(e) {
        e.preventDefault();

        const name = document.getElementById('username')?.value || '';
        const email = document.getElementById('email')?.value || '';
        const password = document.getElementById('password')?.value || '';
        const confirmPassword = document.getElementById('confirmPassword')?.value || '';

        const result = auth.register(name, email, password, confirmPassword);

        if (!result.success) {
            ui.showAlert('formAlert', result.error, 'error');
            return;
        }

        // Success — redirect to dashboard
        window.location.href = 'dashboard.html';
    });
}

// ============================================================
// LOGIN PAGE
// ============================================================

/**
 * Initialize the login page.
 */
function initLogin() {
    // Redirect if already logged in
    if (auth.redirectIfLoggedIn()) return;

    const form = document.getElementById('loginForm');
    if (!form) return;

    // Password visibility toggle
    setupPasswordToggle('password', 'password-icon');

    form.addEventListener('submit', function(e) {
        e.preventDefault();

        const email = document.getElementById('email')?.value || '';
        const password = document.getElementById('password')?.value || '';

        const result = auth.login(email, password);

        if (!result.success) {
            ui.showAlert('formAlert', result.error, 'error');
            return;
        }

        // Success — redirect to dashboard
        window.location.href = 'dashboard.html';
    });
}

// ============================================================
// ADD TRIP PAGE
// ============================================================

/**
 * Initialize the add trip page.
 */
function initAddTrip() {
    // Auth guard
    if (!auth.requireAuth()) return;

    // Set minimum dates
    setupDateInputs();

    const form = document.getElementById('tripForm');
    if (!form) return;

    // Wire up logout
    wireLogoutButton();

    form.addEventListener('submit', function(e) {
        e.preventDefault();

        const tripData = getTripFormData();

        const result = trips.addTrip(tripData);

        if (!result.success) {
            ui.showAlert('formAlert', result.error, 'error');
            return;
        }

        // Success — redirect to dashboard
        window.location.href = 'dashboard.html';
    });
}

// ============================================================
// EDIT TRIP PAGE
// ============================================================

/**
 * Initialize the edit trip page.
 */
function initEditTrip() {
    // Auth guard
    if (!auth.requireAuth()) return;

    // Set minimum dates
    setupDateInputs();

    // Wire up logout
    wireLogoutButton();

    // Get trip ID from URL parameter
    const urlParams = new URLSearchParams(window.location.search);
    const tripId = urlParams.get('id');

    if (!tripId) {
        window.location.href = 'dashboard.html';
        return;
    }

    // Load the trip
    const trip = storage.getTripById(tripId);
    const user = storage.getCurrentUser();

    // Verify trip exists and belongs to current user
    if (!trip || trip.userId !== user?.id) {
        window.location.href = 'dashboard.html';
        return;
    }

    // Fill in the form with existing data
    const destInput = document.getElementById('destination');
    const startInput = document.getElementById('startDate');
    const endInput = document.getElementById('endDate');
    const budgetInput = document.getElementById('budget');
    const currencySelect = document.getElementById('currency');
    const notesInput = document.getElementById('notes');
    const headingDest = document.getElementById('headingDestination');

    if (destInput) destInput.value = trip.destination;
    if (startInput) startInput.value = trip.startDate;
    if (endInput) endInput.value = trip.endDate;
    if (budgetInput) budgetInput.value = trip.budget;
    if (currencySelect) currencySelect.value = trip.currency;
    if (notesInput) notesInput.value = trip.notes || '';
    if (headingDest) headingDest.textContent = trip.destination;

    // Set minimum end date based on start date
    if (startInput && endInput) {
        endInput.setAttribute('min', startInput.value);
    }

    const form = document.getElementById('tripForm');
    if (!form) return;

    form.addEventListener('submit', function(e) {
        e.preventDefault();

        const updateData = getTripFormData();
        const result = trips.updateTrip(tripId, updateData);

        if (!result.success) {
            ui.showAlert('formAlert', result.error, 'error');
            return;
        }

        // Success — redirect to dashboard
        window.location.href = 'dashboard.html';
    });
}

// ============================================================
// SHARED HELPERS
// ============================================================

/**
 * Get trip form data as an object.
 * @returns {Object} Trip form data
 */
function getTripFormData() {
    return {
        destination: document.getElementById('destination')?.value || '',
        startDate: document.getElementById('startDate')?.value || '',
        endDate: document.getElementById('endDate')?.value || '',
        budget: document.getElementById('budget')?.value || '0',
        currency: document.getElementById('currency')?.value || 'USD',
        notes: document.getElementById('notes')?.value || ''
    };
}

/**
 * Set up minimum date on date inputs (can't select past dates).
 */
function setupDateInputs() {
    const today = new Date().toISOString().split('T')[0];
    const startInput = document.getElementById('startDate');
    const endInput = document.getElementById('endDate');

    if (startInput) {
        startInput.setAttribute('min', today);
        startInput.addEventListener('change', function() {
            if (endInput) {
                endInput.setAttribute('min', this.value);
            }
        });
    }
}

/**
 * Wire up the logout button on protected pages.
 */
function wireLogoutButton() {
    const logoutBtn = document.getElementById('logoutBtn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', function(e) {
            e.preventDefault();
            auth.logout();
            window.location.href = 'login.html';
        });
    }
}

/**
 * Toggle password visibility.
 * @param {string} inputId - The input element ID
 * @param {string} iconId - The icon element ID inside the toggle button
 */
function setupPasswordToggle(inputId, iconId) {
    const input = document.getElementById(inputId);
    const icon = document.getElementById(iconId);
    const wrapper = input?.parentElement;
    const btn = wrapper?.querySelector('.toggle-password');

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
// Detect which page we're on and call the appropriate init.
// This uses the body class or a specific element to identify the page.
// ============================================================

document.addEventListener('DOMContentLoaded', function() {
    const body = document.body;

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
    // Landing page (index.html) needs no JS initialization
});
