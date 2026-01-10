class MediaController {
    async uploadImage(req, res) {
        try {
            if (!req.file) {
                return res.status(400).json({ error: 'No image provided' });
            }

            // The file is already uploaded to Cloudinary by the multer-storage-cloudinary middleware
            // req.file.path contains the secure URL
            res.status(200).json({
                url: req.file.path,
                public_id: req.file.filename,
                success: true
            });
        } catch (error) {
            console.error('Upload Error:', error);
            res.status(500).json({ error: 'Failed to upload image' });
        }
    }
    async uploadMultipleImages(req, res) {
        try {
            if (!req.files || req.files.length === 0) {
                return res.status(400).json({ error: 'No images provided' });
            }

            const uploadedImages = req.files.map(file => ({
                url: file.path,
                public_id: file.filename
            }));

            res.status(200).json({
                images: uploadedImages,
                success: true
            });
        } catch (error) {
            console.error('Upload Error:', error);
            res.status(500).json({ error: 'Failed to upload images' });
        }
    }
}

module.exports = new MediaController();
