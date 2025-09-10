import Review from "../models/Review.js";

// create review
export const createReview = async (req, res) => {
  try {
    const review = await Review.create(req.body);
    res.status(201).json(review);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// get all reviews
export const getReviews = async (req, res) => {
  try {
    const reviews = await Review.find().populate("user roadTrip");
    res.json(reviews);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// get single review
export const getReviewById = async (req, res) => {
  try {
    const review = await Review.findById(req.params.id).populate(
      "user roadTrip"
    );
    if (!review) return res.status(404).json({ error: "Review not found" });
    res.json(review);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// update review
export const updateReview = async (req, res) => {
  try {
    const updated = await Review.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
    });
    res.json(updated);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// delete review
export const deleteReview = async (req, res) => {
  try {
    await Review.findByIdAndDelete(req.params.id);
    res.json({ message: "Review deleted" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
