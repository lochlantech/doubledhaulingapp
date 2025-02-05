require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
})
.then(() => console.log("MongoDB Connected"))
.catch(err => {
    console.error("MongoDB connection error:", err);
    process.exit(1); // Exit if connection fails
});

const authRoutes = require('./routes/auth'); // Adjust the path if needed
app.use('/auth', authRoutes);

const PORT = process.env.PORT || 5150; // Change to 5001 or any available port
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

console.log("MONGO_URI:", process.env.MONGO_URI);