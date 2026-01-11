import { useState } from "react";
import { Upload, X, Loader2, Image as ImageIcon } from "lucide-react";
import storeService from "../../services/storeService";
import "./MultiImageUpload.css";

const MultiImageUpload = ({ value = [], onChange, label, maxImages = 5 }) => {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState(null);

  const handleFileChange = async (e) => {
    const files = Array.from(e.target.files);
    if (!files.length) return;

    // Validation
    const validFiles = files.filter((file) => {
      if (!file.type.startsWith("image/")) {
        setError("Some files are not images");
        return false;
      }
      if (file.size > 5 * 1024 * 1024) {
        setError("Some files exceed 5MB");
        return false;
      }
      return true;
    });

    if (value.length + validFiles.length > maxImages) {
      setError(`You can only upload up to ${maxImages} images`);
      return;
    }

    setUploading(true);
    setError(null);

    const formData = new FormData();
    validFiles.forEach((file) => formData.append("images", file));

    try {
      const result = await storeService.uploadMultipleImages(formData);

      if (result.success && result.data?.images) {
        // According to MediaController, result.data.images is the array
        const newUrls = result.data.images.map((img) => img.url);
        onChange([...value, ...newUrls]);
      } else {
        setError(result.error || "Upload failed");
      }
    } catch (err) {
      setError("Upload failed");
      console.error(err);
    } finally {
      setUploading(false);
    }
  };

  const handleRemove = (index) => {
    const newValue = [...value];
    newValue.splice(index, 1);
    onChange(newValue);
  };

  return (
    <div className="multi-image-upload">
      {label && <label className="upload-label">{label}</label>}

      <div className="images-grid">
        {value.map((url, index) => (
          <div key={index} className="image-preview-item">
            <img src={url} alt={`Preview ${index}`} />
            <button
              className="remove-image-btn"
              onClick={() => handleRemove(index)}
              type="button"
            >
              <X size={14} />
            </button>
          </div>
        ))}
      </div>

      {value.length < maxImages && (
        <label className={`multi-drop-zone ${uploading ? "disabled" : ""}`}>
          <input
            type="file"
            className="file-input"
            onChange={handleFileChange}
            accept="image/*"
            multiple
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
              <span>Click to upload images</span>
              <span className="small text-muted">
                {value.length}/{maxImages} images (Max 5MB each)
              </span>
            </div>
          )}
        </label>
      )}

      {error && <p className="upload-error">{error}</p>}
    </div>
  );
};

export default MultiImageUpload;
