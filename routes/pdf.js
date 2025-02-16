const express = require("express");
const multer = require("multer");
const fs = require("fs");
const path = require("path");
const router = express.Router();
const { verifyToken, isAdmin } = require("../middleware/authMiddleware"); // ✅ Added isAdmin
const PdfModel = require("../models/pdfModel");

// ✅ Ensure the PDF storage directory exists
const pdfDirectory = path.join(__dirname, "../www/ddheavyhauling.xyz/pdfs");
if (!fs.existsSync(pdfDirectory)) {
    fs.mkdirSync(pdfDirectory, { recursive: true });
}

// ✅ Configure Multer for file storage
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

// ✅ Route: Upload PDF (POST /pdfs/upload)
router.post("/upload", verifyToken, upload.single("pdf"), async (req, res) => {
    try {
        if (!req.file || !req.file.filename) {  // ✅ Added check for filename
            return res.status(400).json({ error: "No file uploaded or file processing error" });
        }

        const { username, email, role } = req.body;
        const fileUrl = `/pdfs/${req.file.filename}`;

        // Save file details in MongoDB
        const pdfEntry = new PdfModel({
            userId: req.user.id,
            username,
            email,
            role,
            fileUrl,
        });

        await pdfEntry.save();
        console.log("✅ PDF uploaded and saved:", fileUrl);

        // ✅ Always return JSON
        return res.json({ message: "PDF uploaded successfully!", fileUrl });

    } catch (error) {
        console.error("❌ PDF Upload Error:", error);
        return res.status(500).json({ error: "Failed to upload PDF." });
    }
});

// ✅ Route: Get PDFs (GET /pdfs)
router.get("/", verifyToken, async (req, res) => {  // ✅ Removed isAdmin if not needed
    try {
        const pdfReports = await PdfModel.find().select("-__v"); // Exclude __v field

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