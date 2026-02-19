import React, { useState, useEffect, useCallback, useMemo } from 'react';
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
    MousePointer2,
    Type,
    Menu as MenuIcon,
    Plus,
    Trash2,
    ChevronDown,
    ChevronUp,
    Palette,
    Smartphone,
    Tablet,
    Monitor,
    Undo,
    Redo,
    X,
    Copy,
    Minimize2,
    Maximize2,
    ArrowRight,
    Minus,
    RotateCcw,
    RefreshCw
} from 'lucide-react';
import { useRef } from 'react';
import storeService from '../services/storeService';
import productService from '../services/productService';
import themeService from '../services/themeService';
import { ASSET_BASE_URL } from '../services/api';
import useAuthStore from '../store/authStore';
import Button from '../components/ui/Button';
import Card from '../components/ui/Card';
import ImageUpload from '../components/ui/ImageUpload';
import ColorPalettePicker from '../components/ui/ColorPalettePicker';
import AssetLibrary from '../components/ui/AssetLibrary';
import SortableComponentItem from '../components/ui/SortableComponentItem';
import ProductPicker from '../components/ui/ProductPicker';
import TemplatePicker from '../components/ui/TemplatePicker';
import AIAssistant from '../components/dashboard/AIAssistant';
import { DragDropContext, Droppable } from '@hello-pangea/dnd';
import { debounce } from '../utils/debounce';
import { safeSettingsUpdate } from '../utils/settingsMerge';
import { validateStoreSettings } from '../utils/validation';
import toast from 'react-hot-toast';
import './StoreCustomizer.css';

const LIBRARY_ASSETS = [
    { id: 'asset-1', url: 'https://images.unsplash.com/photo-1557683316-973673baf926?q=80&w=1200', name: 'Premium Abstract' },
    { id: 'asset-2', url: 'https://images.unsplash.com/photo-1472851294608-062f824d29cc?q=80&w=1200', name: 'Modern Shopping' },
    { id: 'asset-3', url: 'https://images.unsplash.com/photo-1445205170230-053b830c6050?q=80&w=1200', name: 'Elegant Fashion' },
    { id: 'asset-4', url: 'https://images.unsplash.com/photo-1518770660439-4636190af475?q=80&w=1200', name: 'High-Tech Wave' }
];



const Separator = () => <div className="designer-separator" />;

const AccordionSection = ({ id, title, description, icon, children, openSections, toggleSection, resetToDefaults }) => {
    const isOpen = openSections[id];
    return (
        <section className={`accordion-card ${isOpen ? 'open' : ''}`}>
            <button
                className="accordion-header"
                onClick={() => toggleSection(id)}
                aria-expanded={isOpen}
            >
                <div className="icon-wrapper">{icon}</div>
                <div className="accordion-header-text">
                    <h3>{title}</h3>
                    <p>{description}</p>
                </div>
                <ChevronDown size={20} className="accordion-chevron" />
            </button>
            {isOpen && (
                <div className="accordion-content">
                    {resetToDefaults && (
                        <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '1rem' }}>
                            <button className="reset-section-btn" onClick={() => resetToDefaults(id)}>Reset</button>
                        </div>
                    )}
                    {children}
                </div>
            )}
        </section>
    );
};

const StickyToolbar = ({ storeName, hasUnsavedChanges, saving, handleSave, handleSaveAsTemplate, undo, redo, historyIndex, historyLength, onReset, justSaved, setShowTemplatePicker }) => {
    const navigate = useNavigate();

    return (
        <div className="sticky-editor-bar">
            <div className="editor-title">
                <button
                    className="back-to-dashboard"
                    onClick={() => navigate('/dashboard')}
                    title="Back to Dashboard"
                >
                    <ArrowLeft size={20} />
                </button>
                <div className="title-group">
                    <h2>{storeName} <span className="studio-badge">Studio Focus</span></h2>
                    <div className={`save-status ${hasUnsavedChanges ? 'unsaved' : 'saved'}`}>
                        {hasUnsavedChanges ? '● Changes Unsaved' : '✓ All Saved'}
                    </div>
                </div>
            </div>
            <div className="editor-actions">
                <button className="toolbar-btn glass" onClick={undo} disabled={historyIndex <= 0} title="Undo (Ctrl+Z)">
                    <Undo size={18} />
                </button>
                <button className="toolbar-btn glass" onClick={redo} disabled={historyIndex >= historyLength - 1} title="Redo (Ctrl+Y)">
                    <Redo size={18} />
                </button>
                <div className="toolbar-divider-v" />
                <button className="toolbar-btn glass" onClick={() => setShowTemplatePicker(true)} title="Browse and apply templates">
                    <Layout size={18} />
                    <span className="btn-label-sm">Templates</span>
                </button>
                <button className="toolbar-btn glass" onClick={handleSaveAsTemplate} title="Save current design as a new template">
                    <Copy size={18} />
                </button>
                <button className="toolbar-btn glass" onClick={onReset} title="Reset all to defaults">
                    <X size={18} />
                </button>
                <Button
                    onClick={handleSave}
                    className={`save-btn-modern ${justSaved ? 'success' : ''}`}
                    size="sm"
                    loading={saving}
                    disabled={saving || (!hasUnsavedChanges && !justSaved)}
                >
                    {justSaved ? (
                        <>
                            <Check size={18} />
                            Saved!
                        </>
                    ) : (
                        <>
                            <Save size={18} />

                        </>
                    )}
                </Button>
            </div>
        </div>
    );
};

const CustomizationProgress = ({ settings }) => {
    // Basic logic to check "completeness"
    const sections = [
        { key: 'logo_url', weight: 1 },
        { key: 'primaryColor', weight: 1 },
        { key: 'typography', weight: 1 },
        { key: 'navbar_config', weight: 1 },
        { key: 'footer_config', weight: 1 }
    ];

    let score = 0;
    sections.forEach(s => {
        if (settings[s.key] || (typeof settings[s.key] === 'object' && Object.keys(settings[s.key] || {}).length > 0)) {
            score++;
        }
    });

    const percentage = Math.round((score / sections.length) * 100);

    return (
        <div className="progress-container">
            <div className="progress-header">
                <span>Customization Progress</span>
                <span className="progress-percentage">{percentage}%</span>
            </div>
            <div className="progress-bar-bg">
                <div className="progress-bar-fill" style={{ width: `${percentage}%` }} />
            </div>
            <p className="progress-status-msg" style={{ fontSize: '0.7rem', color: 'var(--designer-text-muted)', marginTop: '0.5rem', fontStyle: 'italic' }}>
                {percentage < 50 ? '🌱 Almost there! Keep going.' : percentage < 90 ? '✨ Looking great! Just a few more tweaks.' : '👑 Perfect! Your store is ready.'}
            </p>
        </div>
    );
};

const DeviceFrame = ({ children, device, onDeviceChange, scale, onScaleChange, onRefresh, subdomain }) => (
    <div className={`designer-preview-pane ${device}`}>
        <div className="preview-toolbar">
            <div className="device-selectors">
                <button
                    className={`toolbar-btn ${device === 'desktop' ? 'active' : ''}`}
                    onClick={() => onDeviceChange('desktop')}
                >
                    <Monitor size={18} />
                </button>
                <button
                    className={`toolbar-btn ${device === 'tablet' ? 'active' : ''}`}
                    onClick={() => onDeviceChange('tablet')}
                >
                    <Tablet size={18} />
                </button>
                <button
                    className={`toolbar-btn ${device === 'mobile' ? 'active' : ''}`}
                    onClick={() => onDeviceChange('mobile')}
                >
                    <Smartphone size={18} />
                </button>
            </div>

            <div className="toolbar-divider-v"></div>

            <div className="zoom-controls">
                <button className="toolbar-btn" onClick={() => onScaleChange(Math.max(0.1, scale - 0.1))}>
                    <Minus size={14} />
                </button>
                <span className="scale-display">{Math.round(scale * 100)}%</span>
                <button className="toolbar-btn" onClick={() => onScaleChange(Math.min(2, scale + 0.1))}>
                    <Plus size={14} />
                </button>
                <button className="toolbar-btn glass" onClick={() => onScaleChange(1)}>
                    <RotateCcw size={14} />
                </button>
            </div>

            <div className="toolbar-divider-v"></div>

            <button
                className="toolbar-btn glass"
                onClick={onRefresh}
                title="Refresh Preview"
            >
                <RefreshCw size={14} />
            </button>
        </div>
        <div className={`preview-iframe-wrapper ${device}`}>
            <div
                className={`preview-device-frame ${device}`}
                style={{
                    transform: device === 'desktop' ? 'none' : `scale(${scale})`,
                    transformOrigin: 'center top'
                }}
            >
                {device !== 'desktop' && (
                    <div className="device-top-bar">
                        <div className="status-dots">
                            <span className="status-dot dot-red"></span>
                            <span className="status-dot dot-yellow"></span>
                            <span className="status-dot dot-green"></span>
                        </div>
                    </div>
                )}
                <div className={`preview-iframe-container ${device}`}>
                    {children}
                </div>
            </div>
        </div>
    </div>
);

const CustomizerMainMenu = ({ onSelect, activeSection }) => {
    const menuItems = [
        { id: 'branding', title: 'Branding & Colors', icon: <Sparkles size={20} />, description: 'Logo, colors and identity' },
        { id: 'sections', title: 'Page Sections', icon: <Eye size={20} />, description: 'Visibility and ordering' },
        { id: 'typography', title: 'Typography', icon: <Type size={20} />, description: 'Fonts and text styles' },
        { id: 'navbar', title: 'Header & Navigation', icon: <MenuIcon size={20} />, description: 'Menu links and layout' },
        { id: 'homepage', title: 'Homepage Sections', icon: <Layout size={20} />, description: 'Hero and product grid' },
        { id: 'footer', title: 'Footer & Social', icon: <ShoppingBag size={20} />, description: 'Basics and legal links' }
    ];

    return (
        <div className="customizer-main-menu">
            <div className="menu-group-label" style={{ padding: '0 0.5rem 0.75rem', fontSize: '0.75rem', fontWeight: 700, color: 'var(--designer-text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Site Structure</div>
            {menuItems.map(item => (
                <button
                    key={item.id}
                    className={`menu-nav-item ${activeSection === item.id ? 'active' : ''}`}
                    onClick={() => onSelect(item.id)}
                >
                    <div className="menu-nav-icon">{item.icon}</div>
                    <div className="menu-nav-text">
                        <span className="menu-nav-title">{item.title}</span>
                        <span className="menu-nav-desc">{item.description}</span>
                    </div>
                    <ArrowRight size={16} className="menu-nav-chevron" style={{ marginLeft: 'auto', opacity: 0.3 }} />
                </button>
            ))}
        </div>
    );
};

const StoreCustomizer = () => {
    const { storeId: paramStoreId } = useParams();
    const { store: authStore, setStore: setAuthStore } = useAuthStore();
    const storeId = paramStoreId || authStore?.id || authStore?._id;
    const navigate = useNavigate();
    const [store, setStore] = useState(null);
    const [allProducts, setAllProducts] = useState([]);
    const [availableComponents, setAvailableComponents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
    const [previewMode, setPreviewMode] = useState('split'); // 'split' or 'full' (editor only)
    const [previewDevice, setPreviewDevice] = useState('desktop'); // 'mobile', 'tablet', 'desktop'
    const [previewScale, setPreviewScale] = useState(1); // Added scaling support
    const [draftAvailable, setDraftAvailable] = useState(null);
    const [history, setHistory] = useState([]);
    const [historyIndex, setHistoryIndex] = useState(-1);
    const [showAssetModal, setShowAssetModal] = useState(false);
    const [showProductPicker, setShowProductPicker] = useState(false);
    const [activePickerComponentId, setActivePickerComponentId] = useState(null);
    const [assetCallback, setAssetCallback] = useState(null);
    const isUndoing = useRef(false);
    const iframeRef = useRef(null);
    const saveTimeoutRef = useRef(null);
    const [autoSaveStatus, setAutoSaveStatus] = useState(null); // 'saving', 'saved', null
    const [activeSection, setActiveSection] = useState(null); // 'branding', 'sections', 'typography', 'navbar', 'homepage', 'footer'
    const [openSections, setOpenSections] = useState({
        branding: true,
        sections: false,
        typography: false,
        navbar: false,
        footer: false,
        assets: false
    });
    const [justSaved, setJustSaved] = useState(false);
    const [showTemplatePicker, setShowTemplatePicker] = useState(false);
    const [previewKey, setPreviewKey] = useState(0);

    const toggleSection = (section) => {
        setOpenSections(prev => ({
            ...prev,
            [section]: !prev[section]
        }));
    };


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



    // Debounced update to preview iframe
    const debouncedSendUpdate = useMemo(
        () => debounce((settings) => {
            if (iframeRef.current?.contentWindow) {
                iframeRef.current.contentWindow.postMessage({
                    type: 'STORE_UPDATE',
                    settings
                }, window.location.origin);
            }
        }, 300),
        []
    );

    useEffect(() => {
        if (store?.settings && previewMode === 'split') {
            debouncedSendUpdate(store.settings);
        }
    }, [store?.settings, previewMode, debouncedSendUpdate]);

    // Live section highlighting logic
    useEffect(() => {
        if (iframeRef.current?.contentWindow) {
            iframeRef.current.contentWindow.postMessage({
                type: 'HIGHLIGHT_SECTION',
                sectionId: activeSection
            }, window.location.origin);
        }
    }, [activeSection]);


    // Auto-save to localStorage
    useEffect(() => {
        if (store?.settings && hasUnsavedChanges) {
            const timer = setTimeout(() => {
                const draftData = {
                    settings: store.settings,
                    timestamp: new Date().toISOString(),
                    storeId: storeId
                };
                localStorage.setItem(`store_draft_${storeId}`, JSON.stringify(draftData));
                console.log('Draft auto-saved');
            }, 3000);
            return () => clearTimeout(timer);
        }
    }, [store?.settings, hasUnsavedChanges, storeId]);

    const selectFallbackStore = async () => {
        if (paramStoreId) {
            toast.error('Store not found. Please check the URL or select another store.');
            navigate('/dashboard');
            return null;
        }

        const storesResult = await storeService.getMyStores();
        if (storesResult.success && storesResult.data?.length > 0) {
            const nextStore = storesResult.data[0];
            setStore(nextStore);
            setAuthStore(nextStore);
            return nextStore;
        }

        setStore(null);
        setAuthStore(null);
        toast.error('No stores found. Please create a store first.');
        navigate('/create-store');
        return null;
    };

    const fetchStoreData = async () => {
        try {
            if (!storeId) {
                await selectFallbackStore();
                return;
            }

            const result = await storeService.getStoreById(storeId);
            if (result.success) {
                const fetchedStore = result.data;
                const activeStoreId = fetchedStore?.id || fetchedStore?._id || storeId;
                setStore(fetchedStore);
                setAuthStore(fetchedStore);

                // Check for local draft
                const savedDraft = localStorage.getItem(`store_draft_${activeStoreId}`);
                if (savedDraft) {
                    const parsedDraft = JSON.parse(savedDraft);
                    const serverUpdated = new Date(fetchedStore.updated_at).getTime();
                    const draftUpdated = new Date(parsedDraft.timestamp).getTime();

                    if (draftUpdated > serverUpdated + 1000) { // If draft is newer than server
                        setDraftAvailable(parsedDraft);
                        toast((t) => (
                            <span>
                                You have unsaved changes from a previous session.
                                <button
                                    onClick={() => {
                                        restoreDraft(parsedDraft);
                                        toast.dismiss(t.id);
                                    }}
                                    style={{ marginLeft: '10px', background: '#2563eb', color: 'white', border: 'none', padding: '4px 8px', borderRadius: '4px', cursor: 'pointer' }}
                                >
                                    Restore
                                </button>
                                <button
                                    onClick={() => {
                                        clearDraft();
                                        toast.dismiss(t.id);
                                    }}
                                    style={{ marginLeft: '5px', background: '#ef4444', color: 'white', border: 'none', padding: '4px 8px', borderRadius: '4px', cursor: 'pointer' }}
                                >
                                    Discard
                                </button>
                            </span>
                        ), { duration: 10000 });
                    }
                }
            } else if (result?.status === 404) {
                await selectFallbackStore();
            } else if (!result.success) {
                toast.error(result.error || 'Failed to load store');
            }
        } catch (error) {
            console.error('Error fetching store:', error);
        }
    };

    const restoreDraft = (draft) => {
        setStore(prev => ({
            ...prev,
            settings: draft.settings
        }));
        setAuthStore({ ...store, settings: draft.settings });
        setHasUnsavedChanges(true);
        toast.success('Draft restored!');
    };

    const clearDraft = () => {
        localStorage.removeItem(`store_draft_${storeId}`);
        setDraftAvailable(null);
    };

    const undo = useCallback(() => {
        if (historyIndex > 0) {
            isUndoing.current = true;
            const prevIndex = historyIndex - 1;
            const prevSettings = history[prevIndex];
            setStore(prev => ({ ...prev, settings: prevSettings }));
            setAuthStore({ ...store, settings: prevSettings });
            setHistoryIndex(prevIndex);
            setHasUnsavedChanges(true);
            toast.success('Undo', { id: 'undo-redo', duration: 1000 });
        }
    }, [historyIndex, history, store, setAuthStore]);

    const redo = useCallback(() => {
        if (historyIndex < history.length - 1) {
            isUndoing.current = true;
            const nextIndex = historyIndex + 1;
            const nextSettings = history[nextIndex];
            setStore(prev => ({ ...prev, settings: nextSettings }));
            setAuthStore({ ...store, settings: nextSettings });
            setHistoryIndex(nextIndex);
            setHasUnsavedChanges(true);
            toast.success('Redo', { id: 'undo-redo', duration: 1000 });
        }
    }, [historyIndex, history, store, setAuthStore]);

    // Track history for Undo/Redo (Debounced)
    const pushToHistory = useMemo(
        () => debounce((newSettings) => {
            setHistory(prev => {
                const currentSettingsJSON = JSON.stringify(newSettings);
                const lastSettingsJSON = prev.length > 0 ? JSON.stringify(prev[prev.length - 1]) : null;

                if (currentSettingsJSON !== lastSettingsJSON) {
                    const newHistory = [...prev.slice(0, historyIndex + 1), newSettings];
                    if (newHistory.length > 50) newHistory.shift();
                    return newHistory;
                }
                return prev;
            });
            setHistoryIndex(prev => Math.min(prev + 1, 49));
        }, 500),
        [historyIndex]
    );

    useEffect(() => {
        if (store?.settings) {
            if (isUndoing.current) {
                isUndoing.current = false;
                return;
            }
            pushToHistory(JSON.parse(JSON.stringify(store.settings)));
        }
    }, [store?.settings, pushToHistory]);

    // Keyboard shortcuts
    useEffect(() => {
        const handleKeyDown = (e) => {
            if ((e.ctrlKey || e.metaKey)) {
                if (e.key === 'z') {
                    e.preventDefault();
                    if (e.shiftKey) redo();
                    else undo();
                } else if (e.key === 'y') {
                    e.preventDefault();
                    redo();
                }
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [undo, redo]);

    // Debounced Auto-Save (2 second delay after last change)
    useEffect(() => {
        if (!hasUnsavedChanges || !store?.settings) return;

        // Clear any existing timeout
        if (saveTimeoutRef.current) {
            clearTimeout(saveTimeoutRef.current);
        }

        // Set new timeout for auto-save
        saveTimeoutRef.current = setTimeout(async () => {
            setAutoSaveStatus('saving');
            try {
                const currentComponents = (store.settings?.components && store.settings.components.length > 0)
                    ? store.settings.components
                    : availableComponents;

                const updates = { ...store.settings, components: currentComponents };
                const finalSettings = safeSettingsUpdate(store.settings, updates);

                await storeService.updateStore(storeId, {
                    settings: finalSettings,
                    name: store.name,
                    description: store.description
                });

                setHasUnsavedChanges(false);
                clearDraft();
                setAutoSaveStatus('saved');

                // Clear 'saved' status after 2 seconds
                setTimeout(() => setAutoSaveStatus(null), 2000);
            } catch (error) {
                console.error('Auto-save failed:', error);
                setAutoSaveStatus(null);
                // Don't show toast for auto-save failures, just clear status
            }
        }, 2000);

        // Cleanup timeout on unmount
        return () => {
            if (saveTimeoutRef.current) {
                clearTimeout(saveTimeoutRef.current);
            }
        };
    }, [hasUnsavedChanges, store?.settings, storeId, availableComponents]);

    const fetchAvailableComponents = async () => {
        try {
            const result = await storeService.getComponents();
            // Handle both wrapped {success, data} and raw array responses
            const data = result.success ? result.data : (Array.isArray(result) ? result : []);
            setAvailableComponents(data);
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
        // Find components for local validation check
        const currentComponents = (store.settings?.components && store.settings.components.length > 0)
            ? store.settings.components
            : availableComponents;
        const currentHero = currentComponents.find(c => c.type === 'hero');
        const heroContent = store.settings?.componentContent?.[currentHero?.id] || {};

        if (!heroContent.title?.trim()) {
            toast.error('Hero headline is required. Please add a title.');
            return;
        }

        setSaving(true);
        setAutoSaveStatus(null);
        // Use merge utility to preserve metadata and merge settings safely
        const updates = {
            ...store.settings,
            components: currentComponents
        };
        const finalSettings = safeSettingsUpdate(store.settings, updates);

        // Perform schema-based validation
        const validation = validateStoreSettings(finalSettings);
        if (!validation.success) {
            toast.error(`Validation Error: ${validation.errors[0].message} (${validation.errors[0].path})`);
            return;
        }

        try {
            await storeService.updateStore(storeId, {
                settings: finalSettings,
                name: store.name,
                description: store.description
            });
            setStore(prev => ({ ...prev, settings: finalSettings }));
            setAuthStore({ ...store, settings: finalSettings });
            setHasUnsavedChanges(false);
            clearDraft(); // Clear draft after successful save
            setJustSaved(true);
            setTimeout(() => setJustSaved(false), 2000);
            toast.success('Design saved successfully!');
        } catch (error) {
            console.error('Error saving store:', error);
            toast.error('Failed to save store design. Please try again.');
        } finally {
            setSaving(false);
        }
    };

    const handleSaveAsTemplate = async () => {
        const templateName = window.prompt('Enter a name for your template:', `${store.name} Template`);
        if (!templateName) return;

        setSaving(true);
        try {
            const result = await themeService.saveAsTemplate({
                name: templateName,
                description: `Custom design saved from ${store.name}`,
                config: store.settings || {},
                screenshot_url: store.settings?.logo_url // Use logo as temporary screenshot
            });

            if (result.success) {
                toast.success('Design saved as a reusable template!');
            } else {
                toast.error(result.error);
            }
        } catch (error) {
            console.error('Error saving template:', error);
            toast.error('Failed to save template');
        } finally {
            setSaving(false);
        }
    };

    const applyTemplate = (template) => {
        if (!window.confirm(`Are you sure you want to apply "${template.name}"? This will overwrite your current design settings.`)) {
            return;
        }

        try {
            const newSettings = template.config || {};
            setStore(prev => ({
                ...prev,
                settings: newSettings
            }));
            setAuthStore({ ...store, settings: newSettings });
            setHasUnsavedChanges(true);
            setShowTemplatePicker(false);
            toast.success(`Template "${template.name}" applied successfully!`);
        } catch (error) {
            console.error('Error applying template:', error);
            toast.error('Failed to apply template');
        }
    };

    const updateStoreField = (field, value) => {
        setStore(prev => ({ ...prev, [field]: value }));
        setHasUnsavedChanges(true);
    };

    const openAssetLibrary = (callback) => {
        setAssetCallback(() => callback);
        setShowAssetModal(true);
    };

    const handleAssetSelect = (image) => {
        if (assetCallback) {
            assetCallback(new URL(image.url, ASSET_BASE_URL).toString());
        }
        setShowAssetModal(false);
        setAssetCallback(null);
    };

    const updateSettingsField = (field, valueOrFn) => {
        setStore(prev => {
            const prevValue = prev.settings?.[field];
            const newValue = typeof valueOrFn === 'function' ? valueOrFn(prevValue) : valueOrFn;
            const newSettings = {
                ...(prev.settings || {}),
                [field]: newValue
            };
            return {
                ...prev,
                settings: newSettings
            };
        });
        setHasUnsavedChanges(true);
    };

    const updateSettingsFields = (fields) => {
        setStore(prev => {
            const newSettings = {
                ...(prev.settings || {}),
                ...fields
            };
            return {
                ...prev,
                settings: newSettings
            };
        });
        setHasUnsavedChanges(true);
    };

    const updateComponentContent = (componentId, field, value, typeFallback = null) => {
        let finalId = componentId;

        // If ID is missing, try to find it by type in current components
        if (!finalId && typeFallback) {
            const currentComponents = (store.settings?.components && store.settings.components.length > 0)
                ? store.settings.components
                : availableComponents;
            const comp = currentComponents.find(c =>
                c.type === typeFallback ||
                (typeFallback === 'product-grid' && c.type === 'grid') ||
                (typeFallback === 'grid' && c.type === 'product-grid')
            );
            finalId = comp?.id;
        }

        if (!finalId) return;

        setStore(prev => ({
            ...prev,
            settings: {
                ...prev.settings,
                componentContent: {
                    ...(prev.settings?.componentContent || {}),
                    [finalId]: {
                        ...(prev.settings?.componentContent?.[finalId] || {}),
                        [field]: value
                    }
                }
            }
        }));
        setHasUnsavedChanges(true);
    };

    const getCurrentlySelectedIds = () => {
        const currentSettings = store?.settings || { components: [], componentContent: {} };
        const componentsList = (currentSettings.components && currentSettings.components.length > 0)
            ? currentSettings.components
            : availableComponents;
        const grid = componentsList.find(c => c.id === activePickerComponentId) || componentsList.find(c => c.type === 'product-grid' || c.type === 'grid');
        const content = currentSettings.componentContent?.[grid?.id] || {};
        return Array.isArray(content.selectedProductIds) ? content.selectedProductIds.map(String) : [];
    };

    // Listen for inline edit updates from preview iframe
    useEffect(() => {
        const handleMessage = (event) => {
            // Check origin for security
            if (event.origin !== window.location.origin) return;

            if (event.data?.type === 'CONTENT_UPDATE') {
                const { componentId, field, value } = event.data;
                console.log(`Received inline update: ${componentId}.${field} = ${value}`);
                updateComponentContent(componentId, field, value);
                toast.success(`Updated ${field}`, { id: 'inline-edit', duration: 1000 });
            } else if (event.data?.type === 'REMOVE_SECTION') {
                const { sectionId } = event.data;
                console.log(`Received remove section request: ${sectionId}`);
                updateComponentVisibility(sectionId, false);
                toast.success('Section removed', { icon: '🗑️' });
            }
        };

        window.addEventListener('message', handleMessage);
        return () => window.removeEventListener('message', handleMessage);
    }, []);

    const updateComponentVisibility = (componentId, isVisible) => {
        if (!componentId) return;

        setStore(prev => ({
            ...prev,
            settings: {
                ...prev.settings,
                components: (prev.settings?.components || availableComponents).map(c =>
                    c.id === componentId ? { ...c, disabled: !isVisible } : c
                )
            }
        }));
        setHasUnsavedChanges(true);
    };

    const handleDragEnd = (result) => {
        const { source, destination } = result;

        // If dropped outside the list
        if (!destination) return;

        // If position didn't change
        if (source.index === destination.index) return;

        setStore((prev) => {
            const currentComponents = prev.settings?.components || availableComponents;
            const newComponents = Array.from(currentComponents);
            const [removed] = newComponents.splice(source.index, 1);
            newComponents.splice(destination.index, 0, removed);

            return {
                ...prev,
                settings: {
                    ...prev.settings,
                    components: newComponents,
                },
            };
        });
        setHasUnsavedChanges(true);
        toast.success('Section order updated');
    };

    const duplicateComponent = (componentId) => {
        if (!componentId) return;

        setStore(prev => {
            const currentComponents = prev.settings?.components || availableComponents;
            const originalComp = currentComponents.find(c => c.id === componentId);
            if (!originalComp) return prev;

            const newId = `comp_${Date.now()}`;
            const newComp = {
                ...originalComp,
                id: newId,
                name: `${originalComp.name || originalComp.type} (Copy)`
            };

            // Clone content
            const originalContent = prev.settings?.componentContent?.[componentId] || {};
            const newContent = { ...originalContent };

            // Find index of original to insert after
            const originalIndex = currentComponents.findIndex(c => c.id === componentId);
            const newComponents = [...currentComponents];
            newComponents.splice(originalIndex + 1, 0, newComp);

            return {
                ...prev,
                settings: {
                    ...prev.settings,
                    components: newComponents,
                    componentContent: {
                        ...(prev.settings?.componentContent || {}),
                        [newId]: newContent
                    }
                }
            };
        });
        setHasUnsavedChanges(true);
        toast.success('Section duplicated');
    };

    const toggleProductSelection = (productId, componentId) => {
        console.log(`[toggleProductSelection] productId=${productId} componentId=${componentId}`);
        if (!productId) return;
        let finalComponentId = componentId;
        if (!finalComponentId) {
            const currentSettings = store?.settings || { components: [], componentContent: {} };
            const componentsList = (currentSettings.components && currentSettings.components.length > 0)
                ? currentSettings.components
                : availableComponents;
            const fallbackGrid = componentsList.find(c => c.type === 'product-grid' || c.type === 'grid');
            finalComponentId = fallbackGrid?.id;
        }

        if (!finalComponentId) {
            console.warn('[toggleProductSelection] No componentId found');
            toast.error('Could not find component to update selection');
            return;
        }

        toast.success('Selection updated!', { id: 'toggle-product', duration: 800 });

        const pidString = String(productId);

        setStore(prev => {
            const currentSettings = prev.settings || { components: [], componentContent: {} };
            // Robustly find the grid component by id
            const componentsList = (currentSettings.components && currentSettings.components.length > 0)
                ? currentSettings.components
                : availableComponents;

            const currentGrid = componentsList.find(c => c.id === finalComponentId);
            if (!currentGrid) {
                console.warn(`[toggleProductSelection] Component ${finalComponentId} not found`);
                return prev;
            }

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

        if (type === 'branding') {
            updateSettingsField('logo_url', 'https://placehold.co/150x50/3b82f6/ffffff/STORELY');
            updateSettingsField('colorPalette', ['#2563eb']);
            updateSettingsField('primaryColor', '#2563eb');
            toast.success('Branding reset to defaults');
        } else if (type === 'typography') {
            updateSettingsField('typography', {
                fontFamily: 'Inter',
                headingFontFamily: 'Inter',
                headingSize: 'medium',
                bodySize: 'medium',
                fontWeight: 'normal',
                lineHeight: '1.6',
                letterSpacing: '0px'
            });
            toast.success('Typography reset to defaults');
        } else if (type === 'hero' && heroComponent) {
            const defaults = {
                title: `Welcome to ${store.name}`,
                subtitle: 'Discover amazing products',
                ctaText: 'Shop Now',
                layout: 'centered',
                image: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?q=80&w=1200'
            };
            Object.entries(defaults).forEach(([field, value]) => {
                updateComponentContent(heroComponent.id, field, value);
            });
            toast.success('Hero section reset');
        } else if (type === 'grid' && gridComponent) {
            const defaults = {
                title: 'Featured Collection',
                subtitle: 'Hand-picked selections just for you',
                selectedProductIds: []
            };
            Object.entries(defaults).forEach(([field, value]) => {
                updateComponentContent(gridComponent.id, field, value);
            });
            toast.success('Product grid reset');
        } else if (type === 'navbar' && navbarComp) {
            updateComponentContent(navbarComp.id, 'menuItems', [], 'navbar');
            toast.success('Navigation menu reset');
        } else if (type === 'footer' && footerComp) {
            const defaults = {
                copyrightText: `Ac ${new Date().getFullYear()} ${store.name}. All rights reserved.`,
                showSocial: true,
                socialColor: store.settings?.primaryColor || '#2563eb',
                backgroundColor: '#0f172a',
                aboutText: '',
                aboutLinks: [],
                facebookUrl: '',
                instagramUrl: '',
                twitterUrl: '',
                email: '',
                phone: ''
            };
            Object.entries(defaults).forEach(([field, value]) => {
                updateComponentContent(footerComp.id, field, value, 'footer');
            });
            toast.success('Footer reset');
        }
    };

    const applyFooterPreset = (preset) => {
        if (!footerComp) {
            toast.error('Footer component not found');
            return;
        }

        const presets = {
            minimal: {
                socialColor: '#64748b',
                backgroundColor: '#ffffff',
                copyrightText: `© ${new Date().getFullYear()} ${store.name}`
            },
            bold: {
                socialColor: '#2563eb',
                backgroundColor: '#0f172a',
                copyrightText: `© ${new Date().getFullYear()} ${store.name}`
            },
            luxury: {
                socialColor: '#d4af37',
                backgroundColor: '#1a1a1a',
                copyrightText: `EST. ${new Date().getFullYear()} | ${store.name.toUpperCase()}`
            }
        };

        const selected = presets[preset];
        if (selected) {
            setStore(prev => {
                const currentSettings = prev?.settings || {};
                const currentContent = currentSettings.componentContent?.[footerComp.id] || {};

                return {
                    ...prev,
                    settings: {
                        ...currentSettings,
                        componentContent: {
                            ...(currentSettings.componentContent || {}),
                            [footerComp.id]: {
                                ...currentContent,
                                ...selected
                            }
                        }
                    }
                };
            });
            setHasUnsavedChanges(true);
            toast.success(`Applied ${preset.charAt(0).toUpperCase() + preset.slice(1)} footer preset!`);
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

    const gridComponent = components.find(c =>
        c.type === 'product-grid' ||
        c.type === 'grid' ||
        (c.name && c.name.toLowerCase().includes('product'))
    );
    const gridContent = settings.componentContent?.[gridComponent?.id] || {};
    const selectedProductIds = Array.isArray(gridContent.selectedProductIds)
        ? gridContent.selectedProductIds.map(String)
        : [];

    const typography = settings.typography || {
        fontFamily: 'Inter',
        headingSize: 'medium',
        bodySize: 'medium',
        fontWeight: 'normal'
    };

    const navbarComp = components.find(c => ['navbar', 'navigation', 'nav'].includes(c.type));
    const navbarContent = settings.componentContent?.[navbarComp?.id] || {
        menuItems: []
    };

    const menuItems = Array.isArray(navbarContent.menuItems)
        ? navbarContent.menuItems
        : (typeof navbarContent.menuItems === 'string' ? JSON.parse(navbarContent.menuItems) : []);

    const footerComp = components.find(c => c.type === 'footer');
    const footerContent = settings.componentContent?.[footerComp?.id] || {
        copyrightText: `Ac ${new Date().getFullYear()} ${store.name}. All rights reserved.`,
        showSocial: true,
        socialColor: store.settings?.primaryColor || '#2563eb',
        backgroundColor: '#0f172a',
        aboutText: '',
        aboutLinks: [],
        facebookUrl: '',
        instagramUrl: '',
        twitterUrl: '',
        email: '',
        phone: ''
    };

    let footerLinks = [];
    if (Array.isArray(footerContent.aboutLinks)) {
        footerLinks = footerContent.aboutLinks;
    } else if (typeof footerContent.aboutLinks === 'string') {
        try {
            footerLinks = JSON.parse(footerContent.aboutLinks);
        } catch (error) {
            footerLinks = [];
        }
    }

    const addMenuItem = () => {
        if (!navbarComp) return;
        const newMenuItems = [...menuItems, { label: 'New Link', url: '#' }];
        updateComponentContent(navbarComp.id, 'menuItems', newMenuItems, 'navbar');
    };

    const removeMenuItem = (index) => {
        if (!navbarComp) return;
        const newMenuItems = menuItems.filter((_, i) => i !== index);
        updateComponentContent(navbarComp.id, 'menuItems', newMenuItems, 'navbar');
    };

    const updateMenuItem = (index, field, value) => {
        if (!navbarComp) return;
        const newMenuItems = [...menuItems];
        newMenuItems[index] = { ...newMenuItems[index], [field]: value };
        updateComponentContent(navbarComp.id, 'menuItems', newMenuItems, 'navbar');
    };

    const moveMenuItem = (index, direction) => {
        if (!navbarComp) return;
        if (direction === 'up' && index === 0) return;
        if (direction === 'down' && index === menuItems.length - 1) return;

        const newMenuItems = [...menuItems];
        const newIndex = direction === 'up' ? index - 1 : index + 1;
        [newMenuItems[index], newMenuItems[newIndex]] = [newMenuItems[newIndex], newMenuItems[index]];
        updateComponentContent(navbarComp.id, 'menuItems', newMenuItems, 'navbar');
    };

    const addFooterLink = () => {
        if (!footerComp) return;
        const newLinks = [...footerLinks, { label: 'New Link', url: '#' }];
        updateComponentContent(footerComp.id, 'aboutLinks', newLinks, 'footer');
    };

    const removeFooterLink = (index) => {
        if (!footerComp) return;
        const newLinks = footerLinks.filter((_, i) => i !== index);
        updateComponentContent(footerComp.id, 'aboutLinks', newLinks, 'footer');
    };

    const updateFooterLink = (index, field, value) => {
        if (!footerComp) return;
        const newLinks = [...footerLinks];
        newLinks[index] = { ...newLinks[index], [field]: value };
        updateComponentContent(footerComp.id, 'aboutLinks', newLinks, 'footer');
    };


    const filteredProducts = allProducts.filter(p =>
        p.name.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const storePath = `/s/${store.subdomain || store._id}`;

    return (
        <div className="store-customizer-modern">
            <StickyToolbar
                storeName={store.name}
                hasUnsavedChanges={hasUnsavedChanges}
                saving={saving}
                handleSave={handleSave}
                handleSaveAsTemplate={handleSaveAsTemplate}
                justSaved={justSaved}
                undo={undo}
                redo={redo}
                historyIndex={historyIndex}
                historyLength={history.length}
                setShowTemplatePicker={setShowTemplatePicker}
                onReset={() => {
                    if (window.confirm('Are you sure you want to reset ALL settings to defaults? This cannot be undone.')) {
                        setStore(prev => ({ ...prev, settings: { components: [], componentContent: {} } }));
                        setHasUnsavedChanges(true);
                    }
                }}
            />

            <div className="designer-main-container">
                <div className={`designer-sidebar ${previewMode === 'split' ? 'split' : ''}`} role="region" aria-label="Customization Options">
                    <CustomizationProgress settings={settings} />

                    <div className="designer-layout">
                        {!activeSection ? (
                            <CustomizerMainMenu onSelect={setActiveSection} activeSection={activeSection} />
                        ) : (
                            <div className="focused-section-editor">
                                <div className="section-editor-header">
                                    <button className="back-to-menu-btn" onClick={() => setActiveSection(null)}>
                                        <ArrowLeft size={18} />
                                        <span>Back</span>
                                    </button>
                                    <div className="breadcrumb-mini">
                                        <span>Settings</span> / <span className="active">{activeSection.charAt(0).toUpperCase() + activeSection.slice(1)}</span>
                                    </div>
                                </div>

                                {/* Section: Branding */}
                                {activeSection === 'branding' && (
                                    <AccordionSection
                                        id="branding"
                                        title="Branding & Colors"
                                        description="Set your brand identity and theme colors"
                                        icon={<Sparkles size={24} />}
                                        openSections={{ branding: true }}
                                        toggleSection={() => { }} // Always open in focused view
                                        resetToDefaults={resetToDefaults}
                                    >
                                        <div className="fields-grid-modern">
                                            <div className="field-group-modern full-width">
                                                <div className="label-with-action">
                                                    <label>Store Logo</label>
                                                    <button
                                                        className="text-action-btn"
                                                        onClick={() => openAssetLibrary((url) => updateSettingsField('logo_url', url))}
                                                    >
                                                        <Sparkles size={14} /> Library
                                                    </button>
                                                </div>
                                                <ImageUpload
                                                    value={settings.logo_url}
                                                    onChange={(url) => updateSettingsField('logo_url', url)}
                                                />
                                            </div>
                                            <div className="field-group-modern full-width">
                                                <label>Brand Design System</label>
                                                <ColorPalettePicker
                                                    value={settings.colorPalette || [settings.primaryColor || '#2563eb']}
                                                    onChange={(colors) => {
                                                        updateSettingsFields({
                                                            colorPalette: colors,
                                                            primaryColor: colors[0]
                                                        });
                                                    }}
                                                    themes={[
                                                        { name: 'Modern', colors: ['#0f172a', '#3b82f6', '#f8fafc'] },
                                                        { name: 'Vibrant', colors: ['#7c3aed', '#ec4899', '#facc15'] },
                                                        { name: 'Pastel', colors: ['#fdf2f8', '#ecfdf5', '#eff6ff'] },
                                                        { name: 'Dark', colors: ['#1e1e1e', '#d4af37', '#ffffff'] }
                                                    ]}
                                                />
                                            </div>
                                        </div>
                                    </AccordionSection>
                                )}

                                {/* Section: Page Sections */}
                                {activeSection === 'sections' && (
                                    <AccordionSection
                                        id="sections"
                                        title="Page Sections"
                                        description="Enable or disable visible sections on your homepage"
                                        icon={<Eye size={24} />}
                                        openSections={{ sections: true }}
                                        toggleSection={() => { }}
                                    >
                                        <div className="visibility-controls-grid">
                                            <DragDropContext onDragEnd={handleDragEnd}>
                                                <Droppable droppableId="components-list">
                                                    {(provided) => (
                                                        <div
                                                            {...provided.droppableProps}
                                                            ref={provided.innerRef}
                                                        >
                                                            {components
                                                                .filter(c => !['navigation', 'navbar', 'footer'].includes(c.type))
                                                                .map((component, index) => (
                                                                    <SortableComponentItem
                                                                        key={component.id}
                                                                        component={component}
                                                                        index={index}
                                                                        onToggleVisibility={updateComponentVisibility}
                                                                        onDuplicate={duplicateComponent}
                                                                    />
                                                                ))
                                                            }
                                                            {provided.placeholder}
                                                        </div>
                                                    )}
                                                </Droppable>
                                            </DragDropContext>
                                        </div>
                                    </AccordionSection>
                                )}

                                {/* Section: Typography */}
                                {activeSection === 'typography' && (
                                    <AccordionSection
                                        id="typography"
                                        title="Typography"
                                        description="Choose fonts and text styles for your store"
                                        icon={<Type size={24} />}
                                        openSections={{ typography: true }}
                                        toggleSection={() => { }}
                                        resetToDefaults={resetToDefaults}
                                    >
                                        <div className="fields-grid-modern">
                                            <div className="field-group-modern full-width">
                                                <label>Font Pairing Presets</label>
                                                <div className="font-presets-grid">
                                                    {[
                                                        { name: 'Modern', heading: 'Inter', body: 'Inter' },
                                                        { name: 'Elegant', heading: 'Playfair Display', body: 'Roboto' },
                                                        { name: 'Professional', heading: 'Montserrat', body: 'Inter' },
                                                        { name: 'Clean', heading: 'Outfit', body: 'Outfit' }
                                                    ].map(pair => (
                                                        <button
                                                            key={pair.name}
                                                            className={`font-preset-item ${typography.fontFamily === pair.body && typography.headingFontFamily === pair.heading ? 'active' : ''}`}
                                                            onClick={() => updateSettingsField('typography', (prev) => ({
                                                                ...(prev || {}),
                                                                fontFamily: pair.body,
                                                                headingFontFamily: pair.heading
                                                            }))}
                                                        >
                                                            <div className="preset-preview">
                                                                <span style={{ fontFamily: pair.heading }} className="h-preview">Aa</span>
                                                                <span style={{ fontFamily: pair.body }} className="b-preview">Aa</span>
                                                            </div>
                                                            <span className="preset-name">{pair.name}</span>
                                                        </button>
                                                    ))}
                                                </div>
                                            </div>
                                            <div className="field-group-modern">
                                                <label>Heading Font</label>
                                                <select
                                                    className="modern-input"
                                                    value={typography.headingFontFamily || typography.fontFamily}
                                                    onChange={(e) => updateSettingsField('typography', (prev) => ({ ...(prev || {}), headingFontFamily: e.target.value }))}
                                                >
                                                    <option value="Inter">Inter (Sans-serif)</option>
                                                    <option value="Roboto">Roboto (Clean)</option>
                                                    <option value="Playfair Display">Playfair Display (Elegant)</option>
                                                    <option value="Outfit">Outfit (Modern)</option>
                                                    <option value="Montserrat">Montserrat (Bold)</option>
                                                </select>
                                            </div>
                                            <div className="field-group-modern">
                                                <label>Body Font</label>
                                                <select
                                                    className="modern-input"
                                                    value={typography.fontFamily}
                                                    onChange={(e) => updateSettingsField('typography', (prev) => ({ ...(prev || {}), fontFamily: e.target.value }))}
                                                >
                                                    <option value="Inter">Inter (Sans-serif)</option>
                                                    <option value="Roboto">Roboto (Clean)</option>
                                                    <option value="Playfair Display">Playfair Display (Elegant)</option>
                                                    <option value="Outfit">Outfit (Modern)</option>
                                                    <option value="Montserrat">Montserrat (Bold)</option>
                                                </select>
                                            </div>
                                            <div className="field-group-modern">
                                                <label>Heading Size</label>
                                                <select
                                                    className="modern-input"
                                                    value={typography.headingSize}
                                                    onChange={(e) => updateSettingsField('typography', (prev) => ({ ...(prev || {}), headingSize: e.target.value }))}
                                                >
                                                    <option value="small">Small</option>
                                                    <option value="medium">Medium</option>
                                                    <option value="large">Large</option>
                                                    <option value="extra-large">Extra Large</option>
                                                </select>
                                            </div>
                                            <div className="field-group-modern">
                                                <label>Body Text Size</label>
                                                <select
                                                    className="modern-input"
                                                    value={typography.bodySize}
                                                    onChange={(e) => updateSettingsField('typography', (prev) => ({ ...(prev || {}), bodySize: e.target.value }))}
                                                >
                                                    <option value="small">Small</option>
                                                    <option value="medium">Medium</option>
                                                    <option value="large">Large</option>
                                                </select>
                                            </div>
                                            <div className="field-group-modern">
                                                <label>Line Height</label>
                                                <input
                                                    type="range"
                                                    min="1" max="2" step="0.1"
                                                    value={typography.lineHeight || 1.6}
                                                    onChange={(e) => updateSettingsField('typography', (prev) => ({ ...(prev || {}), lineHeight: e.target.value }))}
                                                    className="modern-range"
                                                />
                                            </div>
                                        </div>
                                    </AccordionSection>
                                )}

                                {/* Section: Navigation */}
                                {activeSection === 'navbar' && (
                                    <AccordionSection
                                        id="navbar"
                                        title="Header & Navigation"
                                        description="Customize your site menu and header assets"
                                        icon={<MenuIcon size={24} />}
                                        openSections={{ navbar: true }}
                                        toggleSection={() => { }}
                                        resetToDefaults={resetToDefaults}
                                    >
                                        <div className="fields-grid-modern">
                                            <div className="field-group-modern full-width">
                                                <div className="label-with-action">
                                                    <label>Menu Items</label>
                                                    <button className="text-action-btn" onClick={addMenuItem}>
                                                        <Plus size={14} /> Add Item
                                                    </button>
                                                </div>
                                                <div className="menu-items-list">
                                                    {menuItems.length === 0 ? (
                                                        <div className="empty-state-menu">No menu items yet.</div>
                                                    ) : (
                                                        menuItems.map((item, index) => (
                                                            <div key={index} className="menu-item-row">
                                                                <div className="menu-item-fields">
                                                                    <input
                                                                        type="text"
                                                                        value={item.label}
                                                                        onChange={(e) => updateMenuItem(index, 'label', e.target.value)}
                                                                        placeholder="Label"
                                                                        className="modern-input"
                                                                    />
                                                                    <input
                                                                        type="text"
                                                                        value={item.url}
                                                                        onChange={(e) => updateMenuItem(index, 'url', e.target.value)}
                                                                        placeholder="URL (e.g. /products)"
                                                                        className="modern-input"
                                                                    />
                                                                </div>
                                                                <button className="delete-menu-item" onClick={() => removeMenuItem(index)}>
                                                                    <Trash2 size={18} />
                                                                </button>
                                                            </div>
                                                        ))
                                                    )}
                                                </div>
                                            </div>

                                            <div className="field-group-modern full-width">
                                                <label>Page Header Illustration</label>
                                                <p className="field-description">Appears on categories and product listing pages</p>
                                                <div className="asset-grid-preview">
                                                    {LIBRARY_ASSETS.map(asset => (
                                                        <button
                                                            key={asset.id}
                                                            className={`asset-preview-item ${settings.globalHeaderAsset === asset.url ? 'active' : ''}`}
                                                            onClick={() => updateSettingsField('globalHeaderAsset', asset.url)}
                                                        >
                                                            <img src={asset.url} alt={asset.name} />
                                                            <span className="asset-name">{asset.name}</span>
                                                            {settings.globalHeaderAsset === asset.url && (
                                                                <div className="asset-check">
                                                                    <Check size={16} />
                                                                </div>
                                                            )}
                                                        </button>
                                                    ))}
                                                    <button
                                                        className={`asset-preview-item ${!settings.globalHeaderAsset ? 'active' : ''}`}
                                                        onClick={() => updateSettingsField('globalHeaderAsset', null)}
                                                    >
                                                        <div className="no-asset-preview">
                                                            <X size={24} />
                                                        </div>
                                                        <span className="asset-name">None</span>
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    </AccordionSection>
                                )}

                                {/* Homepage Content Sections */}
                                {activeSection === 'homepage' && (
                                    <AccordionSection
                                        id="homepage"
                                        title="Homepage Sections"
                                        description="Customize your hero cover and featured product grid"
                                        icon={<Layout size={24} />}
                                        openSections={{ homepage: true }}
                                        toggleSection={() => { }}
                                    >
                                        <div className="sub-sections-grid">
                                            {/* Hero Sub-section */}
                                            <div className="sub-section-card">
                                                <h4 className="sub-header" style={{ marginBottom: '1rem', fontSize: '0.9rem', fontWeight: 600, color: 'var(--designer-text-muted)' }}>Hero / Cover</h4>
                                                <div className="fields-grid-modern">
                                                    <div className="field-group-modern">
                                                        <label>Hero Layout</label>
                                                        <div className="toggle-container-modern mini">
                                                            <button
                                                                className={`toggle-btn ${heroContent.layout === 'centered' ? 'active' : ''}`}
                                                                onClick={() => updateComponentContent(heroComponent?.id, 'layout', 'centered')}
                                                            >Centered</button>
                                                            <button
                                                                className={`toggle-btn ${heroContent.layout === 'full-cover' ? 'active' : ''}`}
                                                                onClick={() => updateComponentContent(heroComponent?.id, 'layout', 'full-cover')}
                                                            >Full</button>
                                                        </div>
                                                    </div>
                                                    <div className="field-group-modern">
                                                        <label>Main Headline</label>
                                                        <input
                                                            type="text"
                                                            value={heroContent.title || ''}
                                                            onChange={(e) => updateComponentContent(heroComponent?.id, 'title', e.target.value, 'hero')}
                                                            className="modern-input"
                                                            placeholder="e.g. Welcome to Storely"
                                                        />
                                                    </div>
                                                    <div className="field-group-modern full-width">
                                                        <label>Subheadline / Description</label>
                                                        <textarea
                                                            value={heroContent.subtitle || ''}
                                                            onChange={(e) => updateComponentContent(heroComponent?.id, 'subtitle', e.target.value, 'hero')}
                                                            className="modern-input modern-textarea"
                                                            rows={2}
                                                            placeholder="Tell your brand story..."
                                                        />
                                                    </div>
                                                    <div className="field-group-modern">
                                                        <label>Background Style</label>
                                                        <div className="toggle-container-modern mini">
                                                            <button
                                                                className={`toggle-btn ${!heroContent.useGradient ? 'active' : ''}`}
                                                                onClick={() => updateComponentContent(heroComponent?.id, 'useGradient', false, 'hero')}
                                                            >Image</button>
                                                            <button
                                                                className={`toggle-btn ${heroContent.useGradient ? 'active' : ''}`}
                                                                onClick={() => updateComponentContent(heroComponent?.id, 'useGradient', true, 'hero')}
                                                            >Gradient</button>
                                                        </div>
                                                    </div>
                                                    {!heroContent.useGradient ? (
                                                        <div className="field-group-modern full-width">
                                                            <div className="label-with-action">
                                                                <label>Cover Image</label>
                                                                <button
                                                                    className="text-action-btn"
                                                                    onClick={() => openAssetLibrary((url) => updateComponentContent(heroComponent?.id, 'image', url, 'hero'))}
                                                                >
                                                                    <Sparkles size={14} /> Library
                                                                </button>
                                                            </div>
                                                            <ImageUpload
                                                                value={heroContent.image}
                                                                onChange={(url) => updateComponentContent(heroComponent?.id, 'image', url, 'hero')}
                                                            />
                                                        </div>
                                                    ) : (
                                                        <div className="field-group-modern full-width">
                                                            <div className="gradient-controls-mini">
                                                                <input type="color" value={heroContent.gradientStart || '#2563eb'} onChange={(e) => updateComponentContent(heroComponent?.id, 'gradientStart', e.target.value, 'hero')} />
                                                                <ArrowRight size={14} />
                                                                <input type="color" value={heroContent.gradientEnd || '#7c3aed'} onChange={(e) => updateComponentContent(heroComponent?.id, 'gradientEnd', e.target.value, 'hero')} />
                                                            </div>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>

                                            <Separator />

                                            {/* Product Grid Sub-section */}
                                            <div className="sub-section-card">
                                                <h4 className="sub-header" style={{ marginBottom: '1rem', fontSize: '0.9rem', fontWeight: 600, color: 'var(--designer-text-muted)' }}>Product Collection</h4>
                                                <div className="fields-grid-modern">
                                                    <div className="field-group-modern">
                                                        <label>Grid Title</label>
                                                        <input
                                                            type="text"
                                                            value={gridContent.title || ''}
                                                            onChange={(e) => updateComponentContent(gridComponent?.id, 'title', e.target.value, 'product-grid')}
                                                            className="modern-input"
                                                        />
                                                    </div>
                                                    <div className="field-group-modern">
                                                        <label>Show Items</label>
                                                        <button
                                                            className="btn-manage-products"
                                                            onClick={() => {
                                                                const currentComponents = (store.settings?.components && store.settings.components.length > 0)
                                                                    ? store.settings.components
                                                                    : availableComponents;

                                                                const currentGrid = currentComponents.find(c =>
                                                                    c.type === 'product-grid' ||
                                                                    c.type === 'grid' ||
                                                                    (c.name && c.name.toLowerCase().includes('product'))
                                                                );

                                                                if (currentGrid) {
                                                                    setActivePickerComponentId(currentGrid.id);
                                                                    setShowProductPicker(true);
                                                                } else {
                                                                    toast.error('Could not identify the product collection section.');
                                                                }
                                                            }}
                                                        >
                                                            Manage Products ({selectedProductIds.length})
                                                        </button>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </AccordionSection>
                                )}

                                {/* Footer Section */}
                                {activeSection === 'footer' && (
                                    <AccordionSection
                                        id="footer"
                                        title="Footer & Social"
                                        description="Configure your store's legal links and social presence"
                                        icon={<ShoppingBag size={24} />}
                                        openSections={{ footer: true }}
                                        toggleSection={() => { }}
                                        resetToDefaults={resetToDefaults}
                                    >
                                        <div className="fields-grid-modern">
                                            <div className="field-group-modern full-width">
                                                <label>Template Presets</label>
                                                <div className="preset-selector-grid">
                                                    <button className="preset-pill" onClick={() => applyFooterPreset('minimal')}>
                                                        <span className="preset-pill-icon">✨</span>
                                                        Minimal
                                                    </button>
                                                    <button className="preset-pill" onClick={() => applyFooterPreset('bold')}>
                                                        <span className="preset-pill-icon">💪</span>
                                                        Bold
                                                    </button>
                                                    <button className="preset-pill" onClick={() => applyFooterPreset('luxury')}>
                                                        <span className="preset-pill-icon">👑</span>
                                                        Luxury
                                                    </button>
                                                </div>
                                            </div>
                                            <div className="field-group-modern full-width">
                                                <label>Copyright Text</label>
                                                <input
                                                    type="text"
                                                    value={footerContent.copyrightText || ''}
                                                    onChange={(e) => updateComponentContent(footerComp?.id, 'copyrightText', e.target.value, 'footer')}
                                                    className="modern-input"
                                                    placeholder="e.g. © 2026 Your Brand Name"
                                                />
                                            </div>
                                            <div className="field-group-modern full-width">
                                                <label>About Us Text</label>
                                                <textarea
                                                    value={footerContent.aboutText || ''}
                                                    onChange={(e) => updateComponentContent(footerComp?.id, 'aboutText', e.target.value, 'footer')}
                                                    className="modern-input modern-textarea"
                                                    rows={3}
                                                    placeholder="Brief description about your store..."
                                                />
                                            </div>
                                            <div className="field-group-modern full-width">
                                                <label>Social Accent Color</label>
                                                <div className="color-input-wrapper">
                                                    <input
                                                        type="color"
                                                        value={footerContent.socialColor || '#2563eb'}
                                                        onChange={(e) => updateComponentContent(footerComp?.id, 'socialColor', e.target.value, 'footer')}
                                                        className="color-input-modern"
                                                    />
                                                    <input
                                                        type="text"
                                                        value={footerContent.socialColor || '#2563eb'}
                                                        onChange={(e) => updateComponentContent(footerComp?.id, 'socialColor', e.target.value, 'footer')}
                                                        className="modern-input h-15"
                                                        style={{ flex: 1 }}
                                                    />
                                                </div>
                                            </div>
                                            <div className="field-group-modern full-width">
                                                <label>Footer Background</label>
                                                <div className="color-input-wrapper">
                                                    <input
                                                        type="color"
                                                        value={footerContent.backgroundColor || '#0f172a'}
                                                        onChange={(e) => updateComponentContent(footerComp?.id, 'backgroundColor', e.target.value, 'footer')}
                                                        className="color-input-modern"
                                                    />
                                                    <input
                                                        type="text"
                                                        value={footerContent.backgroundColor || '#0f172a'}
                                                        onChange={(e) => updateComponentContent(footerComp?.id, 'backgroundColor', e.target.value, 'footer')}
                                                        className="modern-input h-15"
                                                        style={{ flex: 1 }}
                                                    />
                                                </div>
                                            </div>
                                            <div className="field-group-modern full-width">
                                                <label>Facebook URL</label>
                                                <input
                                                    type="text"
                                                    value={footerContent.facebookUrl || ''}
                                                    onChange={(e) => updateComponentContent(footerComp?.id, 'facebookUrl', e.target.value, 'footer')}
                                                    className="modern-input"
                                                    placeholder="https://facebook.com/your-page"
                                                />
                                            </div>
                                            <div className="field-group-modern full-width">
                                                <label>Instagram URL</label>
                                                <input
                                                    type="text"
                                                    value={footerContent.instagramUrl || ''}
                                                    onChange={(e) => updateComponentContent(footerComp?.id, 'instagramUrl', e.target.value, 'footer')}
                                                    className="modern-input"
                                                    placeholder="https://instagram.com/your-profile"
                                                />
                                            </div>
                                            <div className="field-group-modern full-width">
                                                <label>Twitter URL</label>
                                                <input
                                                    type="text"
                                                    value={footerContent.twitterUrl || ''}
                                                    onChange={(e) => updateComponentContent(footerComp?.id, 'twitterUrl', e.target.value, 'footer')}
                                                    className="modern-input"
                                                    placeholder="https://twitter.com/your-handle"
                                                />
                                            </div>
                                            <div className="field-grid-modern" style={{ gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                                                <div className="field-group-modern">
                                                    <label>Contact Email</label>
                                                    <input
                                                        type="email"
                                                        value={footerContent.email || ''}
                                                        onChange={(e) => updateComponentContent(footerComp?.id, 'email', e.target.value, 'footer')}
                                                        className="modern-input"
                                                        placeholder="hello@brand.com"
                                                    />
                                                </div>
                                                <div className="field-group-modern">
                                                    <label>Contact Phone</label>
                                                    <input
                                                        type="text"
                                                        value={footerContent.phone || ''}
                                                        onChange={(e) => updateComponentContent(footerComp?.id, 'phone', e.target.value, 'footer')}
                                                        className="modern-input"
                                                        placeholder="+1 (555) 000-0000"
                                                    />
                                                </div>
                                            </div>
                                            <div className="field-group-modern full-width">
                                                <div className="label-with-action">
                                                    <label>Footer Links</label>
                                                    <button className="text-action-btn" onClick={addFooterLink}>
                                                        <Plus size={14} /> Add Link
                                                    </button>
                                                </div>
                                                <div className="menu-items-list">
                                                    {footerLinks.map((item, index) => (
                                                        <div key={index} className="menu-item-row">
                                                            <div className="menu-item-fields">
                                                                <input
                                                                    type="text"
                                                                    value={item.label}
                                                                    onChange={(e) => updateFooterLink(index, 'label', e.target.value)}
                                                                    placeholder="Label"
                                                                    className="modern-input"
                                                                />
                                                                <input
                                                                    type="text"
                                                                    value={item.url}
                                                                    onChange={(e) => updateFooterLink(index, 'url', e.target.value)}
                                                                    placeholder="URL"
                                                                    className="modern-input"
                                                                />
                                                            </div>
                                                            <button className="delete-menu-item" onClick={() => removeFooterLink(index)}>
                                                                <Trash2 size={18} />
                                                            </button>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        </div>
                                    </AccordionSection>
                                )}
                            </div>
                        )}
                    </div>
                </div>

                <DeviceFrame
                    device={previewDevice}
                    onDeviceChange={setPreviewDevice}
                    scale={previewScale}
                    onScaleChange={setPreviewScale}
                    onRefresh={() => setPreviewKey(prev => prev + 1)}
                    subdomain={store?.subdomain}
                >
                    <iframe
                        key={previewKey}
                        ref={iframeRef}
                        src={`${window.location.origin}/preview/${store?._id || store?.id || storeId}?preview=true&t=${previewKey}`}
                        title="Store Preview"
                        style={{ width: '100%', height: '100%', border: 'none' }}
                        onLoad={() => {
                            if (store?.settings) {
                                debouncedSendUpdate(store.settings);
                            }
                        }}
                    />
                </DeviceFrame>
            </div>

            {hasUnsavedChanges && (
                <div className="unsaved-banner">
                    <p>You have unsaved changes. Don't forget to save your design!</p>
                </div>
            )}

            {/* Asset Library Modal */}
            {showProductPicker && (
                <ProductPicker
                    products={allProducts}
                    selectedIds={getCurrentlySelectedIds()}
                    onToggle={(id) => toggleProductSelection(id, activePickerComponentId)}
                    onClose={() => setShowProductPicker(false)}
                />
            )}

            {showTemplatePicker && (
                <TemplatePicker
                    onSelect={applyTemplate}
                    onClose={() => setShowTemplatePicker(false)}
                    currentConfig={store?.settings}
                />
            )}
            {showAssetModal && (
                <div className="asset-modal-overlay" onClick={() => setShowAssetModal(false)}>
                    <div className="asset-modal-content" onClick={(e) => e.stopPropagation()}>
                        <div className="modal-header">
                            <h2>Select Asset</h2>
                            <button className="close-modal" onClick={() => setShowAssetModal(false)}><X size={24} /></button>
                        </div>
                        <div className="modal-body">
                            <AssetLibrary
                                storeId={storeId}
                                onSelectImage={handleAssetSelect}
                            />
                        </div>
                    </div>
                </div>
            )}
            <AIAssistant />
        </div>
    );
};

export default StoreCustomizer;

