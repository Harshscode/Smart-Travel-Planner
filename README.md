# Smart Travel Planner

A Node.js + Express web application for planning and managing your travel trips. Track destinations, check weather forecasts, and manage your travel budget with live exchange rates.

## Features

- **User Registration & Login** — Secure authentication with password hashing (bcryptjs)
- **Dashboard** — View all your trips with stats (total, upcoming, past, budget)
- **Add / Edit / Delete Trips** — Full CRUD operations for trip management
- **Weather API** — Check current weather for any destination city
- **Currency Converter** — Convert between 15+ currencies using live exchange rates
- **Local Data Storage** — Users and trips stored in JSON files (Phase 1)
- **Responsive Design** — Works on desktop and mobile devices
- **Session-Based Auth** — Secure login sessions with 24-hour expiry

## Tech Stack

| Layer | Technology |
|---|---|
| Backend | Node.js, Express.js |
| Templates | EJS |
| Auth | bcryptjs, express-session |
| Data | Local JSON files |
| APIs | weatherapi.com, exchangerate-api.com |
| Frontend | HTML5, CSS3, Vanilla JavaScript |

## Project Structure

```
smart-travel-planner/
├── server.js              # Main Express app entry point
├── package.json           # Dependencies and scripts
├── .env                   # API keys and configuration (DO NOT COMMIT)
├── .gitignore             # Ignores .env and node_modules
├── controllers/
│   ├── dataStore.js       # User & trip CRUD on JSON files
│   ├── authController.js   # Register, login, logout logic
│   ├── tripController.js   # Dashboard, add/edit/delete trips
│   ├── weatherController.js # Weather API integration
│   └── exchangeController.js # Currency API integration
├── routes/
│   ├── auth.js            # /login, /register, /logout routes
│   ├── trips.js           # /dashboard, /add-trip, /edit-trip routes
│   └── api.js             # /api/weather, /api/exchange AJAX endpoints
├── views/
│   ├── landing.ejs        # Landing page
│   ├── login.ejs          # Login form
│   ├── register.ejs       # Registration form
│   ├── dashboard.ejs      # Main dashboard (trips + tools)
│   ├── addTrip.ejs        # Add new trip form
│   └── editTrip.ejs       # Edit trip form
├── public/
│   ├── css/
│   │   └── style.css      # All styles (responsive, modern UI)
│   └── js/
│       └── dashboard.js   # Frontend JS (weather, conversion, modals)
└── data/
    ├── users.json         # User accounts (auto-created)
    └── trips.json         # Trip records (auto-created)
```

## Getting Started

### 1. Install Dependencies

```bash
npm install
```

### 2. Configure Environment Variables

Your `.env` file should already contain your API keys. Open it and verify:

```env
PORT=3000
SESSION_SECRET=change_this_to_a_random_secret_string_in_production
WEATHER_API_KEY=e5b14e5e327249128c1135910240105
EXCHANGE_API_KEY=f781c5b5ecedaf552c7fa743
```

> **Important:** Never commit your `.env` file. It is already in `.gitignore`.

### 3. Run the Server

```bash
npm start
# or
node server.js
```

Then open your browser and go to: **http://localhost:3000**

## API Keys

The app uses two free APIs. Your keys are already configured in `.env`:

| Service | API Key | Free Tier |
|---|---|---|
| Weather (weatherapi.com) | Already set | 1M calls/month |
| Exchange Rate (exchangerate-api.com) | Already set | 1500 requests/month |

To get new keys:
- Weather: https://www.weatherapi.com
- Exchange Rate: https://www.exchangerate-api.com

## API Endpoints

| Endpoint | Method | Description |
|---|---|---|
| `/api/weather?city=Paris` | GET | Get current weather for a city |
| `/api/exchange?base=USD` | GET | Get exchange rates for a base currency |
| `/api/convert?from=USD&to=EUR&amount=100` | GET | Convert amount between currencies |

All API endpoints require authentication.

## How to Use

1. **Register** — Create an account with username, email, and password
2. **Login** — Use your email and password to access the dashboard
3. **Add Trip** — Fill in destination, dates, budget, and optional notes
4. **View Dashboard** — See all your trips sorted by upcoming/past
5. **Check Weather** — Click "Weather" on any trip card or use the search tool
6. **Convert Currency** — Use the converter to calculate budgets in different currencies
7. **Edit or Delete** — Use the buttons on each trip card to modify or remove trips

## Deployment (Phase 1)

For simple deployment on platforms like Render, Railway, or Heroku:

1. Push to GitHub
2. Connect the repository to your hosting platform
3. Set environment variables in the platform's dashboard:
   - `PORT` (optional, platform will set this)
   - `SESSION_SECRET` — a random string for session signing
   - `WEATHER_API_KEY` — your weather API key
   - `EXCHANGE_API_KEY` — your exchange rate API key
4. Set the build command: `npm install`
5. Set the start command: `npm start`

**Note:** The JSON file data store is not suitable for production with multiple users or frequent writes. Phase 2 will replace this with MongoDB.

## Phase 1 Checklist

- [x] Landing page
- [x] User registration
- [x] User login
- [x] Password hashing (bcryptjs)
- [x] Session management
- [x] Dashboard with trip list
- [x] Add trip form
- [x] Edit trip form
- [x] Delete trip with confirmation
- [x] Weather API integration
- [x] Exchange rate API integration
- [x] Currency converter tool
- [x] Responsive navbar
- [x] Responsive CSS design
- [x] Local JSON data storage
- [x] README and deployment instructions

## License

MIT
