# Hotel Booking System

> A RESTful API for managing hotel bookings, guests, and rooms — with weather integration and a minimal front-end demo.

---

## Overview

Hotel Booking System is a backend-focused REST API built with Node.js and Express, connected to a PostgreSQL database. It supports managing guests, rooms, and bookings with validation, error handling, and cursor-based pagination. Weather data from the Open-Meteo API is fetched and stored at the time of booking. A minimal static front-end is included for demonstration purposes.

---

## Features

- RESTful API for guests, rooms, and bookings
- PostgreSQL database with normalized schema and named constraints
- Request validation with Yup (type, format, cross-field)
- Centralized error handling with custom error classes
- Cursor-based pagination with dynamic sorting and filtering
- Room availability checking
- Weather forecast fetched and stored on booking creation
- Unit tests with Jest
- Minimal static front-end served via Express

---

## Tech Stack

| Category        | Technology              |
| --------------- | ----------------------- |
| Runtime         | Node.js                 |
| Framework       | Express.js              |
| Database        | PostgreSQL              |
| Validation      | Yup                     |
| HTTP Client     | Axios                   |
| Testing         | Jest                    |
| Weather API     | Open-Meteo              |
| Environment     | dotenv                  |

---

## Project Structure

```
hotel_booking/
├── server.js                  # Entry point
├── appSetup.js                # Express app configuration and middleware
├── database/
│   ├── schema.sql             # Table definitions
│   ├── rollback.sql           # Drop tables
│   └── seeds/                 # Seed data
├── modules/bookings/
│   ├── controllers/           # Request/response handlers
│   │   └── validations/       # Yup validation schemas
│   ├── functions/             # Business logic and DB queries
│   ├── routers/               # Route definitions
│   └── test_cases/            # Jest unit tests
├── helpers/
│   ├── errors/                # Custom error classes
│   ├── functions/             # Shared utilities (cursor encoding, pg error handler)
│   └── services/              # External API services (weather)
├── includes/
│   ├── config/                # Environment variable loader
│   └── db/                    # DB connection, migrate, seed, rollback scripts
├── routers/                   # Top-level router
└── public/                    # Static front-end (HTML, CSS, JS)
```

---

## Getting Started

### Prerequisites

- Node.js `v18+`
- PostgreSQL `v14+`

### Installation

```bash
# Clone the repository
git clone <your-repo-url>

# Navigate into the project directory
cd hotel_booking

# Install dependencies
npm install
```

### Environment Variables

Copy `.env.example` to `.env` and fill in the required values:

```bash
cp .env.example .env
```

```env
NODE_ENV=development
PORT=3000

DATABASE_URL=

DB_HOST=localhost
DB_USER=postgres
DB_PASSWORD=       # your PostgreSQL password
DB_NAME=hotel_booking_db
DB_PORT=5432
```

### Database Setup

Create the database manually in psql:

```sql
CREATE DATABASE hotel_booking_db;
```

Then run migrations and (optionally) seed data:

```bash
npm run migrate
npm run seed
```

To rollback (drop all tables):

```bash
npm run rollback
```

### Running the App

```bash
# Development (with nodemon)
npm run dev

# Production
npm run start
```

The API will be available at `http://localhost:3000`.
The front-end is served at `http://localhost:3000/`.

---

## API Endpoints

### Guests
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/bookings/guests` | Get all guests (search, sort, paginate) |
| POST | `/bookings/guests` | Create a guest |
| GET | `/bookings/guests/:id` | Get a specific guest |
| PATCH | `/bookings/guests/:id` | Update a guest |

### Rooms
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/bookings/rooms` | Get all rooms (filter, sort, availability, paginate) |
| POST | `/bookings/rooms` | Create a room |
| GET | `/bookings/rooms/:id` | Get a specific room |
| PATCH | `/bookings/rooms/:id` | Update a room |
| DELETE | `/bookings/rooms/:id` | Delete a room |

### Bookings
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/bookings` | Get all bookings (filter by status, sort, paginate) |
| POST | `/bookings` | Create a booking (fetches and stores weather) |
| GET | `/bookings/guest/:guest_id` | Get all bookings for a guest |
| GET | `/bookings/:id` | Get a specific booking |
| PATCH | `/bookings/:id` | Update booking status |
| DELETE | `/bookings/:id` | Cancel a booking |

### Weather
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/weather/today` | Get today's weather forecast |

---

## Testing

```bash
npm run test
```

Unit tests cover:
- Room creation with valid data
- Booking creation with valid data
- Booking validation rejecting invalid dates
- Fetching bookings for a specific guest
- Weather API integration with mocked axios

---

*Developed by **RR Nofuente***