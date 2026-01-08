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
}

module.exports = new MediaController();
