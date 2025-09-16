const express = require('express');
const router = express.Router();
const roadTripController = require('../Controllers/RoadTrip.Controllers.js');
const authMiddleware = require('../Middlewares/auth.Middlewares.js');
const upload = require('../config/multer.js');

// Public routes
router.get('/', roadTripController.getAllRoadTrips);
router.get('/search', roadTripController.searchTrips);
router.get('/:id', roadTripController.getTripById);

// Protected routes
router.get('/user/mytrips', authMiddleware, roadTripController.getMyTrips);
router.post('/', authMiddleware, upload.array('images', 5), roadTripController.createRoadTrip);
router.put('/:id', authMiddleware, upload.array('images', 5), roadTripController.updateRoadTrip);
router.delete('/:id', authMiddleware, roadTripController.deleteRoadTrip);
router.put('/:id/like', authMiddleware, roadTripController.likeTrip);

module.exports = router;
