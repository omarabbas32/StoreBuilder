import { useState } from 'react';
import { Upload, X, ImageIcon, Loader2 } from 'lucide-react';
import imageCompression from 'browser-image-compression';
import storeService from '../../services/storeService';
import './ImageUpload.css';

const ImageUpload = ({ value, onChange, label }) => {
    const [uploading, setUploading] = useState(false);
    const [compressing, setCompressing] = useState(false);
    const [progress, setProgress] = useState(0);
    const [error, setError] = useState(null);
    const [previewUrl, setPreviewUrl] = useState(null);
    const [originalSize, setOriginalSize] = useState(null);
    const [compressedSize, setCompressedSize] = useState(null);
    const [retryCount, setRetryCount] = useState(0);

    const formatFileSize = (bytes) => {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
    };

    const compressImage = async (file) => {
        const options = {
            maxSizeMB: 1, // Max file size 1MB
            maxWidthOrHeight: 1920, // Max dimensions
            useWebWorker: true,
            quality: 0.8, // 80% quality
            onProgress: (percent) => {
                setProgress(Math.round(percent / 2)); // Compression is first 50% of progress
            },
        };

        try {
            setCompressing(true);
            const compressedFile = await imageCompression(file, options);
            setCompressedSize(compressedFile.size);
            return compressedFile;
        } catch (error) {
            console.error('Compression error:', error);
            throw new Error('Failed to compress image');
        } finally {
            setCompressing(false);
        }
    };

    const uploadWithRetry = async (file, attempt = 1) => {
        const maxRetries = 3;

        try {
            const formData = new FormData();
            formData.append('image', file);

            // Simulate progress for upload phase (50-100%)
            setProgress(50);
            const progressInterval = setInterval(() => {
                setProgress(prev => {
                    if (prev >= 95) {
                        clearInterval(progressInterval);
                        return prev;
                    }
                    return prev + 5;
                });
            }, 300);

            const result = await storeService.uploadImage(formData);
            clearInterval(progressInterval);
            setProgress(100);

            if (result.success) {
                return result.data.url;
            } else {
                throw new Error(result.error);
            }
        } catch (error) {
            if (attempt < maxRetries) {
                setRetryCount(attempt);
                console.log(`Upload failed, retrying... (${attempt}/${maxRetries})`);
                await new Promise(resolve => setTimeout(resolve, 1000 * attempt)); // Exponential backoff
                return uploadWithRetry(file, attempt + 1);
            }
            throw error;
        }
    };

    const handleFileChange = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        // Reset states
        setError(null);
        setProgress(0);
        setRetryCount(0);
        setOriginalSize(file.size);
        setCompressedSize(null);

        // Basic validation
        if (!file.type.startsWith('image/')) {
            setError('Please select an image file');
            return;
        }

        if (file.size > 10 * 1024 * 1024) {
            setError('File size must be less than 10MB');
            return;
        }

        try {
            // Create instant preview
            const reader = new FileReader();
            reader.onloadend = () => {
                setPreviewUrl(reader.result);
            };
            reader.readAsDataURL(file);

            // Compress image
            const compressedFile = await compressImage(file);

            // Upload with retry
            setUploading(true);
            const uploadedUrl = await uploadWithRetry(compressedFile);

            onChange(uploadedUrl);
            setPreviewUrl(null); // Clear preview, use uploaded URL
        } catch (err) {
            setError(err.message || 'Failed to upload image');
            setPreviewUrl(null);
        } finally {
            setUploading(false);
            setCompressing(false);
            setProgress(0);
        }
    };

    const handleRemove = () => {
        onChange('');
        setPreviewUrl(null);
        setOriginalSize(null);
        setCompressedSize(null);
        setError(null);
    };

    const handleRetry = () => {
        // Trigger file input click to retry
        document.querySelector('.file-input').click();
    };

    const isProcessing = uploading || compressing;
    const displayUrl = value || previewUrl;

    return (
        <div className="image-upload-container">
            {label && <label className="upload-label">{label}</label>}

            <div className={`upload-area ${displayUrl ? 'has-value' : ''} ${isProcessing ? 'uploading' : ''}`}>
                {displayUrl ? (
                    <div className="preview-container">
                        <img src={displayUrl} alt="Preview" className="upload-preview" />
                        {!isProcessing && (
                            <button className="remove-btn" onClick={handleRemove} type="button">
                                <X size={16} />
                            </button>
                        )}
                        {isProcessing && (
                            <div className="upload-overlay">
                                <div className="progress-container">
                                    <Loader2 className="animate-spin" size={24} />
                                    <div className="progress-bar">
                                        <div className="progress-fill" style={{ width: `${progress}%` }}></div>
                                    </div>
                                    <span className="progress-text">
                                        {compressing ? 'Compressing...' : `Uploading... ${progress}%`}
                                        {retryCount > 0 && ` (Retry ${retryCount}/3)`}
                                    </span>
                                </div>
                            </div>
                        )}
                    </div>
                ) : (
                    <label className="drop-zone">
                        <input
                            type="file"
                            className="file-input"
                            onChange={handleFileChange}
                            accept="image/*"
                            disabled={isProcessing}
                        />
                        <div className="upload-prompt">
                            <Upload size={24} />
                            <span>Click to upload image</span>
                            <span className="small text-muted">Max 10MB • Auto-compressed to 1MB</span>
                        </div>
                    </label>
                )}
            </div>

            {(originalSize || compressedSize) && !error && (
                <div className="compression-info">
                    {originalSize && <span>Original: {formatFileSize(originalSize)}</span>}
                    {compressedSize && <span> → Compressed: {formatFileSize(compressedSize)}</span>}
                </div>
            )}

            {error && (
                <div className="upload-error">
                    <p>{error}</p>
                    <button className="retry-btn" onClick={handleRetry} type="button">
                        Try Again
                    </button>
                </div>
            )}
        </div>
    );
};

export default ImageUpload;

