import express from "express";
import {
  createRoadTrip,
  getRoadTrips,
  getRoadTripById,
  updateRoadTrip,
  deleteRoadTrip,
} from "../controllers/roadTrip.controller.js";

const router = express.Router();

router.post("/", createRoadTrip);
router.get("/", getRoadTrips);
router.get("/:id", getRoadTripById);
router.put("/:id", updateRoadTrip);
router.delete("/:id", deleteRoadTrip);

export default router;
