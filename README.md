# RoadVenture - User Guide

## Overview
RoadVenture helps users plan, document, and share road trips. You can create trip albums, write reviews, and connect with other travelers.

## Getting Started

### 1. Registration & Login
- Go to the homepage.
- Click "Start Your Journey" to register.
- Fill out your name, username, email, and password (min 6 characters).
- After registering, you’ll be auto-logged in.

### 2. Exploring Trips
- Click "Explore Trips" to browse all trips.
- View details, images, and reviews of each trip.

### 3. Creating a Trip
- Navigate to "Create Trip".
- Enter required information: title, description (min 10 characters), start and end destinations.
- Upload up to 5 images (max 10MB each).
- Submit to publish your trip.

### 4. Managing Your Trips
- Visit "My Trips" to see trips you created.
- Trips can be published (visible to all) or remain drafts.

### 5. Additional Features
- Search trips by title, description, or route.
- View weather for trip destinations.
- Like and comment on trips.
- Discover nearby places.

## UI Highlights
- Navbar: Quick links and branding.
- HomePage: Features, journey CTA, and guide to start.
- MapComponent: Visualizes routes and trip stops.

## Troubleshooting
- Registration errors are shown if fields are incomplete or password is too short.
- Login errors: Invalid credentials prompt for retry.
- Trip creation: Ensure all required fields and images meet constraints.

## Contact
For feedback/issues, open a GitHub issue in this repository.

---

# RoadVenture - Code Documentation

## Project Structure
- **frontend/**: React app for UI
  - `src/pages/`: HomePage, RegisterPage, LoginPage, CreateTripPage, MyTripsPage, TripsPage, TripDetailPage
  - `src/components/`: Navbar, Footer, MapComponent, etc.
  - `src/api.js`: API endpoints and base URLs
- **backend/**: Express app for API
  - `Controllers/`: Auth, RoadTrip, Places, User, Route, etc.
  - `Models/`: User.Models.js, RoadTrip.Models.js
  - `Routes/`: API route definitions
  - `Middlewares/`: logger.Middlewares.js for logging
  - `index.js`: Backend entry point (express app, route and middleware setup)

## Main Entry Points
- **Frontend**: `src/index.js`
  - Renders the React app and sets up routing and authentication context.
- **Backend**: `backend/index.js`
  - Initializes express app, connects routes and middlewares.

## Core Logic Snapshots

### User Registration (Backend)
```javascript
// backend/Controllers/Auth.Controllers.js
exports.register = async (req, res) => {
    // Input validation for name, username, email, password
    // Email regex and password length checks
    // Create user, hash password, save to DB
    // Respond with token and user info
};
```

### Trip Creation (Backend)
```javascript
// backend/Controllers/RoadTrip.Controllers.js
exports.createRoadTrip = async (req, res) => {
    // Validate title and description
    // Handle image uploads via cloudinary
    // Save trip data to DB
    // Respond with trip info
};
```

### API Endpoints (Frontend)
```javascript
// frontend/src/api.js
export const API_ENDPOINTS = {
    AUTH: { LOGIN, REGISTER, PROFILE },
    TRIPS: { GET_ALL, CREATE, GET_BY_ID, UPDATE, DELETE, LIKE, SEARCH },
    COMMENTS: { ... }
};
```

## Areas Needing More Documentation
- Some controllers (e.g., RoadTrip, Auth, Places) have minimal code comments, especially on error handling and business logic.
- Some React components (MapComponent, Footer, Navbar) have little to no inline documentation.
- The Models (User, RoadTrip) could use JSDoc for schema fields.
- Utility functions and middlewares (logger, auth) should be commented for clarity.

## Recommendations
- Add JSDoc comments to all model and controller functions.
- Expand comments on React components describing props, state, and UI logic.
- Include error handling examples and API response shapes in backend controller documentation.

## Example JSDoc for Model

```javascript
/**
 * RoadTrip Schema
 * @typedef {Object} RoadTrip
 * @property {String} title - Trip title
 * @property {String} description - Trip description
 * @property {String} coverImage - Cover image URL
 * @property {Array} route - Array of route stops
 * @property {ObjectId} createdBy - User who created the trip
 */