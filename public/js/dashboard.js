// ============================================================
// dashboard.js - Frontend JavaScript for Dashboard
// ============================================================
// Handles:
//   - Weather checking via API
//   - Currency conversion via API
//   - Delete confirmation modal
// ============================================================

// --- WEATHER CHECKING ---
/**
 * Check weather for a city typed in the input field.
 */
async function checkWeather() {
    const city = document.getElementById('weatherCity').value.trim();
    const resultDiv = document.getElementById('weatherResult');

    if (!city) {
        showMessage(resultDiv, 'Please enter a city name.', 'error');
        return;
    }

    showLoading(resultDiv, 'Checking weather...');

    try {
        const response = await fetch(`/api/weather?city=${encodeURIComponent(city)}`);
        const data = await response.json();

        if (data.error) {
            showMessage(resultDiv, data.error, 'error');
            return;
        }

        const w = data.data;
        resultDiv.innerHTML = `
            <div class="weather-display">
                <div class="weather-main">
                    <img src="https:${w.condition_icon}" alt="${w.condition}" class="weather-icon">
                    <div class="weather-temp">
                        <span class="temp-value">${Math.round(w.temp_c)}°C</span>
                        <span class="temp-feels">Feels like ${Math.round(w.feelslike_c)}°C</span>
                    </div>
                    <div class="weather-info">
                        <div class="weather-location">
                            <i class="fas fa-map-marker-alt"></i>
                            ${w.city}, ${w.country}
                        </div>
                        <div class="weather-condition">${w.condition}</div>
                    </div>
                </div>
                <div class="weather-details">
                    <div class="weather-detail-item">
                        <i class="fas fa-tint"></i>
                        <span>Humidity: ${w.humidity}%</span>
                    </div>
                    <div class="weather-detail-item">
                        <i class="fas fa-wind"></i>
                        <span>Wind: ${Math.round(w.wind_kph)} km/h</span>
                    </div>
                    <div class="weather-detail-item">
                        <i class="fas fa-clock"></i>
                        <span>Local time: ${w.localtime}</span>
                    </div>
                </div>
            </div>
        `;
        resultDiv.classList.remove('hidden');

    } catch (err) {
        console.error('Weather error:', err);
        showMessage(resultDiv, 'Unable to fetch weather. Please try again.', 'error');
    }
}

/**
 * Check weather for a specific trip destination.
 * @param {string} destination - The trip destination
 */
async function checkWeatherForTrip(destination) {
    const resultDiv = document.getElementById('weatherResult');

    // Set the city in the input field
    document.getElementById('weatherCity').value = destination;
    showLoading(resultDiv, `Checking weather for ${destination}...`);

    try {
        const response = await fetch(`/api/weather?city=${encodeURIComponent(destination)}`);
        const data = await response.json();

        if (data.error) {
            showMessage(resultDiv, data.error, 'error');
            return;
        }

        const w = data.data;
        resultDiv.innerHTML = `
            <div class="weather-display">
                <div class="weather-main">
                    <img src="https:${w.condition_icon}" alt="${w.condition}" class="weather-icon">
                    <div class="weather-temp">
                        <span class="temp-value">${Math.round(w.temp_c)}°C</span>
                        <span class="temp-feels">Feels like ${Math.round(w.feelslike_c)}°C</span>
                    </div>
                    <div class="weather-info">
                        <div class="weather-location">
                            <i class="fas fa-map-marker-alt"></i>
                            ${w.city}, ${w.country}
                        </div>
                        <div class="weather-condition">${w.condition}</div>
                    </div>
                </div>
                <div class="weather-details">
                    <div class="weather-detail-item">
                        <i class="fas fa-tint"></i>
                        <span>Humidity: ${w.humidity}%</span>
                    </div>
                    <div class="weather-detail-item">
                        <i class="fas fa-wind"></i>
                        <span>Wind: ${Math.round(w.wind_kph)} km/h</span>
                    </div>
                    <div class="weather-detail-item">
                        <i class="fas fa-clock"></i>
                        <span>Local time: ${w.localtime}</span>
                    </div>
                </div>
            </div>
        `;
        resultDiv.classList.remove('hidden');

        // Scroll to weather result
        resultDiv.scrollIntoView({ behavior: 'smooth', block: 'nearest' });

    } catch (err) {
        console.error('Weather error:', err);
        showMessage(resultDiv, 'Unable to fetch weather. Please try again.', 'error');
    }
}

// --- CURRENCY CONVERSION ---
/**
 * Convert an amount from one currency to another.
 */
async function convertCurrency() {
    const amount = document.getElementById('convertAmount').value;
    const from = document.getElementById('convertFrom').value;
    const to = document.getElementById('convertTo').value;
    const resultDiv = document.getElementById('conversionResult');

    if (!amount || parseFloat(amount) <= 0) {
        showMessage(resultDiv, 'Please enter a valid amount greater than 0.', 'error');
        return;
    }

    showLoading(resultDiv, 'Converting...');

    try {
        const response = await fetch(
            `/api/convert?from=${from}&to=${to}&amount=${encodeURIComponent(amount)}`
        );
        const data = await response.json();

        if (data.error) {
            showMessage(resultDiv, data.error, 'error');
            return;
        }

        const d = data.data;
        resultDiv.innerHTML = `
            <div class="conversion-display">
                <div class="conversion-main">
                    <span class="conversion-amount">${d.originalAmount.toLocaleString()} ${d.from}</span>
                    <i class="fas fa-arrow-right conversion-arrow-icon"></i>
                    <span class="conversion-result">${d.convertedAmount.toLocaleString()} ${d.to}</span>
                </div>
                <div class="conversion-rate">
                    <i class="fas fa-info-circle"></i>
                    1 ${d.from} = ${d.rate.toFixed(4)} ${d.to}
                </div>
            </div>
        `;
        resultDiv.classList.remove('hidden');

    } catch (err) {
        console.error('Conversion error:', err);
        showMessage(resultDiv, 'Unable to convert currency. Please try again.', 'error');
    }
}

// --- DELETE CONFIRMATION MODAL ---
/**
 * Show the delete confirmation modal.
 * @param {string} tripId - The trip ID to delete
 * @param {string} destination - The trip destination for display
 */
function confirmDelete(tripId, destination) {
    const modal = document.getElementById('deleteModal');
    const text = document.getElementById('deleteModalText');
    const confirmBtn = document.getElementById('confirmDeleteBtn');

    text.textContent = `Are you sure you want to delete your trip to "${destination}"? This action cannot be undone.`;
    confirmBtn.href = `/delete-trip/${tripId}`;
    modal.classList.remove('hidden');
}

/**
 * Close the delete confirmation modal.
 */
function closeDeleteModal() {
    document.getElementById('deleteModal').classList.add('hidden');
}

// Close modal if clicking outside
document.addEventListener('click', function(e) {
    const modal = document.getElementById('deleteModal');
    if (e.target === modal) {
        closeDeleteModal();
    }
});

// --- KEYBOARD SHORTCUT: Enter key triggers search ---
document.addEventListener('DOMContentLoaded', function() {
    // Weather search on Enter
    const weatherInput = document.getElementById('weatherCity');
    if (weatherInput) {
        weatherInput.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                e.preventDefault();
                checkWeather();
            }
        });
    }

    // Currency conversion on Enter
    const amountInput = document.getElementById('convertAmount');
    if (amountInput) {
        amountInput.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                e.preventDefault();
                convertCurrency();
            }
        });
    }
});

// --- HELPER FUNCTIONS ---

/**
 * Show a loading spinner in a result div.
 * @param {HTMLElement} div - The result container
 * @param {string} message - Loading message
 */
function showLoading(div, message) {
    div.innerHTML = `<div class="tool-loading"><i class="fas fa-spinner fa-spin"></i> ${message}</div>`;
    div.classList.remove('hidden');
}

/**
 * Show a success or error message.
 * @param {HTMLElement} div - The result container
 * @param {string} message - Message to display
 * @param {string} type - 'success' or 'error'
 */
function showMessage(div, message, type) {
    div.innerHTML = `
        <div class="alert alert-${type}">
            <i class="fas fa-${type === 'error' ? 'exclamation-circle' : 'check-circle'}"></i>
            ${message}
        </div>
    `;
    div.classList.remove('hidden');
}
