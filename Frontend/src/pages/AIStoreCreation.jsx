import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Upload, Info, CheckCircle, ArrowRight, ArrowLeft, Loader2, Store } from 'lucide-react';
import storeService from '../services/storeService';
import useAuthStore from '../store/authStore';
import './AIStoreCreation.css';

const AIStoreCreation = () => {
    const navigate = useNavigate();
    const { user } = useAuthStore();
    const [step, setStep] = useState(1);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const [logo, setLogo] = useState(null);
    const [logoPreview, setLogoPreview] = useState(null);
    const [formData, setFormData] = useState({
        name: '',
        email: user?.email || '',
        description: '',
        tagline: '',
        facebook: '',
        instagram: '',
        twitter: '',
        tiktok: '',
    });

    const fileInputRef = useRef(null);

    const steps = [
        { id: 1, title: 'Brand Logo', icon: <Upload size={20} /> },
        { id: 2, title: 'Store Details', icon: <Info size={20} /> },
        { id: 3, title: 'Finalize', icon: <CheckCircle size={20} /> },
    ];

    const handleLogoChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setLogo(file);
            setLogoPreview(URL.createObjectURL(file));
        }
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const generateSlug = (name) => {
        const randomStr = Math.random().toString(36).substring(2, 6);
        return name.toLowerCase()
            .replace(/[^a-z0-9]+/g, '-')
            .replace(/(^-|-$)/g, '') + '-' + randomStr;
    };

    const handleNext = () => {
        setError(null);
        if (step === 1) {
            setStep(2);
        } else if (step === 2) {
            if (!formData.name.trim()) {
                setError('Store name is required');
                return;
            }
            setStep(3);
        }
    };

    const handleBack = () => {
        setError(null);
        setStep(prev => prev - 1);
    };

    const finalizeStore = async () => {
        setLoading(true);
        setError(null);
        try {
            let logoUrl = null;
            if (logo) {
                const uploadRes = await storeService.uploadStoreLogo(logo);
                if (uploadRes.success) {
                    logoUrl = uploadRes.data.url;
                }
            }

            const storeData = {
                name: formData.name.trim(),
                slug: generateSlug(formData.name),
                description: formData.description.trim(),
                tagline: formData.tagline.trim(),
                contact_email: formData.email,
                facebook_url: formData.facebook,
                instagram_url: formData.instagram,
                twitter_url: formData.twitter,
                tiktok_url: formData.tiktok,
                settings: {
                    logo: logoUrl,
                    primaryColor: '#2563eb'
                }
            };

            const result = await storeService.createStore(storeData);
            if (result.success) {
                navigate('/dashboard');
            } else {
                setError(result.error || 'Failed to create store');
            }
        } catch (err) {
            setError(err.message || 'An unexpected error occurred');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="ai-store-wizard">
            <div className="wizard-card">
                {/* Progress Steps */}
                <div className="wizard-progress">
                    {steps.map((s) => (
                        <div
                            key={s.id}
                            className={`progress-step ${step === s.id ? 'active' : ''} ${step > s.id ? 'completed' : ''}`}
                        >
                            {step > s.id ? <CheckCircle size={20} /> : s.id}
                        </div>
                    ))}
                </div>

                <div className="wizard-header">
                    <h1>{steps[step - 1].title}</h1>
                    <p>
                        {step === 1 && 'Upload your brand logo to get started. You can skip this step.'}
                        {step === 2 && 'Tell us about your store so customers know what you offer.'}
                        {step === 3 && 'Review your store details and hit Create to launch.'}
                    </p>
                </div>

                <div className="wizard-step-content">
                    {/* Step 1: Logo */}
                    {step === 1 && (
                        <div className="logo-upload-container">
                            <div
                                className="logo-preview"
                                onClick={() => fileInputRef.current.click()}
                            >
                                {logoPreview ? (
                                    <img src={logoPreview} alt="Logo Preview" />
                                ) : (
                                    <div className="upload-placeholder">
                                        <Upload size={40} strokeWidth={1.5} />
                                        <span>Click to upload logo</span>
                                        <span style={{ fontSize: '0.8rem', opacity: 0.6, marginTop: '0.25rem' }}>PNG, JPG, SVG — optional</span>
                                    </div>
                                )}
                            </div>
                            {logoPreview && (
                                <button
                                    className="btn-wizard btn-wizard-secondary"
                                    style={{ marginTop: '1rem', width: 'fit-content', alignSelf: 'center' }}
                                    onClick={() => { setLogo(null); setLogoPreview(null); }}
                                >
                                    Remove Logo
                                </button>
                            )}
                            <input
                                type="file"
                                ref={fileInputRef}
                                style={{ display: 'none' }}
                                onChange={handleLogoChange}
                                accept="image/*"
                            />
                        </div>
                    )}

                    {/* Step 2: Store Details */}
                    {step === 2 && (
                        <div className="form-grid">
                            <div className="form-group full-width">
                                <label>Store Name <span style={{ color: '#ef4444' }}>*</span></label>
                                <input
                                    name="name"
                                    value={formData.name}
                                    onChange={handleInputChange}
                                    placeholder="e.g. Minimalist Home"
                                    autoFocus
                                />
                            </div>
                            <div className="form-group full-width">
                                <label>Tagline</label>
                                <input
                                    name="tagline"
                                    value={formData.tagline}
                                    onChange={handleInputChange}
                                    placeholder="e.g. Curated minimalist pieces for modern living"
                                />
                            </div>
                            <div className="form-group full-width">
                                <label>Description</label>
                                <textarea
                                    name="description"
                                    rows={3}
                                    value={formData.description}
                                    onChange={handleInputChange}
                                    placeholder="Briefly describe what your store sells..."
                                />
                            </div>
                            <div className="form-group">
                                <label>Contact Email</label>
                                <input
                                    name="email"
                                    type="email"
                                    value={formData.email}
                                    onChange={handleInputChange}
                                    placeholder="hello@yourstore.com"
                                />
                            </div>
                            <div className="form-group">
                                <label>Instagram URL</label>
                                <input
                                    name="instagram"
                                    value={formData.instagram}
                                    onChange={handleInputChange}
                                    placeholder="https://instagram.com/..."
                                />
                            </div>
                            <div className="form-group">
                                <label>Facebook URL</label>
                                <input
                                    name="facebook"
                                    value={formData.facebook}
                                    onChange={handleInputChange}
                                    placeholder="https://facebook.com/..."
                                />
                            </div>
                            <div className="form-group">
                                <label>TikTok URL</label>
                                <input
                                    name="tiktok"
                                    value={formData.tiktok}
                                    onChange={handleInputChange}
                                    placeholder="https://tiktok.com/@..."
                                />
                            </div>
                        </div>
                    )}

                    {/* Step 3: Finalize / Review */}
                    {step === 3 && (
                        <div className="finalize-preview">
                            <div className="preview-logo-row">
                                {logoPreview ? (
                                    <img src={logoPreview} alt="Logo" className="preview-logo-img" />
                                ) : (
                                    <div className="preview-logo-placeholder">
                                        <Store size={32} />
                                    </div>
                                )}
                            </div>
                            <div className="preview-item">
                                <strong>Store Name</strong>
                                <span>{formData.name}</span>
                            </div>
                            {formData.tagline && (
                                <div className="preview-item">
                                    <strong>Tagline</strong>
                                    <span>{formData.tagline}</span>
                                </div>
                            )}
                            {formData.description && (
                                <div className="preview-item">
                                    <strong>Description</strong>
                                    <span>{formData.description}</span>
                                </div>
                            )}
                            {formData.email && (
                                <div className="preview-item">
                                    <strong>Contact Email</strong>
                                    <span>{formData.email}</span>
                                </div>
                            )}
                            {(formData.instagram || formData.facebook || formData.tiktok) && (
                                <div className="preview-item">
                                    <strong>Social Links</strong>
                                    <span>
                                        {[formData.instagram && 'Instagram', formData.facebook && 'Facebook', formData.tiktok && 'TikTok'].filter(Boolean).join(', ')}
                                    </span>
                                </div>
                            )}
                        </div>
                    )}
                </div>

                {error && <div className="error-message">{error}</div>}

                <div className="wizard-footer">
                    {step > 1 && (
                        <button
                            className="btn-wizard btn-wizard-secondary"
                            onClick={handleBack}
                            disabled={loading}
                        >
                            <ArrowLeft size={18} /> Back
                        </button>
                    )}
                    <div style={{ flex: 1 }} />
                    {step < 3 ? (
                        <button
                            className="btn-wizard btn-wizard-primary"
                            onClick={handleNext}
                            disabled={step === 2 && !formData.name.trim()}
                        >
                            {step === 1 ? 'Next' : 'Review'} <ArrowRight size={18} />
                        </button>
                    ) : (
                        <button
                            className="btn-wizard btn-wizard-primary"
                            onClick={finalizeStore}
                            disabled={loading}
                        >
                            {loading ? <Loader2 className="animate-spin" size={18} /> : 'Create Store'}
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
};

export default AIStoreCreation;
