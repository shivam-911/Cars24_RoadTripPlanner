import express from "express";

const app = express();
app.use(express.json());
// import middlewares
import logger from "./middleware/logger.middleware.js";
import auth from "./middleware/auth.middleware.js";
import errorHandler from "./middleware/error.middleware.js";


// import routes
import userRoutes from "./routes/user.routes.js";
import roadTripRoutes from "./routes/roadTrip.routes.js";
import reviewRoutes from "./routes/review.routes.js";

// apply logger to all requests
app.use(logger)

// routes declaration
app.use("/api/users", userRoutes);
app.use("/api/trips", roadTripRoutes);
app.use("/api/reviews", reviewRoutes);

// error handling
app.use(errorHandler);

export { app };
