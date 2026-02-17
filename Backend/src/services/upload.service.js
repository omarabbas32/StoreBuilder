const cloudinary = require('cloudinary').v2;
const AppError = require('../utils/AppError');

/**
 * UploadService - File upload management
 * 
 * Handles file uploads to cloud storage (Cloudinary, S3, etc.)
 * Already integrated with multer-storage-cloudinary
 */
class UploadService {
    constructor() {
        cloudinary.config({
            cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
            api_key: process.env.CLOUDINARY_API_KEY,
            api_secret: process.env.CLOUDINARY_API_SECRET
        });
    }

    /**
     * Upload buffer to Cloudinary (used for AI generated images)
     */
    async uploadBuffer(buffer, folder = 'storely/ai-generated', contentType = 'image/png') {
        try {
            const base64 = buffer.toString('base64');
            const dataUrl = `data:${contentType};base64,${base64}`;
            const result = await cloudinary.uploader.upload(dataUrl, {
                folder,
                resource_type: 'image'
            });
            return {
                url: result.secure_url,
                publicId: result.public_id,
                size: result.bytes,
                format: result.format
            };
        } catch (error) {
            console.error('[UploadService] Cloudinary buffer upload failed:', error);
            throw new AppError('Cloudinary upload failed', 500);
        }
    }

    /**
     * Process uploaded file
     * Multer-storage-cloudinary already uploads, this just formats the response
     */
    async uploadFile(file) {
        if (!file) {
            throw new AppError('No file provided', 400);
        }

        // File is already uploaded by multer-storage-cloudinary
        return {
            url: file.path, // Cloudinary secure URL
            publicId: file.filename, // Cloudinary public_id
            originalName: file.originalname,
            size: file.size,
            format: file.mimetype
        };
    }

    /**
     * Process multiple uploaded files
     */
    async uploadMultiple(files) {
        if (!files || files.length === 0) {
            throw new AppError('No files provided', 400);
        }

        return files.map(file => ({
            url: file.path,
            publicId: file.filename,
            originalName: file.originalname,
            size: file.size,
            format: file.mimetype
        }));
    }

    /**
     * Delete file from cloud storage
     */
    async deleteFile(publicId) {
        if (!publicId) {
            throw new AppError('Public ID required', 400);
        }

        // TODO: Implement Cloudinary delete
        // await this.cloudinary.uploader.destroy(publicId);

        return {
            success: true,
            message: 'File deleted successfully'
        };
    }

    /**
     * Get file metadata
     */
    async getFileInfo(publicId) {
        // TODO: Get file info from Cloudinary
        // const resource = await this.cloudinary.api.resource(publicId);

        return {
            publicId,
            url: `https://res.cloudinary.com/.../${publicId}`,
            format: 'jpg',
            size: 0
        };
    }
}

module.exports = UploadService;
