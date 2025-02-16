const mongoose = require("mongoose");

const pdfSchema = new mongoose.Schema({
    userId: String,
    username: String,
    email: String,
    role: String,
    fileUrl: String,
    createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.models.PdfModel || mongoose.model("PdfModel", pdfSchema);