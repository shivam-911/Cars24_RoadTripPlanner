export const BASE_URL = process.env.NODE_ENV === 'production' 
    ? "https://roadtrip-planner.onrender.com" 
    : "http://localhost:5000";

// API endpoints
export const API_ENDPOINTS = {
    // Auth endpoints
    AUTH: {
        LOGIN: '/api/auth/login',
        REGISTER: '/api/auth/register',
        PROFILE: '/api/auth/profile'
    },

    // Trip endpoints
    TRIPS: {
        GET_ALL: '/api/roadtrips',
        GET_MY_TRIPS: '/api/roadtrips/user/mytrips',
        CREATE: '/api/roadtrips',
        GET_BY_ID: (id) => `/api/roadtrips/${id}`,
        UPDATE: (id) => `/api/roadtrips/${id}`,
        DELETE: (id) => `/api/roadtrips/${id}`,
        LIKE: (id) => `/api/roadtrips/${id}/like`,
        SEARCH: '/api/roadtrips/search'
    },

    // Comment endpoints
    COMMENTS: {
        GET_FOR_TRIP: (tripId) => `/api/comments/${tripId}`,
        CREATE: (tripId) => `/api/comments/${tripId}`,
        UPDATE: (commentId) => `/api/comments/${commentId}`,
        DELETE: (commentId) => `/api/comments/${commentId}`
    },

    // Review endpoints
    REVIEWS: {
        GET_FOR_TRIP: (tripId) => `/api/reviews/trip/${tripId}`,
        CREATE: (tripId) => `/api/reviews/${tripId}`,
        UPDATE: (reviewId) => `/api/reviews/${reviewId}`,
        DELETE: (reviewId) => `/api/reviews/${reviewId}`
    },

    // External API endpoints
    WEATHER: '/api/weather',
    WEATHER_FORECAST: '/api/weather/forecast',
    ROUTE: '/api/route',
    PLACES: '/api/places'
};

// HTTP request helper functions
export const makeAuthenticatedRequest = (token) => ({
    headers: {
        'x-auth-token': token,
        'Content-Type': 'application/json'
    }
});

export const makeFormDataRequest = (token) => ({
    headers: {
        'x-auth-token': token,
        
    }
});
