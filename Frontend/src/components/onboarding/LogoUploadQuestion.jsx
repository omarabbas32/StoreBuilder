import { useState } from 'react';
import { Upload, X, Loader2 } from 'lucide-react';
import onboardingService from '../../services/onboardingService';

const LogoUploadQuestion = ({ value, onChange }) => {
    const [uploading, setUploading] = useState(false);
    const [error, setError] = useState(null);

    const handleFileChange = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

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

        const result = await onboardingService.uploadLogo(file);

        if (result.success && result.data?.url) {
            onChange(result.data.url);
        } else {
            setError(result.error || 'Failed to upload logo');
        }
        setUploading(false);
    };

    const handleRemove = () => {
        onChange('');
    };

    return (
        <div className="question-container">
            <h2>Upload your store logo</h2>
            <p className="question-help">This will appear in your store header</p>

            <div className={`logo-upload-area ${value ? 'has-logo' : ''} ${uploading ? 'uploading' : ''}`}>
                {value ? (
                    <div className="logo-preview">
                        <img src={value} alt="Logo preview" />
                        <button className="remove-logo-btn" onClick={handleRemove} type="button">
                            <X size={20} />
                        </button>
                    </div>
                ) : (
                    <label className="logo-drop-zone">
                        <input
                            type="file"
                            className="file-input-hidden"
                            onChange={handleFileChange}
                            accept="image/*"
                            disabled={uploading}
                        />
                        {uploading ? (
                            <div className="upload-status">
                                <Loader2 className="spinning" size={32} />
                                <span>Uploading...</span>
                            </div>
                        ) : (
                            <div className="upload-prompt">
                                <Upload size={48} />
                                <span>Click to upload your logo</span>
                                <span className="upload-hint">PNG, JPG up to 5MB</span>
                            </div>
                        )}
                    </label>
                )}
            </div>
            {error && <p className="error-text">{error}</p>}
        </div>
    );
};

export default LogoUploadQuestion;

