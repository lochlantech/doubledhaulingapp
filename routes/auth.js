const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { verifyToken, isAdmin } = require('../middleware/authMiddleware');

const router = express.Router();

// Helper function to handle errors
const handleError = (res, error, message = "Internal server error", status = 500) => {
    console.error(message, error);
    res.status(status).json({ error: message });
};

// Register a new user
router.post('/signup', async (req, res) => {
    try {
        const { username, email, password, role } = req.body;

        // Validate request data
        if (!username || !email || !password || !role) {
            return res.status(400).json({ error: "All fields are required" });
        }

        // Hash the password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Create a new user
        const newUser = new User({ username, email, password: hashedPassword, role });
        await newUser.save();

        res.status(201).json({ message: "User registered successfully" });
    } catch (error) {
        handleError(res, error, "Error registering user");
    }
});

// Login a user
router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;

        // Validate request data
        if (!email || !password) {
            return res.status(400).json({ error: "Email and password are required" });
        }

        // Find the user by email
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(404).json({ error: "User not found" });
        }

        // Compare passwords
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(401).json({ error: "Invalid credentials" });
        }

        // Generate a JWT token
        const token = jwt.sign(
            { id: user._id, role: user.role },
            process.env.JWT_SECRET,
            { expiresIn: '1h' }
        );

        res.status(200).json({ token, role: user.role });
    } catch (error) {
        handleError(res, error, "Error logging in user");
    }
});

// Get all users (Admin only)
router.get('/users', verifyToken, isAdmin, async (req, res) => {
    try {
        const users = await User.find({}, 'username email role'); // Only return specific fields
        res.status(200).json(users);
    } catch (error) {
        handleError(res, error, "Error fetching users");
    }
});

// Delete a user (Admin only)
router.delete('/users/:id', verifyToken, isAdmin, async (req, res) => {
    try {
        const { id } = req.params;

        const deletedUser = await User.findByIdAndDelete(id);
        if (!deletedUser) {
            return res.status(404).json({ error: "User not found" });
        }

        res.status(200).json({ message: "User deleted successfully" });
    } catch (error) {
        handleError(res, error, "Error deleting user");
    }
});

module.exports = router;