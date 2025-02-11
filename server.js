require("dotenv").config(); // Load environment variables
const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");

const app = express();
const PORT = process.env.PORT || 5150;
const MONGO_URI = process.env.MONGO_URI || "mongodb://127.0.0.1:27017/doubledhaulingapp";

// ✅ Middleware
app.use(express.json());
app.use(cors({
    origin: ["https://www.ddheavyhauling.xyz", "http://localhost:5150"],  // Allow frontend & local testing
    methods: "GET,POST,PUT,DELETE,OPTIONS",
    allowedHeaders: "Content-Type,Authorization",
    credentials: true
}));

// ✅ Handle Preflight Requests
app.options("*", cors());

// ✅ MongoDB Connection
mongoose.connect(MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true
})
.then(() => console.log("✅ MongoDB Connected"))
.catch(err => console.error("❌ MongoDB Connection Error:", err));

// ✅ Routes
app.get("/", (req, res) => {
    res.send("🚀 API is running...");
});

// Import and use your auth routes
const authRoutes = require("./routes/auth"); 
app.use("/auth", authRoutes);

// ✅ Start Server
app.listen(PORT, "0.0.0.0", () => {
    console.log(`✅ Server running on port ${PORT}`);
});
