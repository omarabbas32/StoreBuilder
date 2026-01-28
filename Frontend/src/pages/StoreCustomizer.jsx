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
    Maximize2
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
import {
    DndContext,
    closestCenter,
    PointerSensor,
    KeyboardSensor,
    useSensor,
    useSensors
} from '@dnd-kit/core';
import {
    arrayMove,
    SortableContext,
    sortableKeyboardCoordinates,
    verticalListSortingStrategy
} from '@dnd-kit/sortable';
import { debounce } from '../utils/debounce';
import { safeSettingsUpdate } from '../utils/settingsMerge';
import { validateStoreSettings } from '../utils/validation';
import toast from 'react-hot-toast';
import './StoreCustomizer.css';

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
    const [draftAvailable, setDraftAvailable] = useState(null);
    const [history, setHistory] = useState([]);
    const [historyIndex, setHistoryIndex] = useState(-1);
    const [showAssetModal, setShowAssetModal] = useState(false);
    const [assetCallback, setAssetCallback] = useState(null);
    const isUndoing = useRef(false);
    const iframeRef = useRef(null);
    const saveTimeoutRef = useRef(null);
    const [autoSaveStatus, setAutoSaveStatus] = useState(null); // 'saving', 'saved', null

    const sensors = useSensors(
        useSensor(PointerSensor, {
            activationConstraint: {
                distance: 8, // Avoid accidental drags during clicks
            },
        }),
        useSensor(KeyboardSensor, {
            coordinateGetter: sortableKeyboardCoordinates,
        })
    );

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
                config: store.settings,
                screenshot_url: settings.logo_url // Use logo as temporary screenshot
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
            const comp = currentComponents.find(c => c.type === typeFallback);
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

    const handleDragEnd = (event) => {
        const { active, over } = event;

        if (active.id !== over.id) {
            setStore((prev) => {
                const currentComponents = prev.settings?.components || availableComponents;
                const oldIndex = currentComponents.findIndex((c) => c.id === active.id);
                const newIndex = currentComponents.findIndex((c) => c.id === over.id);

                const newComponents = arrayMove(currentComponents, oldIndex, newIndex);

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
        }
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

        if (type === 'branding') {
            updateSettingsField('logo_url', '');
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
                image: ''
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

    const typography = settings.typography || {
        fontFamily: 'Inter',
        headingSize: 'medium',
        bodySize: 'medium',
        fontWeight: 'normal'
    };

    const navbarComp = components.find(c => ['navbar', 'navigation'].includes(c.type));
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
        <div className="store-customizer-modern" role="application" aria-label="Store Designer">
            <header className="designer-header" role="banner">
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
                    <div className="history-controls">
                        <button
                            onClick={undo}
                            disabled={historyIndex <= 0}
                            className="toolbar-btn dark"
                            title="Undo (Ctrl+Z)"
                        >
                            <Undo size={18} />
                        </button>
                        <button
                            onClick={redo}
                            disabled={historyIndex >= history.length - 1}
                            className="toolbar-btn dark"
                            title="Redo (Ctrl+Y)"
                        >
                            <Redo size={18} />
                        </button>
                        {autoSaveStatus && (
                            <span className={`auto-save-indicator ${autoSaveStatus}`}>
                                {autoSaveStatus === 'saving' ? 'Saving...' : '✓ Saved'}
                            </span>
                        )}
                    </div>
                    <div className="toolbar-divider" />
                    <Button
                        onClick={() => setPreviewMode(previewMode === 'split' ? 'full' : 'split')}
                        className="btn-glass"
                    >
                        {previewMode === 'split' ? <Minimize2 size={18} /> : <Maximize2 size={18} />}
                        {previewMode === 'split' ? 'Full Editor' : 'Show Preview'}
                    </Button>
                    <Button
                        onClick={handleSaveAsTemplate}
                        className="btn-glass"
                        title="Save this design as a template"
                        disabled={saving}
                    >
                        <Sparkles size={18} />
                        Save as Template
                    </Button>
                    <Button
                        onClick={handleSave}
                        className="save-btn-modern"
                        loading={saving}
                        disabled={saving || !hasUnsavedChanges}
                    >
                        {!saving && <Save size={18} />}
                        Save Design
                    </Button>
                </div>
            </header>

            <div className="designer-main-container">
                <div className={`designer-sidebar ${previewMode === 'split' ? 'split' : ''}`} role="region" aria-label="Customization Options">
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
                                <button className="reset-section-btn" onClick={() => resetToDefaults('branding')}>Reset</button>
                            </div>

                            <div className="branding-grid">
                                <div className="field-group-modern">
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
                                <div className="field-group-modern">
                                    <label>Brand Colors</label>
                                    <ColorPalettePicker
                                        value={settings.colorPalette || [settings.primaryColor || '#2563eb']}
                                        onChange={(colors) => {
                                            updateSettingsFields({
                                                colorPalette: colors,
                                                primaryColor: colors[0] // Keep backward compatible
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
                        </section>

                        {/* Section: Component Visibility */}
                        <section className="customizer-card">
                            <div className="card-header-modern">
                                <div className="icon-wrapper">
                                    <Eye size={24} />
                                </div>
                                <div>
                                    <h2>Page Sections</h2>
                                    <p>Enable or disable visible sections on your homepage</p>
                                </div>
                            </div>

                            <div className="visibility-controls-grid">
                                <DndContext
                                    sensors={sensors}
                                    collisionDetection={closestCenter}
                                    onDragEnd={handleDragEnd}
                                >
                                    <SortableContext
                                        items={components
                                            .filter(c => !['navigation', 'navbar', 'footer'].includes(c.type))
                                            .map(c => c.id)}
                                        strategy={verticalListSortingStrategy}
                                    >
                                        {components
                                            .filter(c => !['navigation', 'navbar', 'footer'].includes(c.type))
                                            .map(component => (
                                                <SortableComponentItem
                                                    key={component.id}
                                                    component={component}
                                                    onToggleVisibility={updateComponentVisibility}
                                                    onDuplicate={duplicateComponent}
                                                />
                                            ))
                                        }
                                    </SortableContext>
                                </DndContext>
                            </div>
                        </section>

                        {/* Section: Typography */}
                        <section className="customizer-card">
                            <div className="card-header-modern">
                                <div className="icon-wrapper">
                                    <Type size={24} />
                                </div>
                                <div>
                                    <h2>Typography</h2>
                                    <p>Choose fonts and text styles for your store</p>
                                </div>
                                <button className="reset-section-btn" onClick={() => resetToDefaults('typography')}>Reset</button>
                            </div>

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
                                    <label>Font Weight</label>
                                    <select
                                        className="modern-input"
                                        value={typography.fontWeight}
                                        onChange={(e) => updateSettingsField('typography', (prev) => ({ ...(prev || {}), fontWeight: e.target.value }))}
                                    >
                                        <option value="light">Light</option>
                                        <option value="normal">Normal</option>
                                        <option value="medium">Medium</option>
                                        <option value="bold">Bold</option>
                                    </select>
                                </div>
                                <div className="field-group-modern">
                                    <label>Line Height</label>
                                    <select
                                        className="modern-input"
                                        value={typography.lineHeight || '1.6'}
                                        onChange={(e) => updateSettingsField('typography', (prev) => ({ ...(prev || {}), lineHeight: e.target.value }))}
                                    >
                                        <option value="1.2">Tight (1.2)</option>
                                        <option value="1.4">Normal (1.4)</option>
                                        <option value="1.6">Relaxed (1.6)</option>
                                        <option value="2.0">Loose (2.0)</option>
                                    </select>
                                </div>
                                <div className="field-group-modern">
                                    <label>Letter Spacing</label>
                                    <select
                                        className="modern-input"
                                        value={typography.letterSpacing || '0px'}
                                        onChange={(e) => updateSettingsField('typography', (prev) => ({ ...(prev || {}), letterSpacing: e.target.value }))}
                                    >
                                        <option value="-0.5px">Tight (-0.5px)</option>
                                        <option value="0px">Normal (0px)</option>
                                        <option value="0.5px">Wide (0.5px)</option>
                                        <option value="1px">Wider (1px)</option>
                                    </select>
                                </div>
                            </div>
                        </section>

                        {/* Section: Navigation Menu */}
                        <section className="customizer-card">
                            <div className="card-header-modern">
                                <div className="icon-wrapper">
                                    <MenuIcon size={24} />
                                </div>
                                <div>
                                    <h2>Navigation Menu</h2>
                                    <p>Manage links in your store's header</p>
                                </div>
                                <div className="header-actions-inline">
                                    <button className="reset-section-btn" onClick={() => resetToDefaults('navbar')}>Reset</button>
                                    <Button variant="secondary" size="sm" onClick={addMenuItem} className="reset-section-btn">
                                        <Plus size={16} /> Add Link
                                    </Button>
                                </div>
                            </div>

                            <div className="menu-items-list">
                                {menuItems.length === 0 ? (
                                    <div className="empty-state-menu">No custom links added yet.</div>
                                ) : (
                                    menuItems.map((item, index) => (
                                        <div key={index} className="menu-item-row">
                                            <div className="menu-item-drag-handles">
                                                <button onClick={() => moveMenuItem(index, 'up')} disabled={index === 0}><ChevronUp size={16} /></button>
                                                <button onClick={() => moveMenuItem(index, 'down')} disabled={index === menuItems.length - 1}><ChevronDown size={16} /></button>
                                            </div>
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
                        </section>

                        {/* Section: Assets Library (New) */}
                        <section className="customizer-card">
                            <div className="card-header-modern">
                                <div className="icon-wrapper">
                                    <ImageIcon size={24} />
                                </div>
                                <div style={{ flex: 1 }}>
                                    <h2>Asset Library</h2>
                                    <p>Manage and reuse your uploaded images</p>
                                </div>
                            </div>
                            <div className="assets-sidebar-compact">
                                <AssetLibrary
                                    storeId={storeId}
                                    onSelectImage={(img) => {
                                        // Just view in sidebar, no auto-select for global view
                                    }}
                                />
                            </div>
                        </section>

                        {/* Section: Footer Customization */}
                        <section className="customizer-card">
                            <div className="card-header-modern">
                                <div className="icon-wrapper">
                                    <ImageIcon size={24} />
                                </div>
                                <div>
                                    <h2>Footer Customization</h2>
                                    <p>Configure your storefront footer information</p>
                                </div>
                                <button className="reset-section-btn" onClick={() => resetToDefaults('footer')}>Reset</button>
                            </div>

                            <div className="fields-grid-modern">
                                <div className="field-group-modern full-width">
                                    <label>Copyright Text</label>
                                    <input
                                        type="text"
                                        value={footerContent.copyrightText || footerContent.copyright || ''}
                                        onChange={(e) => updateComponentContent(footerComp?.id, 'copyrightText', e.target.value, 'footer')}
                                        placeholder="e.g. Ac 2026 Your Store"
                                        className="modern-input"
                                    />
                                </div>
                                <div className="field-group-modern">
                                    <label>Footer Background</label>
                                    <input
                                        type="color"
                                        value={footerContent.backgroundColor || '#0f172a'}
                                        onChange={(e) => updateComponentContent(footerComp?.id, 'backgroundColor', e.target.value, 'footer')}
                                        className="color-input-modern"
                                    />
                                </div>
                                <div className="field-group-modern">
                                    <label>Social Icon Color</label>
                                    <input
                                        type="color"
                                        value={footerContent.socialColor || store.settings?.primaryColor || '#2563eb'}
                                        onChange={(e) => updateComponentContent(footerComp?.id, 'socialColor', e.target.value, 'footer')}
                                        className="color-input-modern"
                                    />
                                </div>
                                <div className="field-group-modern full-width">
                                    <label>About Text</label>
                                    <textarea
                                        value={footerContent.aboutText || ''}
                                        onChange={(e) => updateComponentContent(footerComp?.id, 'aboutText', e.target.value, 'footer')}
                                        placeholder="Tell customers about your store"
                                        className="modern-input modern-textarea"
                                        rows={3}
                                    />
                                </div>
                                <div className="field-group-modern">
                                    <label>Contact Email</label>
                                    <input
                                        type="email"
                                        value={footerContent.email || ''}
                                        onChange={(e) => updateComponentContent(footerComp?.id, 'email', e.target.value, 'footer')}
                                        placeholder="you@example.com"
                                        className="modern-input"
                                    />
                                </div>
                                <div className="field-group-modern">
                                    <label>Contact Phone</label>
                                    <input
                                        type="tel"
                                        value={footerContent.phone || ''}
                                        onChange={(e) => updateComponentContent(footerComp?.id, 'phone', e.target.value, 'footer')}
                                        placeholder="+1 555 123 4567"
                                        className="modern-input"
                                    />
                                </div>
                                <div className="field-group-modern">
                                    <label>Social Icons</label>
                                    <div className="toggle-container-modern">
                                        <button
                                            className={`toggle-btn ${footerContent.showSocial !== false ? 'active' : ''}`}
                                            onClick={() => updateComponentContent(footerComp?.id, 'showSocial', true, 'footer')}
                                        >
                                            Show
                                        </button>
                                        <button
                                            className={`toggle-btn ${footerContent.showSocial === false ? 'active' : ''}`}
                                            onClick={() => updateComponentContent(footerComp?.id, 'showSocial', false, 'footer')}
                                        >
                                            Hide
                                        </button>
                                    </div>
                                </div>
                                <div className="field-group-modern">
                                    <label>Facebook URL</label>
                                    <input
                                        type="text"
                                        value={footerContent.facebookUrl || ''}
                                        onChange={(e) => updateComponentContent(footerComp?.id, 'facebookUrl', e.target.value, 'footer')}
                                        placeholder="https://facebook.com/yourpage"
                                        className="modern-input"
                                    />
                                </div>
                                <div className="field-group-modern">
                                    <label>Instagram URL</label>
                                    <input
                                        type="text"
                                        value={footerContent.instagramUrl || ''}
                                        onChange={(e) => updateComponentContent(footerComp?.id, 'instagramUrl', e.target.value, 'footer')}
                                        placeholder="https://instagram.com/yourpage"
                                        className="modern-input"
                                    />
                                </div>
                                <div className="field-group-modern">
                                    <label>Twitter URL</label>
                                    <input
                                        type="text"
                                        value={footerContent.twitterUrl || ''}
                                        onChange={(e) => updateComponentContent(footerComp?.id, 'twitterUrl', e.target.value, 'footer')}
                                        placeholder="https://twitter.com/yourpage"
                                        className="modern-input"
                                    />
                                </div>
                                <div className="field-group-modern full-width">
                                    <div className="label-with-action">
                                        <label>About Links</label>
                                        <button
                                            className="text-action-btn"
                                            onClick={addFooterLink}
                                        >
                                            <Plus size={14} /> Add Link
                                        </button>
                                    </div>
                                    <div className="menu-items-list">
                                        {footerLinks.length === 0 ? (
                                            <div className="empty-state-menu">No footer links yet.</div>
                                        ) : (
                                            footerLinks.map((item, index) => (
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
                                                            placeholder="URL (e.g. /about)"
                                                            className="modern-input"
                                                        />
                                                    </div>
                                                    <button className="delete-menu-item" onClick={() => removeFooterLink(index)}>
                                                        <Trash2 size={18} />
                                                    </button>
                                                </div>
                                            ))
                                        )}
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
                                        onChange={(e) => updateComponentContent(heroComponent?.id, 'title', e.target.value, 'hero')}
                                        placeholder="e.g. Welcome to Our Store"
                                        className="modern-input"
                                    />
                                </div>
                                <div className="field-group-modern">
                                    <label>Subheadline</label>
                                    <input
                                        type="text"
                                        value={heroContent.subtitle || ''}
                                        onChange={(e) => updateComponentContent(heroComponent?.id, 'subtitle', e.target.value, 'hero')}
                                        placeholder="e.g. Discover amazing products"
                                        className="modern-input"
                                    />
                                </div>
                                <div className="field-group-modern">
                                    <label>Button Text (CTA)</label>
                                    <input
                                        type="text"
                                        value={heroContent.ctaText || ''}
                                        onChange={(e) => updateComponentContent(heroComponent?.id, 'ctaText', e.target.value, 'hero')}
                                        placeholder="e.g. Shop Now"
                                        className="modern-input"
                                    />
                                </div>
                                <div className="field-group-modern full-width">
                                    <div className="bg-type-selector">
                                        <label className="sub-label">Background Style</label>
                                        <div className="toggle-container-modern mini">
                                            <button
                                                className={`toggle-btn ${!heroContent.useGradient ? 'active' : ''}`}
                                                onClick={() => updateComponentContent(heroComponent?.id, 'useGradient', false, 'hero')}
                                            >
                                                Image
                                            </button>
                                            <button
                                                className={`toggle-btn ${heroContent.useGradient ? 'active' : ''}`}
                                                onClick={() => updateComponentContent(heroComponent?.id, 'useGradient', true, 'hero')}
                                            >
                                                Gradient
                                            </button>
                                        </div>
                                    </div>

                                    {!heroContent.useGradient ? (
                                        <div className="image-bg-controls">
                                            <div className="label-with-action">
                                                <label>Hero Cover Image</label>
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
                                        <div className="gradient-controls-grid">
                                            <div className="field-group-modern">
                                                <label>Start Color</label>
                                                <input
                                                    type="color"
                                                    value={heroContent.gradientStart || '#2563eb'}
                                                    onChange={(e) => updateComponentContent(heroComponent?.id, 'gradientStart', e.target.value, 'hero')}
                                                    className="color-input-modern"
                                                />
                                            </div>
                                            <div className="field-group-modern">
                                                <label>End Color</label>
                                                <input
                                                    type="color"
                                                    value={heroContent.gradientEnd || '#7c3aed'}
                                                    onChange={(e) => updateComponentContent(heroComponent?.id, 'gradientEnd', e.target.value, 'hero')}
                                                    className="color-input-modern"
                                                />
                                            </div>
                                            <div className="field-group-modern">
                                                <label>Type</label>
                                                <select
                                                    className="modern-input"
                                                    value={heroContent.gradientType || 'linear'}
                                                    onChange={(e) => updateComponentContent(heroComponent?.id, 'gradientType', e.target.value, 'hero')}
                                                >
                                                    <option value="linear">Linear</option>
                                                    <option value="radial">Radial</option>
                                                </select>
                                            </div>
                                            {heroContent.gradientType !== 'radial' && (
                                                <div className="field-group-modern">
                                                    <label>Angle</label>
                                                    <select
                                                        className="modern-input"
                                                        value={heroContent.gradientAngle || '135deg'}
                                                        onChange={(e) => updateComponentContent(heroComponent?.id, 'gradientAngle', e.target.value, 'hero')}
                                                    >
                                                        <option value="0deg">To Top</option>
                                                        <option value="90deg">To Right</option>
                                                        <option value="180deg">To Bottom</option>
                                                        <option value="270deg">To Left</option>
                                                        <option value="135deg">Diagonal</option>
                                                    </select>
                                                </div>
                                            )}
                                        </div>
                                    )}
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
                                        onChange={(e) => updateComponentContent(gridComponent?.id, 'title', e.target.value, 'product-grid')}
                                        placeholder="e.g. Featured Collection"
                                        className="modern-input"
                                    />
                                </div>
                                <div className="field-group-modern">
                                    <label>Grid Subtitle</label>
                                    <input
                                        type="text"
                                        value={gridContent.subtitle || ''}
                                        onChange={(e) => updateComponentContent(gridComponent?.id, 'subtitle', e.target.value, 'product-grid')}
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
                </div>

                {previewMode === 'split' && (
                    <div className="designer-preview" role="complementary" aria-label="Store Preview">
                        <div className="preview-toolbar">
                            <button
                                className={`toolbar-btn ${previewDevice === 'mobile' ? 'active' : ''}`}
                                onClick={() => setPreviewDevice('mobile')}
                                title="Mobile Preview"
                            >
                                <Smartphone size={18} />
                            </button>
                            <button
                                className={`toolbar-btn ${previewDevice === 'tablet' ? 'active' : ''}`}
                                onClick={() => setPreviewDevice('tablet')}
                                title="Tablet Preview"
                            >
                                <Tablet size={18} />
                            </button>
                            <button
                                className={`toolbar-btn ${previewDevice === 'desktop' ? 'active' : ''}`}
                                onClick={() => setPreviewDevice('desktop')}
                                title="Desktop Preview"
                            >
                                <Monitor size={18} />
                            </button>

                            <div className="toolbar-divider" />

                            <a
                                href={`/${store?.slug}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="toolbar-btn"
                                title="Open in new tab"
                            >
                                <Eye size={18} />
                            </a>
                        </div>

                        <div className="preview-iframe-wrapper">
                            <div className={`preview-iframe-container ${previewDevice}`}>
                                <iframe
                                    ref={iframeRef}
                                    src={previewMode === 'split' ? `/${store?.slug}?preview=true` : 'about:blank'}
                                    title="Store Preview"
                                    loading="lazy"
                                    onLoad={() => {
                                        if (iframeRef.current && store?.settings && previewMode === 'split') {
                                            iframeRef.current.contentWindow.postMessage({
                                                type: 'STORE_UPDATE',
                                                settings: store.settings
                                            }, window.location.origin);
                                        }
                                    }}
                                />
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {hasUnsavedChanges && (
                <div className="unsaved-banner">
                    <p>You have unsaved changes. Don't forget to save your design!</p>
                </div>
            )}

            {/* Asset Library Modal */}
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
        </div>
    );
};

export default StoreCustomizer;
