const express = require('express');
const router = express.Router();
const authenticate = require('../middleware/auth.middleware');
const uploadController = require('../controllers/upload.controller');
const upload = uploadController.upload;

// Upload routes
router.post('/', authenticate, upload.single('file'), uploadController.uploadImage);
router.get('/', authenticate, uploadController.listUploads);
router.delete('/:uploadId', authenticate, uploadController.deleteUpload);

module.exports = router;
