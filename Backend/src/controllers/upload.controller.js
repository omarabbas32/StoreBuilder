const multer = require('multer');
const path = require('path');
const fs = require('fs').promises;
const { v4: uuidv4 } = require('uuid');
const db = require('../config/database');

// Configure multer for file upload
const storage = multer.diskStorage({
    destination: async (req, file, cb) => {
        const storeId = req.params.storeId || 'temp';

        if (!storeId || storeId === 'undefined') {
            return cb(new Error('Store ID is required'));
        }

        const uploadDir = path.join(__dirname, '../../uploads', storeId);

        // Create directory if it doesn't exist
        try {
            await fs.mkdir(uploadDir, { recursive: true });
            cb(null, uploadDir);
        } catch (error) {
            cb(error);
        }
    },
    filename: (req, file, cb) => {
        const uniqueName = `${uuidv4()}${path.extname(file.originalname)}`;
        cb(null, uniqueName);
    }
});

// File filter
const fileFilter = (req, file, cb) => {
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif'];
    if (allowedTypes.includes(file.mimetype)) {
        cb(null, true);
    } else {
        cb(new Error('Invalid file type. Only JPEG, PNG, WebP, and GIF are allowed.'), false);
    }
};

const upload = multer({
    storage,
    fileFilter,
    limits: {
        fileSize: 5 * 1024 * 1024, // 5MB
    }
});

/**
 * Upload a new image
 */
exports.uploadImage = async (req, res) => {
    try {
        const { storeId } = req.params;
        const userId = req.user?.id;

        // Verify store ownership
        const store = await db.query(
            'SELECT * FROM stores WHERE id = $1 AND owner_id = $2',
            [storeId, userId]
        );

        if (store.rows.length === 0) {
            return res.status(404).json({ success: false, message: 'Store not found' });
        }

        if (!req.file) {
            return res.status(400).json({ success: false, message: 'No file uploaded' });
        }

        // Save file metadata to database
        const fileUrl = `/uploads/${storeId}/${req.file.filename}`;
        const result = await db.query(
            `INSERT INTO uploads (id, store_id, filename, original_name, file_path, file_size, mime_type, created_at)
             VALUES ($1, $2, $3, $4, $5, $6, $7, NOW())
             RETURNING *`,
            [
                uuidv4(),
                storeId,
                req.file.filename,
                req.file.originalname,
                fileUrl,
                req.file.size,
                req.file.mimetype
            ]
        );

        res.json({
            success: true,
            data: {
                id: result.rows[0].id,
                filename: result.rows[0].filename,
                originalName: result.rows[0].original_name,
                url: fileUrl,
                size: result.rows[0].file_size,
                mimeType: result.rows[0].mime_type,
                createdAt: result.rows[0].created_at
            }
        });
    } catch (error) {
        console.error('Upload error:', error);
        res.status(500).json({ success: false, message: 'Failed to upload image', error: error.message });
    }
};

/**
 * List all uploads for a store
 */
exports.listUploads = async (req, res) => {
    try {
        const { storeId } = req.params;
        const userId = req.user?.id;

        // Verify store ownership
        const store = await db.query(
            'SELECT * FROM stores WHERE id = $1 AND owner_id = $2',
            [storeId, userId]
        );

        if (store.rows.length === 0) {
            return res.status(404).json({ success: false, message: 'Store not found' });
        }

        const result = await db.query(
            `SELECT id, filename, original_name, file_path, file_size, mime_type, created_at
             FROM uploads
             WHERE store_id = $1
             ORDER BY created_at DESC`,
            [storeId]
        );

        res.json({
            success: true,
            data: result.rows.map(row => ({
                id: row.id,
                filename: row.filename,
                originalName: row.original_name,
                url: row.file_path,
                size: row.file_size,
                mimeType: row.mime_type,
                createdAt: row.created_at
            }))
        });
    } catch (error) {
        console.error('Error fetching uploads:', error);
        res.status(500).json({ success: false, message: 'Failed to fetch uploads', error: error.message });
    }
};

/**
 * Delete an upload
 */
exports.deleteUpload = async (req, res) => {
    try {
        const { storeId, uploadId } = req.params;
        const userId = req.user?.id;

        // Verify store ownership
        const store = await db.query(
            'SELECT * FROM stores WHERE id = $1 AND owner_id = $2',
            [storeId, userId]
        );

        if (store.rows.length === 0) {
            return res.status(404).json({ success: false, message: 'Store not found' });
        }

        // Get upload info
        const upload = await db.query(
            'SELECT * FROM uploads WHERE id = $1 AND store_id = $2',
            [uploadId, storeId]
        );

        if (upload.rows.length === 0) {
            return res.status(404).json({ success: false, message: 'Upload not found' });
        }

        // Delete file from filesystem
        const filePath = path.join(__dirname, '../..', upload.rows[0].file_path);
        try {
            await fs.unlink(filePath);
        } catch (error) {
            console.error('Error deleting file:', error);
            // Continue even if file deletion fails
        }

        // Delete from database
        await db.query('DELETE FROM uploads WHERE id = $1', [uploadId]);

        res.json({ success: true, message: 'Upload deleted successfully' });
    } catch (error) {
        console.error('Delete error:', error);
        res.status(500).json({ success: false, message: 'Failed to delete upload', error: error.message });
    }
};

exports.upload = upload;
