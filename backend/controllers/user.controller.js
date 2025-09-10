import User from "../models/User.js";

// create user
export const createUser = async (req, res) => {
  try {
    const user = await User.create(req.body);
    res.status(201).json(user);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// get all users
export const getUsers = async (req, res) => {
  try {
    const users = await User.find().populate("createdTrips savedTrips");
    res.json(users);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// get single user
export const getUserById = async (req, res) => {
  try {
    const user = await User.findById(req.params.id).populate(
      "createdTrips savedTrips"
    );
    if (!user) return res.status(404).json({ error: "User not found" });
    res.json(user);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// update user
export const updateUser = async (req, res) => {
  try {
    const updated = await User.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
    });
    res.json(updated);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// delete user
export const deleteUser = async (req, res) => {
  try {
    await User.findByIdAndDelete(req.params.id);
    res.json({ message: "User deleted" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
