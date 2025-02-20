const express = require("express");
const multer = require("multer");
const fs = require("fs");
const path = require("path");
const router = express.Router();
const { verifyToken } = require("../middleware/authMiddleware");
const PhotoModel = require("../models/photoModel");
const User = require("../models/User");

// Ensure the photos storage directory exists
const photoDirectory = path.join(__dirname, "../www/ddheavyhauling.xyz/photos");
if (!fs.existsSync(photoDirectory)) {
  fs.mkdirSync(photoDirectory, { recursive: true });
}

// Configure Multer for photo storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, photoDirectory);
  },
  filename: (req, file, cb) => {
    const uniqueName = `${Date.now()}-${Math.round(Math.random() * 1E9)}${path.extname(file.originalname)}`;
    cb(null, uniqueName);
  }
});

// File filter to accept only images
const fileFilter = (req, file, cb) => {
  if (file.mimetype.startsWith('image/')) {
    cb(null, true);
  } else {
    cb(new Error('Not an image! Please upload only images.'), false);
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB limit
  }
});

// Route: Upload Photo
router.post("/upload", verifyToken, upload.single("photo"), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: "No photo uploaded" });
    }
    console.log(req.file);

    // Get user data from the decoded token
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    const photoEntry = new PhotoModel({
      userId: req.user.id,
      username: user.username,
      photoUrl: `/photos/${req.file.filename}`,
      description: req.body.description || ''
    });

    await photoEntry.save();
    res.json({
      message: "Photo uploaded successfully!",
      photo: photoEntry
    });

  } catch (error) {
    console.error("❌ Photo Upload Error:", error);
    res.status(500).json({ error: "Failed to upload photo." });
  }
});

// Route: Get All Photos
router.get("/", verifyToken, async (req, res) => {
  try {
    const photos = await PhotoModel.find().sort({ createdAt: -1 });
    res.json(photos);
  } catch (error) {
    console.error("❌ Error fetching photos:", error);
    res.status(500).json({ error: "Failed to fetch photos." });
  }
});

// Route: Delete Photo
router.delete("/:id", verifyToken, async (req, res) => {
  try {
    const photo = await PhotoModel.findById(req.params.id);
    if (!photo) {
      return res.status(404).json({ error: "Photo not found" });
    }

    // Check if user owns the photo or is admin
    if (photo.userId.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ error: "Not authorized" });
    }

    // Delete file from filesystem
    const filePath = path.join(photoDirectory, path.basename(photo.photoUrl));
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }

    await PhotoModel.deleteOne({ _id: photo._id });
    res.json({ message: "Photo deleted successfully" });

  } catch (error) {
    console.error("❌ Error deleting photo:", error);
    res.status(500).json({ error: "Failed to delete photo" });
  }
});

// Route: Get User's Photos
router.get("/user", verifyToken, async (req, res) => {
  try {
    const photos = await PhotoModel.find({ userId: req.user.id }).sort({ createdAt: -1 });
    res.json(photos);
  } catch (error) {
    console.error("❌ Error fetching user photos:", error);
    res.status(500).json({ error: "Failed to fetch your photos." });
  }
});

module.exports = router; 