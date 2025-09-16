const User = require('../Models/User.Models');
const bcrypt = require('bcryptjs');

// Input validation
const validateUserInput = (data, isUpdate = false) => {
    const { name, username, email, password } = data;

    if (!isUpdate) {
        if (!name || name.trim().length < 2) {
            return { isValid: false, message: 'Name must be at least 2 characters long' };
        }
        if (!username || username.trim().length < 3) {
            return { isValid: false, message: 'Username must be at least 3 characters long' };
        }
        if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
            return { isValid: false, message: 'Please enter a valid email address' };
        }
        if (!password || password.length < 6) {
            return { isValid: false, message: 'Password must be at least 6 characters long' };
        }
    } else {
        if (name && name.trim().length < 2) {
            return { isValid: false, message: 'Name must be at least 2 characters long' };
        }
        if (username && username.trim().length < 3) {
            return { isValid: false, message: 'Username must be at least 3 characters long' };
        }
        if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
            return { isValid: false, message: 'Please enter a valid email address' };
        }
        if (password && password.length < 6) {
            return { isValid: false, message: 'Password must be at least 6 characters long' };
        }
    }

    return { isValid: true };
};

// CREATE a new user (Signup) - Legacy endpoint, prefer auth/register
exports.createUser = async (req, res) => {
    try {
        const validation = validateUserInput(req.body);
        if (!validation.isValid) {
            return res.status(400).json({ message: validation.message });
        }

        const { name, username, email, password } = req.body;

        // Check if user already exists
        const existingUser = await User.findOne({
            $or: [{ email: email.toLowerCase() }, { username: username.toLowerCase() }]
        });

        if (existingUser) {
            const field = existingUser.email === email.toLowerCase() ? 'Email' : 'Username';
            return res.status(400).json({ message: `${field} already exists` });
        }

        const salt = await bcrypt.genSalt(12);
        const hashedPassword = await bcrypt.hash(password, salt);

        const newUser = await User.create({
            name: name.trim(),
            username: username.toLowerCase().trim(),
            email: email.toLowerCase().trim(),
            password: hashedPassword
        });

        // Remove password from response
        const userResponse = newUser.toObject();
        delete userResponse.password;

        res.status(201).json(userResponse);
    } catch (error) {
        console.error("Create user error:", error);
        if (error.code === 11000) {
            const field = Object.keys(error.keyValue)[0];
            res.status(400).json({ message: `${field} already exists` });
        } else {
            res.status(500).json({ message: 'Error creating user', error: error.message });
        }
    }
};

// READ all users (Admin only - should be protected)
exports.getAllUsers = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 20;
        const skip = (page - 1) * limit;

        const users = await User.find()
            .select('-password') // Exclude passwords
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit);

        const total = await User.countDocuments();

        res.status(200).json({
            users,
            pagination: {
                currentPage: page,
                totalPages: Math.ceil(total / limit),
                totalUsers: total,
                hasNext: page < Math.ceil(total / limit),
                hasPrev: page > 1
            }
        });
    } catch (error) {
        console.error("Get all users error:", error);
        res.status(500).json({ message: 'Error fetching users', error: error.message });
    }
};

// UPDATE a user by ID
exports.updateUser = async (req, res) => {
    try {
        const validation = validateUserInput(req.body, true);
        if (!validation.isValid) {
            return res.status(400).json({ message: validation.message });
        }

        const updateData = { ...req.body };

        // Hash password if provided
        if (updateData.password) {
            const salt = await bcrypt.genSalt(12);
            updateData.password = await bcrypt.hash(updateData.password, salt);
        }

        // Normalize email and username if provided
        if (updateData.email) {
            updateData.email = updateData.email.toLowerCase().trim();
        }
        if (updateData.username) {
            updateData.username = updateData.username.toLowerCase().trim();
        }
        if (updateData.name) {
            updateData.name = updateData.name.trim();
        }

        const updatedUser = await User.findByIdAndUpdate(
            req.params.id, 
            updateData, 
            { new: true, runValidators: true }
        ).select('-password');

        if (!updatedUser) {
            return res.status(404).json({ message: 'User not found' });
        }

        res.status(200).json(updatedUser);
    } catch (error) {
        console.error("Update user error:", error);
        if (error.code === 11000) {
            const field = Object.keys(error.keyValue)[0];
            res.status(400).json({ message: `${field} already exists` });
        } else {
            res.status(500).json({ message: 'Error updating user', error: error.message });
        }
    }
};

// DELETE a user by ID
exports.deleteUser = async (req, res) => {
    try {
        const user = await User.findById(req.params.id);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        await User.findByIdAndDelete(req.params.id);
        res.status(204).send(); 
    } catch (error) {
        console.error("Delete user error:", error);
        res.status(500).json({ message: 'Error deleting user', error: error.message });
    }
};

// GET user profile
exports.getUserProfile = async (req, res) => {
    try {
        const user = await User.findById(req.params.id)
            .select('-password')
            .populate('createdTrips', 'title coverImage createdAt')
            .populate('savedTrips', 'title coverImage createdAt');

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        res.status(200).json(user);
    } catch (error) {
        console.error("Get user profile error:", error);
        res.status(500).json({ message: 'Error fetching user profile', error: error.message });
    }
};
