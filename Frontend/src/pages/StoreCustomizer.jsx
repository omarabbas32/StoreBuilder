import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
    Save,
    ArrowLeft,
    Image as ImageIcon,
    Layout,
    ShoppingBag,
    Search,
    Check,
    Eye,
    Sparkles,
    MousePointer2
} from 'lucide-react';
import storeService from '../services/storeService';
import productService from '../services/productService';
import useAuthStore from '../store/authStore';
import Button from '../components/ui/Button';
import Card from '../components/ui/Card';
import ImageUpload from '../components/ui/ImageUpload';
import './StoreCustomizer.css';

const StoreCustomizer = () => {
    const { storeId: paramStoreId } = useParams();
    const { store: authStore } = useAuthStore();
    const storeId = paramStoreId || authStore?.id || authStore?._id;
    const navigate = useNavigate();
    const [store, setStore] = useState(null);
    const [allProducts, setAllProducts] = useState([]);
    const [availableComponents, setAvailableComponents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
    const [saveStatus, setSaveStatus] = useState(null);

    useEffect(() => {
        const init = async () => {
            setLoading(true);
            await Promise.all([
                fetchStoreData(),
                fetchAllProducts(),
                fetchAvailableComponents()
            ]);
            setLoading(false);
        };
        init();
    }, [storeId]);

    const fetchStoreData = async () => {
        try {
            const result = await storeService.getStoreById(storeId);
            if (result.success) {
                setStore(result.data);
            }
        } catch (error) {
            console.error('Error fetching store:', error);
        }
    };

    const fetchAvailableComponents = async () => {
        try {
            const result = await storeService.getComponents();
            if (result.success) {
                setAvailableComponents(result.data);
            }
        } catch (error) {
            console.error('Error fetching components:', error);
        }
    };

    const fetchAllProducts = async () => {
        try {
            const result = await productService.getProducts(storeId);
            if (result.success) {
                setAllProducts(result.data || []);
            }
        } catch (error) {
            console.error('Error fetching products:', error);
        }
    };

    const handleSave = async () => {
        // Step 10: Validation
        if (!heroContent.title?.trim()) {
            setSaveStatus('error-validation');
            return;
        }

        setSaving(true);
        setSaveStatus(null);
        // Ensure components are saved if they were missing (legacy stores)
        const finalSettings = {
            ...store.settings,
            components: (store.settings?.components && store.settings.components.length > 0)
                ? store.settings.components
                : availableComponents
        };

        try {
            await storeService.updateStore(storeId, {
                settings: finalSettings,
                name: store.name,
                description: store.description
            });
            setStore(prev => ({ ...prev, settings: finalSettings }));
            setHasUnsavedChanges(false);
            setSaveStatus('success');
            setTimeout(() => setSaveStatus(null), 6000);
        } catch (error) {
            console.error('Error saving store:', error);
            setSaveStatus('error');
        } finally {
            setSaving(false);
        }
    };

    const updateStoreField = (field, value) => {
        setStore(prev => ({ ...prev, [field]: value }));
        setHasUnsavedChanges(true);
    };

    const updateSettingsField = (field, value) => {
        setStore(prev => ({
            ...prev,
            settings: {
                ...(prev.settings || {}),
                [field]: value
            }
        }));
        setHasUnsavedChanges(true);
    };

    const updateComponentContent = (componentId, field, value) => {
        if (!componentId) return;

        setStore(prev => ({
            ...prev,
            settings: {
                ...prev.settings,
                componentContent: {
                    ...(prev.settings?.componentContent || {}),
                    [componentId]: {
                        ...(prev.settings?.componentContent?.[componentId] || {}),
                        [field]: value
                    }
                }
            }
        }));
        setHasUnsavedChanges(true);
    };

    const toggleProductSelection = (productId) => {
        if (!productId) return;
        const pidString = String(productId);

        setStore(prev => {
            const currentSettings = prev.settings || { components: [], componentContent: {} };
            // Robustly find the grid component regardless of where components come from
            const componentsList = (currentSettings.components && currentSettings.components.length > 0)
                ? currentSettings.components
                : availableComponents;

            const currentGrid = componentsList.find(c => c.type === 'product-grid');
            if (!currentGrid) return prev;

            const currentContent = currentSettings.componentContent?.[currentGrid.id] || {};
            const currentSelected = Array.isArray(currentContent.selectedProductIds)
                ? currentContent.selectedProductIds.map(String)
                : [];

            let nextSelected;
            if (currentSelected.includes(pidString)) {
                nextSelected = currentSelected.filter(id => id !== pidString);
            } else {
                nextSelected = [...currentSelected, pidString];
            }

            return {
                ...prev,
                settings: {
                    ...currentSettings,
                    componentContent: {
                        ...(currentSettings.componentContent || {}),
                        [currentGrid.id]: {
                            ...currentContent,
                            selectedProductIds: nextSelected
                        }
                    }
                }
            };
        });
        setHasUnsavedChanges(true);
    };

    const resetToDefaults = (type) => {
        if (!window.confirm(`Are you sure you want to reset the ${type} section to defaults?`)) return;

        if (type === 'hero' && heroComponent) {
            const defaults = {
                title: `Welcome to ${store.name}`,
                subtitle: 'Discover amazing products',
                ctaText: 'Shop Now',
                layout: 'centered',
                image: ''
            };
            Object.entries(defaults).forEach(([field, value]) => {
                updateComponentContent(heroComponent.id, field, value);
            });
        } else if (type === 'grid' && gridComponent) {
            const defaults = {
                title: 'Featured Collection',
                subtitle: 'Hand-picked selections just for you',
                selectedProductIds: []
            };
            Object.entries(defaults).forEach(([field, value]) => {
                updateComponentContent(gridComponent.id, field, value);
            });
        }
    };

    if (loading) return <div className="loading-state">Loading your designer...</div>;
    if (!store) return <div className="error-state">Store not found. Please try again from the dashboard.</div>;

    // Use local variables based on LATEST store state for rendering
    const settings = store.settings || { components: [], componentContent: {} };
    const components = settings.components && settings.components.length > 0
        ? settings.components
        : availableComponents;

    const heroComponent = components.find(c => c.type === 'hero');
    const heroContent = settings.componentContent?.[heroComponent?.id] || {
        title: 'Welcome to Our Store',
        subtitle: 'Discover amazing products',
        ctaText: 'Shop Now'
    };

    const gridComponent = components.find(c => c.type === 'product-grid');
    const gridContent = settings.componentContent?.[gridComponent?.id] || {};
    const selectedProductIds = Array.isArray(gridContent.selectedProductIds)
        ? gridContent.selectedProductIds.map(String)
        : [];

    const filteredProducts = allProducts.filter(p =>
        p.name.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const storePath = `/s/${store.subdomain || store._id}`;

    return (
        <div className="store-customizer-modern">
            <header className="designer-header">
                <div className="header-left">
                    <button className="back-btn" onClick={() => navigate('/dashboard')}>
                        <ArrowLeft size={20} />
                    </button>
                    <div>
                        <h1>Store Designer</h1>
                        <p>Customize your storefront visually</p>
                    </div>
                </div>
                <div className="header-actions">
                    <Button
                        variant="secondary"
                        onClick={() => window.open(storePath, '_blank')}
                        className="btn-glass"
                    >
                        <Eye size={18} />
                        Preview Store
                    </Button>
                    <Button
                        onClick={handleSave}
                        disabled={saving || !hasUnsavedChanges}
                        className="save-btn-modern"
                    >
                        {saving ? 'Saving...' : <><Save size={18} /> Save Design</>}
                    </Button>
                </div>
            </header>

            <div className="designer-layout">
                <section className="customizer-card">
                    <div className="card-header-modern">
                        <div className="icon-wrapper">
                            <Sparkles size={24} />
                        </div>
                        <div>
                            <h2>Branding & Colors</h2>
                            <p>Set your brand identity and theme colors</p>
                        </div>
                    </div>

                    <div className="branding-grid">
                        <div className="field-group-modern">
                            <label>Store Logo</label>
                            <ImageUpload
                                value={settings.logo_url}
                                onChange={(url) => updateSettingsField('logo_url', url)}
                            />
                        </div>
                        <div className="field-group-modern">
                            <label>Brand Color</label>
                            <div className="color-picker-container">
                                <input
                                    type="color"
                                    value={store.settings?.primaryColor || '#2563eb'}
                                    onChange={(e) => updateSettingsField('primaryColor', e.target.value)}
                                    className="color-input-modern"
                                />
                                <div className="color-presets">
                                    {['#2563eb', '#7c3aed', '#db2777', '#dc2626', '#16a34a', '#0f172a'].map(color => (
                                        <button
                                            key={color}
                                            className={`color-preset ${store.settings?.primaryColor === color ? 'active' : ''}`}
                                            style={{ backgroundColor: color }}
                                            onClick={() => updateSettingsField('primaryColor', color)}
                                        />
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Section 1: Hero Customization */}
                <section className="customizer-card">
                    <div className="card-header-modern">
                        <div className="icon-wrapper">
                            <Sparkles size={24} />
                        </div>
                        <div>
                            <h2>Header & Hero Section</h2>
                            <p>Make a great first impression with a beautiful cover</p>
                        </div>
                        <button className="reset-section-btn" onClick={() => resetToDefaults('hero')}>Reset to Defaults</button>
                    </div>

                    <div className="fields-grid-modern">
                        <div className="field-group-modern">
                            <label>Hero Layout</label>
                            <div className="layout-toggle-modern">
                                <button
                                    className={`layout-btn ${heroContent.layout === 'centered' ? 'active' : ''}`}
                                    onClick={() => updateComponentContent(heroComponent?.id, 'layout', 'centered')}
                                >
                                    <Layout size={18} />
                                    Centered
                                </button>
                                <button
                                    className={`layout-btn ${heroContent.layout === 'full-cover' ? 'active' : ''}`}
                                    onClick={() => updateComponentContent(heroComponent?.id, 'layout', 'full-cover')}
                                >
                                    <ImageIcon size={18} />
                                    Full Cover
                                </button>
                            </div>
                        </div>
                        <div className="field-group-modern">
                            <label>Headline</label>
                            <input
                                type="text"
                                value={heroContent.title || ''}
                                onChange={(e) => updateComponentContent(heroComponent?.id, 'title', e.target.value)}
                                placeholder="e.g. Welcome to Our Store"
                                className="modern-input"
                            />
                        </div>
                        <div className="field-group-modern">
                            <label>Subheadline</label>
                            <input
                                type="text"
                                value={heroContent.subtitle || ''}
                                onChange={(e) => updateComponentContent(heroComponent?.id, 'subtitle', e.target.value)}
                                placeholder="e.g. Discover amazing products"
                                className="modern-input"
                            />
                        </div>
                        <div className="field-group-modern">
                            <label>Button Text (CTA)</label>
                            <input
                                type="text"
                                value={heroContent.ctaText || ''}
                                onChange={(e) => updateComponentContent(heroComponent?.id, 'ctaText', e.target.value)}
                                placeholder="e.g. Shop Now"
                                className="modern-input"
                            />
                        </div>
                        <div className="field-group-modern full-width">
                            <label>Hero Cover Image</label>
                            <ImageUpload
                                value={heroContent.image}
                                onChange={(url) => updateComponentContent(heroComponent?.id, 'image', url)}
                            />
                        </div>
                    </div>
                </section>

                {/* Section 2: Featured Products */}
                <section className="customizer-card">
                    <div className="card-header-modern">
                        <div className="icon-wrapper">
                            <ShoppingBag size={24} />
                        </div>
                        <div>
                            <h2>Featured Products</h2>
                            <p>Hand-pick which products you want to show on the homepage</p>
                        </div>
                        <button className="reset-section-btn" onClick={() => resetToDefaults('grid')}>Reset to Defaults</button>
                    </div>

                    <div className="fields-grid-modern" style={{ marginBottom: '1.5rem' }}>
                        <div className="field-group-modern">
                            <label>Grid Title</label>
                            <input
                                type="text"
                                value={gridContent.title || ''}
                                onChange={(e) => updateComponentContent(gridComponent?.id, 'title', e.target.value)}
                                placeholder="e.g. Featured Collection"
                                className="modern-input"
                            />
                        </div>
                        <div className="field-group-modern">
                            <label>Grid Subtitle</label>
                            <input
                                type="text"
                                value={gridContent.subtitle || ''}
                                onChange={(e) => updateComponentContent(gridComponent?.id, 'subtitle', e.target.value)}
                                placeholder="e.g. Hand-picked selections"
                                className="modern-input"
                            />
                        </div>
                    </div>

                    <div className="search-modern">
                        <Search size={20} />
                        <input
                            type="text"
                            placeholder="Search your products..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                        <div className="selection-counter">
                            {selectedProductIds.length} Selected
                        </div>
                    </div>

                    <div className="product-picker-grid">
                        {filteredProducts.map(product => (
                            <div
                                key={product._id || product.id}
                                className={`product-picker-item ${selectedProductIds.includes(String(product._id || product.id)) ? 'active' : ''}`}
                                onClick={() => toggleProductSelection(product._id || product.id)}
                            >
                                <div className="product-visual">
                                    {product.images?.[0] || product.image ? (
                                        <img src={product.images?.[0] || product.image} alt={product.name} />
                                    ) : (
                                        <div className="no-image"><Sparkles size={24} /></div>
                                    )}
                                    {selectedProductIds.includes(String(product._id || product.id)) && (
                                        <div className="check-overlay">
                                            <Check size={32} />
                                        </div>
                                    )}
                                </div>
                                <div className="product-info-modern">
                                    <span className="p-name">{product.name}</span>
                                    <span className="p-price">${product.price}</span>
                                </div>
                            </div>
                        ))}
                    </div>
                </section>
            </div>

            {saveStatus === 'success' && (
                <div className="save-status-banner success">
                    <div className="status-content">
                        <Check size={20} />
                        <span>Changes saved successfully!</span>
                        <a href={storePath} target="_blank" rel="noopener noreferrer" className="preview-link">
                            View Live <Eye size={16} />
                        </a>
                    </div>
                    <button onClick={() => setSaveStatus(null)} className="close-banner">×</button>
                </div>
            )}

            {saveStatus === 'error' && (
                <div className="save-status-banner error">
                    <div className="status-content">
                        <span>Failed to save store design. Please try again.</span>
                    </div>
                    <button onClick={() => setSaveStatus(null)} className="close-banner">×</button>
                </div>
            )}

            {saveStatus === 'error-validation' && (
                <div className="save-status-banner error">
                    <div className="status-content">
                        <span>Hero headline is required. Please add a title.</span>
                    </div>
                    <button onClick={() => setSaveStatus(null)} className="close-banner">×</button>
                </div>
            )}

            {hasUnsavedChanges && !saveStatus && (
                <div className="unsaved-banner">
                    <p>You have unsaved changes. Don't forget to save your design!</p>
                </div>
            )}
        </div>
    );
};

export default StoreCustomizer;
