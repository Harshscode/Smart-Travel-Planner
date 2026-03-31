# Smart Travel Planner

A fully static, client-side web application for planning and managing your travel trips. Track destinations, check weather forecasts, and manage your travel budget with live exchange rates — all stored in your browser's localStorage.

> **This is the Phase 1 static deployment version.** For the full Node.js/Express version, see the `server.js` branch.

## Features

- **User Registration & Login** — Accounts stored in browser localStorage
- **Dashboard** — View all your trips with stats (total, upcoming, past, budget)
- **Add / Edit / Delete Trips** — Full CRUD operations for trip management
- **Weather API** — Check current weather for any destination city (weatherapi.com)
- **Currency Converter** — Convert between 15+ currencies using live exchange rates (exchangerate-api.com)
- **localStorage Persistence** — All data stored in the browser (Phase 1)
- **Responsive Design** — Works on desktop and mobile devices
- **GitHub Pages Ready** — Fully static, deploys from the `docs/` folder

## Tech Stack

| Layer | Technology |
|---|---|
| Structure | Static HTML files |
| Styling | CSS3 (custom stylesheet, responsive) |
| Logic | Vanilla JavaScript (ES6 modules) |
| Storage | Browser localStorage |
| APIs | weatherapi.com, exchangerate-api.com |
| Icons | Font Awesome 6 (CDN) |

## Project Structure

```
smart-travel-planner/
├── docs/                    # GitHub Pages deploy root
│   ├── index.html           # Landing page
│   ├── login.html           # Login form
│   ├── register.html        # Registration form
│   ├── dashboard.html       # Main dashboard (trips + tools)
│   ├── add-trip.html        # Add new trip form
│   ├── edit-trip.html       # Edit trip form
│   ├── css/
│   │   └── style.css        # All styles (~700 lines, responsive)
│   └── js/
│       ├── storage.js       # localStorage read/write helpers
│       ├── auth.js          # Register, login, logout logic
│       ├── trips.js         # Trip CRUD (add, edit, delete)
│       ├── api.js           # Weather & exchange rate fetch calls
│       ├── ui.js            # DOM helpers, alerts, modals, HTML generators
│       └── main.js          # Page init, auth guards, event wiring
├── .env                     # API keys (for reference — not used in static app)
├── .gitignore               # Ignores .env and node_modules
└── README.md                # This file
```

## Data Storage

All data is stored in browser localStorage using these keys:

| Key | Data |
|---|---|
| `stp_users` | Array of user objects |
| `stp_trips` | Array of trip objects |
| `stp_currentUser` | Currently logged-in user |

## Data Models

```js
// User object
{
    id: "1743460201234",        // Timestamp-based ID
    name: "JohnDoe",            // Username
    email: "john@example.com",   // Lowercase email
    password: "password123",     // Stored as plain text (Phase 1)
    createdAt: "2025-03-31T..." // ISO datetime
}

// Trip object
{
    id: "1743460205678",        // Timestamp-based ID
    userId: "1743460201234",    // Owner's user ID
    destination: "Paris, France",
    startDate: "2025-07-01",
    endDate: "2025-07-07",
    budget: 2500,
    currency: "USD",
    notes: "Summer trip!",
    createdAt: "2025-03-31T..."
}
```

## Getting Started (Local)

1. Open `docs/index.html` directly in your browser
2. That's it — no server, no npm install needed!

For a local server (recommended for development):
```bash
cd docs
python3 -m http.server 8080
# Then open http://localhost:8080
```

## Deploy to GitHub Pages

1. **Push your code to GitHub** (the `docs/` folder must be included)
2. Go to your repository **Settings** → **Pages**
3. Under **Source**, select: **Deploy from a branch**
4. Select branch: **`main`**, folder: **`/docs`**
5. Click **Save**
6. Wait 1-2 minutes — your site will be live at:
   `https://YOUR-USERNAME.github.io/REPO-NAME/`

## API Keys

Two free APIs are used. Keys are embedded directly in `docs/js/api.js`:

| Service | Free Tier | Get a Key |
|---|---|---|
| Weather (weatherapi.com) | 1M calls/month | https://www.weatherapi.com |
| Exchange Rate (exchangerate-api.com) | 1500 requests/month | https://www.exchangerate-api.com |

## JavaScript Modules

| File | What It Does |
|---|---|
| `storage.js` | localStorage read/write for users, trips, and session |
| `auth.js` | Register, login, logout + auth guards |
| `trips.js` | Trip CRUD operations + stats calculation |
| `api.js` | Weather and currency conversion fetch calls |
| `ui.js` | Alert rendering, modal controls, HTML generators |
| `main.js` | Per-page initialization and event handlers |

## How to Use

1. **Register** — Create an account (stored in localStorage)
2. **Login** — Use your email and password
3. **Dashboard** — See all your trips sorted by upcoming/past
4. **Add Trip** — Fill in destination, dates, budget, and notes
5. **Check Weather** — Click "Weather" on any trip card or use the search tool
6. **Convert Currency** — Use the converter to calculate budgets in different currencies
7. **Edit or Delete** — Use the buttons on each trip card
8. **Logout** — Click the logout button to sign out

## Protected Pages

These pages automatically redirect to `login.html` if no user is logged in:
- `dashboard.html`
- `add-trip.html`
- `edit-trip.html`

## Responsive Breakpoints

| Breakpoint | Layout Changes |
|---|---|
| Desktop (>768px) | Full layout with sidebar stats |
| Tablet/Mobile (≤768px) | Stacked stats, single-column trips, collapsed nav |
| Small Mobile (≤480px) | Compact stat cards, full-width buttons |

## Phase 1 Checklist

- [x] Landing page
- [x] User registration
- [x] User login
- [x] localStorage session management
- [x] Dashboard with trip list
- [x] Add trip form
- [x] Edit trip form
- [x] Delete trip with confirmation modal
- [x] Weather API integration
- [x] Exchange rate API integration
- [x] Currency converter tool
- [x] Responsive navbar
- [x] Responsive CSS design
- [x] localStorage data persistence
- [x] GitHub Pages deployment
- [x] README and deployment instructions

## License

MIT
