import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    username: {
      type: String,
      required: true,
      unique: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
    },
    password: {
      type: String,
      required: true,
    },
    createdTrips: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "RoadTrip",
      },
    ],
    savedTrips: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "RoadTrip",
      },
    ],
  },
  { timestamps: true }
);

export default mongoose.model("User", userSchema);
