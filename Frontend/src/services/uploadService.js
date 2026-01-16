import api from './api';
import toast from 'react-hot-toast';

/**
 * Upload Service for managing store assets
 */
const uploadService = {
    /**
     * Upload an image file
     * @param {File} file - The image file to upload
     * @param {string} storeId - The store ID
     * @returns {Promise<{success: boolean, data: object}>}
     */
    async uploadImage(file, storeId) {
        try {
            // Validate file type
            const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif'];
            if (!validTypes.includes(file.type)) {
                toast.error('Invalid file type. Only JPEG, PNG, WebP, and GIF are allowed.');
                return { success: false, error: 'Invalid file type' };
            }

            // Validate file size (5MB max)
            const maxSize = 5 * 1024 * 1024; // 5MB in bytes
            if (file.size > maxSize) {
                toast.error('File size exceeds 5MB limit.');
                return { success: false, error: 'File too large' };
            }

            // Create form data
            const formData = new FormData();
            formData.append('file', file);

            // Upload with progress tracking
            const response = await api.post(`/stores/${storeId}/uploads`, formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
                onUploadProgress: (progressEvent) => {
                    const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
                    // You can emit this to a progress UI component if needed
                    console.log(`Upload progress: ${percentCompleted}%`);
                },
            });

            if (response.data.success) {
                toast.success('Image uploaded successfully!');
                return response.data;
            } else {
                toast.error('Upload failed. Please try again.');
                return { success: false, error: 'Upload failed' };
            }
        } catch (error) {
            console.error('Upload error:', error);
            toast.error(error.response?.data?.message || 'Failed to upload image');
            return { success: false, error: error.message };
        }
    },

    /**
     * List all uploaded images for a store
     * @param {string} storeId - The store ID
     * @returns {Promise<{success: boolean, data: array}>}
     */
    async listImages(storeId) {
        try {
            const response = await api.get(`/stores/${storeId}/uploads`);
            return response.data;
        } catch (error) {
            console.error('Error fetching uploads:', error);
            toast.error('Failed to load images');
            return { success: false, data: [], error: error.message };
        }
    },

    /**
     * Delete an uploaded image
     * @param {string} imageId - The image upload ID
     * @param {string} storeId - The store ID
     * @returns {Promise<{success: boolean}>}
     */
    async deleteImage(imageId, storeId) {
        try {
            const response = await api.delete(`/stores/${storeId}/uploads/${imageId}`);

            if (response.data.success) {
                toast.success('Image deleted successfully');
                return response.data;
            } else {
                toast.error('Failed to delete image');
                return { success: false };
            }
        } catch (error) {
            console.error('Delete error:', error);
            toast.error(error.response?.data?.message || 'Failed to delete image');
            return { success: false, error: error.message };
        }
    },
};

export default uploadService;
