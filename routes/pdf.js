const express = require("express");
const multer = require("multer");
const fs = require("fs");
const path = require("path");
const router = express.Router();
const { verifyToken } = require("../middleware/authMiddleware"); // ✅ Correct function name
const PdfModel = require("../models/pdfModel");

// Ensure the directory exists
const pdfDirectory = path.join(__dirname, "../www/ddheavyhauling.xyz/pdfs");
if (!fs.existsSync(pdfDirectory)) {
    fs.mkdirSync(pdfDirectory, { recursive: true });
}

// Configure Multer for file storage
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, pdfDirectory);
    },
    filename: (req, file, cb) => {
        const uniqueName = Date.now() + path.extname(file.originalname);
        cb(null, uniqueName);
    }
});

const upload = multer({ storage });

// ✅ Route: POST /uploadPdf (Fixed)
router.post("/uploadPdf", verifyToken, upload.single("pdf"), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ error: "No file uploaded" });
        }

        const { username, email, role } = req.body;
        const fileUrl = `/pdfs/${req.file.filename}`;

        // Save file details in MongoDB
        const pdfEntry = new PdfModel({
            userId: email,
            username,
            email,
            role,
            fileUrl,
        });

        await pdfEntry.save();
        res.json({ message: "PDF uploaded successfully!", fileUrl });
    } catch (error) {
        console.error("PDF Upload Error:", error);
        res.status(500).json({ error: "Failed to upload PDF." });
    }
});

// ✅ Route: GET /pdfs (Secure & Structured)
router.get("/", verifyToken, isAdmin, async (req, res) => {
    try {
        // 🔹 Fetch all PDF reports (or filter by owner if needed)
        const pdfReports = await PdfModel.find().select("-__v"); // Exclude unnecessary fields

        if (!pdfReports.length) {
            return res.status(404).json({ message: "No PDF reports found" });
        }

        res.status(200).json({ success: true, pdfReports });
    } catch (error) {
        console.error("❌ Error fetching PDFs:", error);
        res.status(500).json({ error: "Internal server error" });
    }
});

module.exports = router;