require("dotenv").config();
const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const path = require("path");
const multer = require("multer");
const fs = require("fs");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const User = require("./models/User"); // Ensure this model exists
const PdfModel = require("./models/pdfModel");

const app = express();
const PORT = process.env.PORT || 5150;
const MONGO_URI = process.env.MONGO_URI || "mongodb://127.0.0.1:27017/doubledhaulingapp";
const SECRET_KEY = process.env.JWT_SECRET || "your-secret-key";

app.use(cors({
    origin: function (origin, callback) {
        // Allow requests with no origin (like mobile apps or curl requests)
        if (!origin) return callback(null, true);
        console.log("processenv" + process.env.NODE_ENV);
        const allowedOrigins = process.env.NODE_ENV === 'production'
            ? ['https://ddheavyhauling.xyz', 'https://www.ddheavyhauling.xyz', '*']
            : ['http://localhost:5150', 'http://127.0.0.1:5150', 'http://localhost:8080', 'null', undefined];

        if (allowedOrigins.includes(origin) || !origin) {
            callback(null, true);
        } else {
            callback(new Error('Not allowed by CORS'));
        }
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept', 'Origin'],
    exposedHeaders: ['Content-Range', 'X-Content-Range']
}));

// Add preflight handling for all routes
app.options('*', cors());

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Your routes
const authRoutes = require('./routes/auth');
app.use('/auth', authRoutes);

const pdfRoutes = require("./routes/pdf");
app.use("/pdfs", pdfRoutes);

const photoRoutes = require("./routes/photo");
app.use("/photos", photoRoutes);

// Serve static files
app.use('/photos', express.static(path.join(__dirname, 'www/ddheavyhauling.xyz/photos')));
app.use(express.static('www'));

// ✅ MongoDB Connection
mongoose.connect(MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true
})
    .then(() => console.log("✅ MongoDB Connected"))
    .catch(err => console.error("❌ MongoDB Connection Error:", err));

// 🔹 Get User Info
app.get("/auth/user", async (req, res) => {
    try {
        const token = req.headers.authorization?.split(" ")[1];
        if (!token) {
            return res.status(401).json({ error: "Unauthorized" });
        }

        const decoded = jwt.verify(token, SECRET_KEY);
        const user = await User.findById(decoded.id).select("-password");
        if (!user) {
            return res.status(404).json({ error: "User not found" });
        }

        res.json({ success: true, user });
    } catch (error) {
        console.error("❌ Fetch User Error:", error);
        res.status(500).json({ error: "Failed to retrieve user." });
    }
});


// ✅ Start Server
app.listen(PORT, "0.0.0.0", () => {
    console.log(`✅ Server running on port ${PORT}`);
});