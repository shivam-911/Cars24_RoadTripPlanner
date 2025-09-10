import RoadTrip from "../models/RoadTrip.js";

// create trip
export const createRoadTrip = async (req, res) => {
  try {
    const trip = await RoadTrip.create(req.body);
    res.status(201).json(trip);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// get all trips
export const getRoadTrips = async (req, res) => {
  try {
    const trips = await RoadTrip.find().populate("createdBy likes reviews");
    res.json(trips);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// get single trip
export const getRoadTripById = async (req, res) => {
  try {
    const trip = await RoadTrip.findById(req.params.id).populate(
      "createdBy likes reviews"
    );
    if (!trip) return res.status(404).json({ error: "Trip not found" });
    res.json(trip);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// update trip
export const updateRoadTrip = async (req, res) => {
  try {
    const updated = await RoadTrip.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
    });
    res.json(updated);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// delete trip
export const deleteRoadTrip = async (req, res) => {
  try {
    await RoadTrip.findByIdAndDelete(req.params.id);
    res.json({ message: "Trip deleted" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
