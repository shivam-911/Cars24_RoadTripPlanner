const User = require('../Models/User.Models.js'); 
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// Input validation helper
const validateInput = (fields) => {
    for (const [field, value] of Object.entries(fields)) {
        if (!value || value.toString().trim() === '') {
            return { isValid: false, message: `${field} is required` };
        }
    }
    return { isValid: true };
};

// User Registration
exports.register = async (req, res) => {
    try {
        const { name, username, email, password } = req.body;

        // Input validation
        const validation = validateInput({ name, username, email, password });
        if (!validation.isValid) {
            return res.status(400).json({ message: validation.message });
        }

        // Email validation
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            return res.status(400).json({ message: 'Please enter a valid email address' });
        }

        // Password validation
        if (password.length < 6) {
            return res.status(400).json({ message: 'Password must be at least 6 characters long' });
        }

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

        const user = new User({
            name: name.trim(),
            username: username.toLowerCase().trim(),
            email: email.toLowerCase().trim(),
            password: hashedPassword,
        });

        await user.save();

        // Generate token immediately after registration
        const payload = { user: { id: user.id } };
        const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '7d' });

        res.status(201).json({ 
            message: 'User registered successfully',
            token,
            user: {
                id: user.id,
                name: user.name,
                username: user.username,
                email: user.email
            }
        });

    } catch (error) {
        console.error('Registration error:', error.message);
        res.status(500).json({ message: 'Server Error during registration' });
    }
};

// User Login
exports.login = async (req, res) => {
    try {
        const { email, password } = req.body;

        // Input validation
        const validation = validateInput({ email, password });
        if (!validation.isValid) {
            return res.status(400).json({ message: validation.message });
        }

        const user = await User.findOne({ email: email.toLowerCase().trim() });
        if (!user) {
            return res.status(400).json({ message: 'Invalid email or password' });
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).json({ message: 'Invalid email or password' });
        }

        const payload = { user: { id: user.id } };
        const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '7d' });

        res.json({ 
            token,
            user: {
                id: user.id,
                name: user.name,
                username: user.username,
                email: user.email
            }
        });

    } catch (error) {
        console.error('Login error:', error.message);
        res.status(500).json({ message: 'Server error during login' });
    }
};

// Get current user profile
exports.getProfile = async (req, res) => {
    try {
        const user = await User.findById(req.user.id).select('-password');
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        res.json(user);
    } catch (error) {
        console.error('Get profile error:', error.message);
        res.status(500).json({ message: 'Server error' });
    }
};
