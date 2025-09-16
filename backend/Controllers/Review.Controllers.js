const Review = require('../Models/Review.Models');
const RoadTrip = require('../Models/RoadTrip.Models');

// Input validation
const validateReview = (comment, rating) => {
    if (!comment || comment.trim().length < 5) {
        return { isValid: false, message: 'Review comment must be at least 5 characters long' };
    }
    if (comment.trim().length > 1000) {
        return { isValid: false, message: 'Review comment must be less than 1000 characters' };
    }
    if (!rating || rating < 1 || rating > 5) {
        return { isValid: false, message: 'Rating must be between 1 and 5' };
    }
    return { isValid: true };
};

// CREATE a new review
exports.createReview = async (req, res) => {
    try {
        const { comment, rating, user } = req.body;
        const tripId = req.params.tripId;

        // Input validation
        const validation = validateReview(comment, rating);
        if (!validation.isValid) {
            return res.status(400).json({ message: validation.message });
        }

        // Check if trip exists
        const trip = await RoadTrip.findById(tripId);
        if (!trip) {
            return res.status(404).json({ message: 'Trip not found' });
        }

        // Check if user already reviewed this trip
        const existingReview = await Review.findOne({ user, roadTrip: tripId });
        if (existingReview) {
            return res.status(400).json({ message: 'You have already reviewed this trip' });
        }

        // Create the new review
        const newReview = await Review.create({
            comment: comment.trim(),
            rating: parseInt(rating),
            user,
            roadTrip: tripId
        });

        await newReview.populate('user', 'username name');

        // Add this review's ID to the corresponding RoadTrip's reviews array
        await RoadTrip.findByIdAndUpdate(tripId, {
            $push: { reviews: newReview._id }
        });

        res.status(201).json(newReview);
    } catch (error) {
        console.error("Create review error:", error);
        res.status(500).json({ message: 'Error creating review', error: error.message });
    }
};

// READ all reviews for a specific road trip
exports.getReviewsForTrip = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const skip = (page - 1) * limit;

        const reviews = await Review.find({ roadTrip: req.params.tripId })
            .populate('user', 'username name')
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit);

        const total = await Review.countDocuments({ roadTrip: req.params.tripId });

        // Calculate average rating
        const avgRating = await Review.aggregate([
            { $match: { roadTrip: req.params.tripId } },
            { $group: { _id: null, avgRating: { $avg: '$rating' }, count: { $sum: 1 } } }
        ]);

        const result = {
            reviews,
            pagination: {
                currentPage: page,
                totalPages: Math.ceil(total / limit),
                totalReviews: total,
                hasNext: page < Math.ceil(total / limit),
                hasPrev: page > 1
            },
            stats: {
                averageRating: avgRating[0]?.avgRating ? avgRating[0].avgRating.toFixed(1) : 0,
                totalReviews: avgRating[0]?.count || 0
            }
        };

        res.status(200).json(result);
    } catch (error) {
        console.error("Get reviews error:", error);
        res.status(500).json({ message: 'Error fetching reviews', error: error.message });
    }
};

// UPDATE a review by its ID
exports.updateReview = async (req, res) => {
    try {
        const { comment, rating } = req.body;

        const validation = validateReview(comment, rating);
        if (!validation.isValid) {
            return res.status(400).json({ message: validation.message });
        }

        const review = await Review.findById(req.params.reviewId);
        if (!review) {
            return res.status(404).json({ message: 'Review not found' });
        }

        // Check if user owns the review (assuming req.user is set by auth middleware)
        if (req.user && review.user.toString() !== req.user.id) {
            return res.status(403).json({ message: 'Not authorized to update this review' });
        }

        const updatedReview = await Review.findByIdAndUpdate(
            req.params.reviewId, 
            { 
                comment: comment.trim(), 
                rating: parseInt(rating) 
            }, 
            { new: true }
        ).populate('user', 'username name');

        res.status(200).json(updatedReview);
    } catch (error) {
        console.error("Update review error:", error);
        res.status(500).json({ message: 'Error updating review', error: error.message });
    }
};

// DELETE a review by its ID
exports.deleteReview = async (req, res) => {
    try {
        const review = await Review.findById(req.params.reviewId);
        if (!review) {
            return res.status(404).json({ message: 'Review not found' });
        }

        // Check if user owns the review
        if (req.user && review.user.toString() !== req.user.id) {
            return res.status(403).json({ message: 'Not authorized to delete this review' });
        }

        const tripId = review.roadTrip;

        // Delete the review
        await Review.findByIdAndDelete(req.params.reviewId);

        // Remove the review's ID from the RoadTrip's reviews array
        await RoadTrip.findByIdAndUpdate(tripId, {
            $pull: { reviews: req.params.reviewId }
        });

        res.status(204).send();
    } catch (error) {
        console.error("Delete review error:", error);
        res.status(500).json({ message: 'Error deleting review', error: error.message });
    }
};
