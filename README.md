# Smart Travel Planner - Phase 2

A full-stack Node.js web application for planning and managing travel trips with weather forecasts, currency conversion, itinerary planning, and budget tracking.

## Features

### Phase 1 (Base)
- **User Registration & Login** — Accounts stored in MongoDB with bcrypt password hashing
- **Dashboard** — View all your trips with stats (total, upcoming, past, budget)
- **Add / Edit / Delete Trips** — Full CRUD operations with trip ownership validation
- **Weather API** — Check current weather for any destination city (weatherapi.com)
- **Currency Converter** — Convert between 16 currencies using live exchange rates
- **Responsive Design** — Works on desktop and mobile devices

### Phase 2 (New)
- **Trip Details Page** — View full trip information with tabbed interface
- **Itinerary Planner** — Plan daily activities with date/time/location/category
- **Budget Tracker** — Track expenses with category breakdown and progress bars
- **Favorite Places** — Save destinations you want to visit someday
- **Secure API Keys** — Weather and currency API keys are server-side only (not exposed to browser)
- **Session-based Auth** — Secure authentication with express-session

## Tech Stack

| Layer | Technology |
|---|---|
| Backend | Node.js, Express |
| Database | MongoDB (Mongoose ODM) |
| Auth | bcryptjs, express-session |
| Frontend | HTML5, CSS3, Vanilla JS |
| APIs | weatherapi.com, exchangerate-api.com |

## Getting Started

### Prerequisites
- Node.js (v14+) installed
- MongoDB Atlas account (free tier) OR local MongoDB installation

### 1. Install Dependencies
```bash
npm install
```

### 2. Set Up MongoDB Atlas (Recommended)
1. Go to https://www.mongodb.com/atlas and create a free account
2. Create a free cluster (M0 Sandbox)
3. Create a database user (username + password)
4. Whitelist IP `0.0.0.0/0` (for local development)
5. Copy your connection string

### 3. Configure Environment
Edit the `.env` file:
```env
PORT=3000
SESSION_SECRET=change_this_to_a_random_secret_string_in_production

# MongoDB Atlas connection string
MONGODB_URI=mongodb+srv://<username>:<password>@<cluster>/smartTravelPlanner

# API Keys (already configured)
WEATHER_API_KEY=e5b14e5e327249128c1135910240105
EXCHANGE_API_KEY=f781c5b5ecedaf552c7fa743
```

### 4. Start the Server
```bash
npm start
```

### 5. Open in Browser
Navigate to http://localhost:3000

## Project Structure

```
smart-travel-planner/
├── server.js                 # Express entry point
├── config/
│   └── database.js           # MongoDB connection
├── models/
│   ├── User.js               # User schema
│   ├── Trip.js               # Trip schema
│   ├── ItineraryItem.js      # Itinerary item schema
│   ├── Expense.js            # Expense schema
│   └── Favorite.js           # Favorite schema
├── routes/
│   ├── auth.js               # Authentication routes
│   ├── trips.js              # Trip CRUD routes
│   ├── itinerary.js          # Itinerary CRUD routes
│   ├── expenses.js           # Expense CRUD routes
│   ├── favorites.js          # Favorites CRUD routes
│   ├── weather.js            # Weather API proxy
│   └── currency.js           # Currency API proxy
├── middleware/
│   └── auth.js               # Session auth middleware
├── docs/                     # Frontend (served as static files)
│   ├── index.html            # Landing page
│   ├── login.html            # Login form
│   ├── register.html         # Registration form
│   ├── dashboard.html        # Main dashboard
│   ├── add-trip.html         # Add new trip
│   ├── edit-trip.html        # Edit trip
│   ├── trip-details.html     # Trip details + itinerary + budget
│   ├── favorites.html        # Favorite places
│   ├── css/style.css         # All styles
│   └── js/
│       ├── api-client.js     # Backend API client
│       ├── auth.js           # Auth logic
│       ├── trips.js          # Trip logic
│       ├── api.js            # API proxy wrapper
│       ├── ui.js             # UI helpers
│       ├── main.js           # Page initialization
│       ├── itinerary.js      # Itinerary planner UI
│       ├── expenses.js       # Budget tracker UI
│       └── favorites.js      # Favorites UI
└── .env                      # Environment variables
```

## API Endpoints

### Authentication
| Method | Endpoint | Description |
|---|---|---|
| POST | `/api/auth/register` | Create account |
| POST | `/api/auth/login` | Login |
| POST | `/api/auth/logout` | Logout |
| GET | `/api/auth/me` | Get current user |

### Trips
| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/trips` | Get user's trips |
| GET | `/api/trips/:id` | Get single trip |
| POST | `/api/trips` | Create trip |
| PUT | `/api/trips/:id` | Update trip |
| DELETE | `/api/trips/:id` | Delete trip |

### Itinerary
| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/trips/:tripId/itinerary` | Get all items |
| POST | `/api/trips/:tripId/itinerary` | Add item |
| PUT | `/api/itinerary/:id` | Update item |
| DELETE | `/api/itinerary/:id` | Delete item |

### Expenses
| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/trips/:tripId/expenses` | Get expenses |
| POST | `/api/trips/:tripId/expenses` | Add expense |
| PUT | `/api/expenses/:id` | Update expense |
| DELETE | `/api/expenses/:id` | Delete expense |
| GET | `/api/trips/:tripId/expenses/summary` | Category totals |

### Favorites
| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/favorites` | Get favorites |
| POST | `/api/favorites` | Add favorite |
| DELETE | `/api/favorites/:id` | Remove favorite |

### External API Proxy
| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/weather?city=:city` | Fetch weather |
| GET | `/api/currency/convert?from=X&to=Y&amount=N` | Convert currency |

## Data Models

### User
```js
{ _id, name, email, password (bcrypt), createdAt }
```

### Trip
```js
{ _id, userId, destination, startDate, endDate, budget, currency, notes, createdAt, updatedAt }
```

### ItineraryItem
```js
{ _id, tripId, userId, date, time, activity, location, category, notes, createdAt }
```

### Expense
```js
{ _id, tripId, userId, amount, currency, category, description, date, createdAt }
```

### Favorite
```js
{ _id, userId, destination, notes, createdAt }
```

## Submission

For the course submission, zip the entire project folder and submit. The demo video should show:
1. Registration and login (with bcrypt hashing)
2. Creating, viewing, editing, and deleting a trip
3. Adding activities to the itinerary planner
4. Adding expenses to the budget tracker
5. Adding favorite places
6. Weather search and currency conversion
7. MongoDB data persistence (refreshing the page shows saved data)
