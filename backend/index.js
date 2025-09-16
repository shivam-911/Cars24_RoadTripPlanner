const express = require('express');
const mongoose = require('mongoose');
require('dotenv').config();
const cors = require('cors');

// Route files import
const userRoutes = require('./Routes/User.Routes.js');
const roadTripRoutes = require('./Routes/RoadTrip.Routes.js');
const reviewRoutes = require('./Routes/Review.Routes.js');
const weatherRoutes = require('./Routes/Weather.Routes.js'); 
const authRoutes = require('./Routes/Auth.Routes.js');
const commentRoutes = require('./Routes/Comment.Routes.js');
const routeRoutes = require('./Routes/Route.Routes.js');
const placesRoutes = require('./Routes/Places.Routes.js');

// Logger middleware 
const logger = require('./Middlewares/logger.Middlewares.js'); 

// Express app initialize 
const app = express();
const PORT = process.env.PORT || 5000; 

app.use(
  cors({
    origin: [
      "https://road-trip-planner-alpha.vercel.app"
    ],
    credentials: true,
  })
);

// Middleware to parse JSON with size limit
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

app.use(logger); 

// Database Connection with better error handling
mongoose.connect(process.env.MONGODB_CONNECTION_STRING, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
})
.then(() => console.log('✅ MongoDB connected successfully!'))
.catch(err => {
    console.error('❌ MongoDB connection error:', err);
    process.exit(1);
});

// Health check endpoint
app.get('/health', (req, res) => {
    res.status(200).json({ 
        status: 'OK', 
        message: 'Road Trip Planner API is running',
        timestamp: new Date().toISOString()
    });
});

// API Routes use 
app.use('/api/users', userRoutes);
app.use('/api/roadtrips', roadTripRoutes);
app.use('/api/reviews', reviewRoutes);
app.use('/api/weather', weatherRoutes);
app.use('/api/auth', authRoutes); 
app.use('/api/comments', commentRoutes);
app.use('/api/route', routeRoutes);
app.use('/api/places', placesRoutes);

// Global error handler
app.use((err, req, res, next) => {
    console.error('Global Error Handler:', err);
    res.status(500).json({
        message: 'Something went wrong!',
        error: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ message: "Route Not Found" });
});

// Server listen with graceful shutdown
const server = app.listen(PORT, () => {
    console.log(`🚀 Server is running on port ${PORT}`);
});

// Graceful shutdown
process.on('SIGTERM', () => {
    console.log('🛑 SIGTERM signal received, shutting down gracefully');
    server.close(() => {
        console.log('✅ HTTP server closed');
        mongoose.connection.close(false, () => {
            console.log('✅ MongoDB connection closed');
            process.exit(0);
        });
    });
});
