const express = require("express");
const router = express.Router();
const { authenticateUser } = require("../middleware/authMiddleware");
const PDFReport = require("../models/PDFReport"); // Assume your model is named this

// Route: GET /pdfs
router.get("/", authenticateUser, async (req, res) => {
    try {
        const { role, userId } = req.user;

        let pdfReports;
        if (role === "admin") {
            // Admins get all PDF reports
            pdfReports = await PDFReport.find();
        } else {
            // Staff only see their own PDFs
            pdfReports = await PDFReport.find({ userId });
        }

        res.json(pdfReports);
    } catch (error) {
        console.error("Error fetching PDF reports:", error);
        res.status(500).json({ message: "Server error" });
    }
});

module.exports = router;