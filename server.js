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

const authRoutes = require('./routes/auth');
app.use('/auth', authRoutes);

app.use(express.json());


// ✅ MongoDB Connection
mongoose.connect(MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true
})
.then(() => console.log("✅ MongoDB Connected"))
.catch(err => console.error("❌ MongoDB Connection Error:", err));

// ✅ Set up file storage for PDF uploads
const storage = multer.diskStorage({
    destination: "/var/www/ddheavyhauling.xyz/pdfs/",
    filename: (req, file, cb) => {
        const uniqueName = Date.now() + path.extname(file.originalname);
        cb(null, uniqueName);
    }
});

const upload = multer({ storage });

// ✅ PDF Upload Schema
const pdfSchema = new mongoose.Schema({
    userId: String,
    username: String,
    email: String,
    role: String,
    fileUrl: String,
    createdAt: { type: Date, default: Date.now }
});

const PDFReport = mongoose.model("PDFReport", pdfSchema);

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

// ✅ PDF Upload and Retrieval

// 🔹 Upload PDFs
app.post("/uploadPdf", upload.single("pdf"), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ error: "No file uploaded" });
        }

        const { username, email, role } = req.body;
        const filePath = `/pdfs/${req.file.filename}`;

        // ✅ Ensure correct permissions
        fs.chownSync(`/var/www/ddheavyhauling.xyz/pdfs/${req.file.filename}`, 33, 33); // www-data
        fs.chmodSync(`/var/www/ddheavyhauling.xyz/pdfs/${req.file.filename}`, 0o644);

        // ✅ Save file details to MongoDB
        const pdfEntry = new PDFReport({
            userId: email,
            username,
            email,
            role,
            fileUrl: filePath,
        });

        await pdfEntry.save();
        res.json({ message: "PDF uploaded successfully!", fileUrl });
    } catch (error) {
        console.error("❌ PDF Upload Error:", error);
        res.status(500).json({ error: "Failed to upload PDF." });
    }
});

// 🔹 Fetch PDFs Based on User Role
app.get("/getPdfs", async (req, res) => {
    try {
        const { "user-role": userRole, "user-email": userEmail } = req.headers;
        if (!userRole || !userEmail) {
            return res.status(400).json({ error: "Missing user role or email in request headers" });
        }

        let pdfs;
        if (userRole === "admin") {
            pdfs = await PDFReport.find({});
        } else {
            pdfs = await PDFReport.find({ username: userEmail });
        }

        res.json({ success: true, data: pdfs });
    } catch (error) {
        console.error("❌ Fetch PDFs Error:", error);
        res.status(500).json({ success: false, error: error.message });
    }
});

// ✅ Start Server
app.listen(PORT, "0.0.0.0", () => {
    console.log(`✅ Server running on port ${PORT}`);
});