import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Upload, Info, Wand2, CheckCircle, ArrowRight, ArrowLeft, Loader2 } from 'lucide-react';
import storeService from '../services/storeService';
import useAuthStore from '../store/authStore';
import './AIStoreCreation.css';

const AIStoreCreation = () => {
    const navigate = useNavigate();
    const { user } = useAuthStore();
    const [step, setStep] = useState(1);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    // Form State
    const [logo, setLogo] = useState(null);
    const [logoPreview, setLogoPreview] = useState(null);
    const [formData, setFormData] = useState({
        name: '',
        email: user?.email || '',
        facebook: '',
        instagram: '',
        twitter: '',
        linkedin: '',
        tiktok: '',
        description: '',
        tagline: '',
        businessHours: '',
    });

    const fileInputRef = useRef(null);

    const steps = [
        { id: 1, title: 'Brand Identity', icon: <Upload size={20} /> },
        { id: 2, title: 'Basic Information', icon: <Info size={20} /> },
        { id: 3, title: 'AI Generation', icon: <Wand2 size={20} /> },
        { id: 4, title: 'Finalize', icon: <CheckCircle size={20} /> },
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

    const handleNext = async () => {
        if (step === 1) {
            setStep(2);
        } else if (step === 2) {
            if (!formData.name) {
                setError('Store name is required');
                return;
            }
            setStep(3);
            generateAIDetails();
        } else if (step === 3) {
            setStep(4);
        }
    };

    const generateAIDetails = async () => {
        setLoading(true);
        setError(null);
        try {
            // We use the general aiChat endpoint with a specific prompt
            const prompt = `Based on the following store information, generate a professional description (max 300 chars), a catchy tagline (max 60 chars), and typical business hours.
            Store Name: ${formData.name}
            Email: ${formData.email}
            Socials: FB: ${formData.facebook}, IG: ${formData.instagram}
            
            Return ONLY a JSON object with keys: description, tagline, businessHours.`;

            const response = await storeService.aiChat([{ role: 'user', content: prompt }], 'gemini');

            if (response.success && response.data) {
                const aiPayload = response.data;
                const aiMessage = aiPayload.message || '';

                let aiData = {};
                try {
                    // Try to parse from message string
                    const jsonMatch = aiMessage.match(/\{.*\}/s);
                    aiData = JSON.parse(jsonMatch ? jsonMatch[0] : aiMessage);
                } catch (e) {
                    console.error('Failed to parse AI response', e);
                }

                setFormData(prev => ({
                    ...prev,
                    description: aiData.description || prev.description,
                    tagline: aiData.tagline || prev.tagline,
                    businessHours: aiData.businessHours || prev.businessHours
                }));
            }
        } catch (err) {
            setError('Failed to generate AI details. You can fill them manually.');
        } finally {
            setLoading(false);
        }
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
                name: formData.name,
                slug: generateSlug(formData.name),
                description: formData.description,
                tagline: formData.tagline,
                contact_email: formData.email,
                facebook_url: formData.facebook,
                instagram_url: formData.instagram,
                twitter_url: formData.twitter,
                linkedin_url: formData.linkedin,
                tiktok_url: formData.tiktok,
                business_hours: { hours: formData.businessHours },
                settings: {
                    logo: logoUrl,
                    primaryColor: '#2563eb'
                }
            };

            const result = await storeService.createStore(storeData);
            if (result.success) {
                navigate(`/dashboard`);
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
                        {step === 1 && "Upload your brand's logo to get started."}
                        {step === 2 && "Tell us a bit about your store."}
                        {step === 3 && "Gemini is crafting your store's content..."}
                        {step === 4 && "Review and finalize your new store."}
                    </p>
                </div>

                <div className="wizard-step-content">
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
                                    </div>
                                )}
                            </div>
                            <input
                                type="file"
                                ref={fileInputRef}
                                style={{ display: 'none' }}
                                onChange={handleLogoChange}
                                accept="image/*"
                            />
                        </div>
                    )}

                    {step === 2 && (
                        <div className="form-grid">
                            <div className="form-group full-width">
                                <label>Store Name *</label>
                                <input
                                    name="name"
                                    value={formData.name}
                                    onChange={handleInputChange}
                                    placeholder="e.g. Minimalist Home"
                                />
                            </div>
                            <div className="form-group">
                                <label>Contact Email</label>
                                <input
                                    name="email"
                                    type="email"
                                    value={formData.email}
                                    onChange={handleInputChange}
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
                                />
                            </div>
                            <div className="form-group">
                                <label>TikTok URL</label>
                                <input
                                    name="tiktok"
                                    value={formData.tiktok}
                                    onChange={handleInputChange}
                                />
                            </div>
                        </div>
                    )}

                    {step === 3 && (
                        <div className="ai-generation-state">
                            {loading ? (
                                <>
                                    <div className="ai-loader">
                                        <div className="ai-loader-ring"></div>
                                        <Wand2 className="ai-icon" size={32} />
                                    </div>
                                    <h3>Generating Magic...</h3>
                                </>
                            ) : (
                                <div className="form-grid">
                                    <div className="form-group full-width">
                                        <label>Tagline</label>
                                        <input
                                            name="tagline"
                                            value={formData.tagline}
                                            onChange={handleInputChange}
                                        />
                                    </div>
                                    <div className="form-group full-width">
                                        <label>Description</label>
                                        <textarea
                                            name="description"
                                            rows={4}
                                            value={formData.description}
                                            onChange={handleInputChange}
                                        />
                                    </div>
                                    <div className="form-group full-width">
                                        <label>Business Hours</label>
                                        <input
                                            name="businessHours"
                                            value={formData.businessHours}
                                            onChange={handleInputChange}
                                        />
                                    </div>
                                </div>
                            )}
                        </div>
                    )}

                    {step === 4 && (
                        <div className="finalize-preview">
                            <div className="preview-item">
                                <strong>Name:</strong> {formData.name}
                            </div>
                            <div className="preview-item">
                                <strong>Tagline:</strong> {formData.tagline}
                            </div>
                            <div className="preview-item">
                                <strong>Description:</strong> {formData.description}
                            </div>
                            {logoPreview && (
                                <div className="preview-item">
                                    <strong>Logo Selected</strong>
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
                            onClick={() => setStep(step - 1)}
                            disabled={loading}
                        >
                            <ArrowLeft size={18} /> Back
                        </button>
                    )}
                    <div style={{ flex: 1 }}></div>
                    {step < 4 ? (
                        <button
                            className="btn-wizard btn-wizard-primary"
                            onClick={handleNext}
                            disabled={loading || (step === 2 && !formData.name)}
                        >
                            Next <ArrowRight size={18} />
                        </button>
                    ) : (
                        <button
                            className="btn-wizard btn-wizard-primary"
                            onClick={finalizeStore}
                            disabled={loading}
                        >
                            {loading ? <Loader2 className="animate-spin" /> : "Create Store"}
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
};

export default AIStoreCreation;
