class UploadService {
    async uploadFile(file) {
        // With multer-storage-cloudinary, the file object already contains the cloudinary URL and details
        return {
            url: file.path, // Cloudinary secure URL
            name: file.originalname,
            public_id: file.filename // Cloudinary public_id
        };
    }

    async uploadMultiple(files) {
        if (!files || files.length === 0) return [];
        return files.map(file => ({
            url: file.path,
            name: file.originalname,
            public_id: file.filename
        }));
    }
}

module.exports = new UploadService();
