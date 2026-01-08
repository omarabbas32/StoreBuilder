import { useState } from 'react';
import { Upload, X, ImageIcon, Loader2 } from 'lucide-react';
import storeService from '../../services/storeService';
import './ImageUpload.css';

const ImageUpload = ({ value, onChange, label }) => {
    const [uploading, setUploading] = useState(false);
    const [error, setError] = useState(null);

    const handleFileChange = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        // Basic validation
        if (!file.type.startsWith('image/')) {
            setError('Please select an image file');
            return;
        }

        if (file.size > 5 * 1024 * 1024) {
            setError('File size must be less than 5MB');
            return;
        }

        setUploading(true);
        setError(null);

        const formData = new FormData();
        formData.append('image', file);

        const result = await storeService.uploadImage(formData);

        if (result.success) {
            onChange(result.data.url);
        } else {
            setError(result.error);
        }
        setUploading(false);
    };

    const handleRemove = () => {
        onChange('');
    };

    return (
        <div className="image-upload-container">
            {label && <label className="upload-label">{label}</label>}

            <div className={`upload-area ${value ? 'has-value' : ''} ${uploading ? 'uploading' : ''}`}>
                {value ? (
                    <div className="preview-container">
                        <img src={value} alt="Preview" className="upload-preview" />
                        <button className="remove-btn" onClick={handleRemove} type="button">
                            <X size={16} />
                        </button>
                    </div>
                ) : (
                    <label className="drop-zone">
                        <input
                            type="file"
                            className="file-input"
                            onChange={handleFileChange}
                            accept="image/*"
                            disabled={uploading}
                        />
                        {uploading ? (
                            <div className="upload-status">
                                <Loader2 className="animate-spin" size={24} />
                                <span>Uploading...</span>
                            </div>
                        ) : (
                            <div className="upload-prompt">
                                <Upload size={24} />
                                <span>Click to upload image</span>
                                <span className="small text-muted">Max 5MB</span>
                            </div>
                        )}
                    </label>
                )}
            </div>
            {error && <p className="upload-error">{error}</p>}
        </div>
    );
};

export default ImageUpload;
