const Comment = require('../Models/Comment.Models.js');
const RoadTrip = require('../Models/RoadTrip.Models.js');

// Input validation
const validateComment = (text) => {
    if (!text || text.trim().length < 1) {
        return { isValid: false, message: 'Comment cannot be empty' };
    }
    if (text.trim().length > 500) {
        return { isValid: false, message: 'Comment must be less than 500 characters' };
    }
    return { isValid: true };
};

// Get all comments for a trip with pagination
exports.getCommentsForTrip = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const skip = (page - 1) * limit;

        const comments = await Comment.find({ roadTrip: req.params.tripId })
            .populate('user', 'username name') 
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit);

        const total = await Comment.countDocuments({ roadTrip: req.params.tripId });

        res.json({
            comments,
            pagination: {
                currentPage: page,
                totalPages: Math.ceil(total / limit),
                totalComments: total,
                hasNext: page < Math.ceil(total / limit),
                hasPrev: page > 1
            }
        });
    } catch (err) {
        console.error("Get comments error:", err);
        res.status(500).json({ message: 'Error fetching comments', error: err.message });
    }
};

// Create a new comment
exports.createComment = async (req, res) => {
    try {
        const { text } = req.body;

        // Input validation
        const validation = validateComment(text);
        if (!validation.isValid) {
            return res.status(400).json({ message: validation.message });
        }

        const roadTrip = await RoadTrip.findById(req.params.tripId);
        if (!roadTrip) {
            return res.status(404).json({ message: 'Trip not found' });
        }

        const newComment = new Comment({
            text: text.trim(),
            user: req.user.id,
            roadTrip: req.params.tripId,
        });

        const comment = await newComment.save();
        await comment.populate('user', 'username name');

        // Add comment to trip
        roadTrip.comments.unshift(comment.id);
        await roadTrip.save();

        res.status(201).json(comment);
    } catch (err) {
        console.error("Create comment error:", err);
        res.status(500).json({ message: 'Error creating comment', error: err.message });
    }
};

// Update comment
exports.updateComment = async (req, res) => {
    try {
        const { text } = req.body;

        const validation = validateComment(text);
        if (!validation.isValid) {
            return res.status(400).json({ message: validation.message });
        }

        const comment = await Comment.findById(req.params.commentId);
        if (!comment) {
            return res.status(404).json({ message: 'Comment not found' });
        }

        // Check if user owns the comment
        if (comment.user.toString() !== req.user.id) {
            return res.status(403).json({ message: 'Not authorized to update this comment' });
        }

        comment.text = text.trim();
        await comment.save();
        await comment.populate('user', 'username name');

        res.json(comment);
    } catch (err) {
        console.error("Update comment error:", err);
        res.status(500).json({ message: 'Error updating comment', error: err.message });
    }
};

// Delete comment
exports.deleteComment = async (req, res) => {
    try {
        const comment = await Comment.findById(req.params.commentId);
        if (!comment) {
            return res.status(404).json({ message: 'Comment not found' });
        }

        // Check if user owns the comment
        if (comment.user.toString() !== req.user.id) {
            return res.status(403).json({ message: 'Not authorized to delete this comment' });
        }

        // Remove comment from trip
        await RoadTrip.findByIdAndUpdate(comment.roadTrip, {
            $pull: { comments: req.params.commentId }
        });

        await Comment.findByIdAndDelete(req.params.commentId);
        res.status(204).send();
    } catch (err) {
        console.error("Delete comment error:", err);
        res.status(500).json({ message: 'Error deleting comment', error: err.message });
    }
};
