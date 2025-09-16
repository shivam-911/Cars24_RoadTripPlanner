const express = require('express');
const router = express.Router();
const reviewController = require('../Controllers/Review.Controllers');
const authMiddleware = require('../Middlewares/auth.Middlewares.js');

// Public routes
router.get('/trip/:tripId', reviewController.getReviewsForTrip);

// Protected routes
router.post('/:tripId', authMiddleware, reviewController.createReview);
router.put('/:reviewId', authMiddleware, reviewController.updateReview);
router.delete('/:reviewId', authMiddleware, reviewController.deleteReview);

module.exports = router;
