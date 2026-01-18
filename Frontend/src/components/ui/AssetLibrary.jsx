import React, { useState, useEffect, useRef } from 'react';
import { Upload, Trash2, Search, X, Image as ImageIcon } from 'lucide-react';
import uploadService from '../../services/uploadService';
import { ASSET_BASE_URL } from '../../services/api';
import toast from 'react-hot-toast';
import './AssetLibrary.css';

const buildAssetUrl = (path) => {
    if (!path) return '';
    return new URL(path, ASSET_BASE_URL).toString();
};

const AssetLibrary = ({ storeId, onSelectImage }) => {
    const [images, setImages] = useState([]);
    const [loading, setLoading] = useState(true);
    const [uploading, setUploading] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedImage, setSelectedImage] = useState(null);
    const [dragActive, setDragActive] = useState(false);
    const fileInputRef = useRef(null);

    useEffect(() => {
        loadImages();
    }, [storeId]);

    const loadImages = async () => {
        setLoading(true);
        try {
            if (!storeId) {
                setImages([]);
                setLoading(false);
                return;
            }
            const result = await uploadService.listImages(storeId);
            if (result?.success) {
                setImages(result.data || []);
            } else {
                setImages([]);
                if (result?.status === 404) {
                    toast.error('Store not found or you do not own this store.');
                } else if (result?.error) {
                    toast.error(result.error);
                }
            }
        } catch (error) {
            console.error('Failed to load images:', error);
            setImages([]);
            toast.error('Failed to load images');
        } finally {
            setLoading(false);
        }
    };

    const handleFileSelect = async (files) => {
        if (!files || files.length === 0) return;

        setUploading(true);
        const uploadPromises = Array.from(files).map(file =>
            uploadService.uploadImage(file, storeId)
        );

        try {
            const results = await Promise.all(uploadPromises);
            const successCount = results.filter(r => r.success).length;

            if (successCount > 0) {
                await loadImages();
                toast.success(`${successCount} image(s) uploaded successfully!`);
            }
        } catch (error) {
            console.error('Upload error:', error);
        } finally {
            setUploading(false);
        }
    };

    const handleDrop = (e) => {
        e.preventDefault();
        e.stopPropagation();
        setDragActive(false);

        const files = e.dataTransfer.files;
        handleFileSelect(files);
    };

    const handleDrag = (e) => {
        e.preventDefault();
        e.stopPropagation();
        if (e.type === 'dragenter' || e.type === 'dragover') {
            setDragActive(true);
        } else if (e.type === 'dragleave') {
            setDragActive(false);
        }
    };

    const handleDelete = async (imageId) => {
        if (!window.confirm('Are you sure you want to delete this image?')) {
            return;
        }

        const result = await uploadService.deleteImage(imageId, storeId);
        if (result.success) {
            await loadImages();
        }
    };

    const handleImageClick = (image) => {
        setSelectedImage(image);
    };

    const handleSelectImage = (image) => {
        if (onSelectImage) {
            onSelectImage(image);
        }
        toast.success('Image selected!');
    };

    const filteredImages = images.filter(img =>
        img.originalName?.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <div className="asset-library">
            {/* Header */}
            <div className="asset-library-header">
                <h3>Asset Library</h3>
                <div className="asset-search">
                    <Search size={18} />
                    <input
                        type="text"
                        placeholder="Search images..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </div>
            </div>

            {/* Upload Zone */}
            <div
                className={`upload-zone ${dragActive ? 'drag-active' : ''}`}
                onDragEnter={handleDrag}
                onDragLeave={handleDrag}
                onDragOver={handleDrag}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
            >
                <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={(e) => handleFileSelect(e.target.files)}
                    style={{ display: 'none' }}
                />
                <Upload size={32} />
                <p className="upload-text">
                    {uploading ? 'Uploading...' : 'Drag & drop images or click to upload'}
                </p>
                <span className="upload-hint">Max 5MB per file • PNG, JPG, WebP, GIF</span>
            </div>

            {/* Image Grid */}
            {loading ? (
                <div className="loading-state">
                    <div className="spinner"></div>
                    <p>Loading images...</p>
                </div>
            ) : filteredImages.length === 0 ? (
                <div className="empty-state">
                    <ImageIcon size={48} />
                    <p>No images yet</p>
                    <span>Upload your first image to get started</span>
                </div>
            ) : (
                <div className="image-grid">
                    {filteredImages.map(image => (
                        <div key={image.id} className="image-card">
                            <div
                                className="image-preview"
                                onClick={() => handleImageClick(image)}
                            >
                                <img
                                    src={buildAssetUrl(image.url)}
                                    alt={image.originalName}
                                />
                                <div className="image-overlay">
                                    <button
                                        className="delete-btn"
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            handleDelete(image.id);
                                        }}
                                    >
                                        <Trash2 size={18} />
                                    </button>
                                </div>
                            </div>
                            <div className="image-info">
                                <span className="image-name">{image.originalName}</span>
                                <span className="image-size">
                                    {(image.size / 1024).toFixed(1)} KB
                                </span>
                            </div>
                            {onSelectImage && (
                                <button
                                    className="select-btn"
                                    onClick={() => handleSelectImage(image)}
                                >
                                    Select
                                </button>
                            )}
                        </div>
                    ))}
                </div>
            )}

            {/* Preview Modal */}
            {selectedImage && (
                <div className="preview-modal" onClick={() => setSelectedImage(null)}>
                    <div className="preview-content" onClick={(e) => e.stopPropagation()}>
                        <button
                            className="close-btn"
                            onClick={() => setSelectedImage(null)}
                        >
                            <X size={24} />
                        </button>
                        <img
                            src={buildAssetUrl(selectedImage.url)}
                            alt={selectedImage.originalName}
                        />
                        <div className="preview-info">
                            <h4>{selectedImage.originalName}</h4>
                            <p>Size: {(selectedImage.size / 1024).toFixed(1)} KB</p>
                            <p>Type: {selectedImage.mimeType}</p>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AssetLibrary;
