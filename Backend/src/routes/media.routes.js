const express = require("express");
const router = express.Router();
const MediaController = require("../controllers/media.controller");
const {
  upload,
  uploadMultipleImages,
} = require("../middleware/upload.middleware");
const authMiddleware = require("../middleware/auth.middleware");

// Upload a single image
router.post(
  "/upload",
  authMiddleware,
  upload.single("image"),
  MediaController.uploadImage
);
router.post(
  "/upload-multiple",
  authMiddleware,
  uploadMultipleImages,
  MediaController.uploadMultipleImages
);

module.exports = router;
