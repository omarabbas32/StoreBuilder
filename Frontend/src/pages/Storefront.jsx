import { useEffect, useState, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import storeService from '../services/storeService';
import productService from '../services/productService';
import Card from '../components/ui/Card';
import categoryService from '../services/categoryService';
import StorefrontHero from '../components/storefront/StorefrontHero';
import StorefrontNavbar from '../components/storefront/StorefrontNavbar';
import StorefrontFooter from '../components/storefront/StorefrontFooter';
import { useStorePath } from '../hooks/useStorePath';
import StorefrontSidebar from '../components/storefront/StorefrontSidebar';
import CartDrawer from '../components/storefront/CartDrawer';
import SydneyHighlight from '../components/storefront/SydneyHighlight';
import useCartStore from '../store/cartStore';
import EditableText from '../components/storefront/EditableText';
import { formatImageUrl } from '../utils/imageUtils';
import Skeleton from '../components/ui/Skeleton';
import { Trash2 } from 'lucide-react';
import './Storefront.css';
import './ProductDetail.css'; // Added from instruction
import './ProductsPage.css'; // Added from instruction

const SectionWrapper = ({ children, id, onRemove, isPreview }) => {
    const [showContextMenu, setShowContextMenu] = useState(null);
    const [isVisible, setIsVisible] = useState(false);
    const sectionRef = useRef(null);

    useEffect(() => {
        if (isPreview) {
            setIsVisible(true);
            return;
        }

        const observer = new IntersectionObserver(
            ([entry]) => {
                if (entry.isIntersecting) {
                    setIsVisible(true);
                    observer.unobserve(entry.target);
                }
            },
            { threshold: 0.1, rootMargin: '0px 0px -50px 0px' }
        );

        if (sectionRef.current) {
            observer.observe(sectionRef.current);
        }

        return () => observer.disconnect();
    }, [isPreview]);

    if (!isPreview) {
        return (
            <div
                ref={sectionRef}
                className={`reveal-wrapper ${isVisible ? 'revealed' : ''}`}
            >
                {children}
            </div>
        );
    }

    const handleContextMenu = (e) => {
        e.preventDefault();
        setShowContextMenu({ x: e.clientX, y: e.clientY });
    };

    const closeMenu = () => setShowContextMenu(null);

    return (
        <div
            className="preview-section-wrapper"
            onContextMenu={handleContextMenu}
            onClick={closeMenu}
        >
            {children}
            <button
                className="section-delete-btn"
                onClick={() => onRemove(id)}
                title="Remove Section"
            >
                <Trash2 size={16} />
            </button>

            {showContextMenu && (
                <div
                    className="section-context-menu"
                    style={{ top: showContextMenu.y, left: showContextMenu.x }}
                    onMouseLeave={closeMenu}
                >
                    <button onClick={() => { onRemove(id); closeMenu(); }}>
                        <Trash2 size={14} /> Remove Section
                    </button>
                </div>
            )}
        </div>
    );
};

const Storefront = ({ slug: slugProp }) => {
    const { slug: slugParam } = useParams();
    const slug = slugProp || slugParam;
    const [store, setStore] = useState(null);
    const [products, setProducts] = useState([]);
    const [availableComponents, setAvailableComponents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [categories, setCategories] = useState([]);
    const [error, setError] = useState(null);
    const [isCartOpen, setIsCartOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const storePath = useStorePath();
    const addItem = useCartStore(state => state.addItem);
    const initializeSession = useCartStore(state => state.initializeSession);

    useEffect(() => {
        initializeSession();

        const handleMessage = (event) => {
            if (event.origin !== window.location.origin) return;

            if (event.data?.type === 'STORE_UPDATE') {
                console.log('[Storefront] Received STORE_UPDATE', event.data.settings);
                setStore(prev => ({
                    ...prev,
                    settings: event.data.settings
                }));

                // Dynamically sync fonts if they changed
                if (event.data.settings?.typography?.fontFamily) {
                    const font = event.data.settings.typography.fontFamily;
                    const headingFont = event.data.settings.typography.headingFontFamily || font;
                    const linkId = 'dynamic-google-fonts';
                    let link = document.getElementById(linkId);
                    if (!link) {
                        link = document.createElement('link');
                        link.id = linkId;
                        link.rel = 'stylesheet';
                        document.head.appendChild(link);
                    }
                    // Load all weights for both body and heading fonts
                    const weights = 'wght@300;400;500;600;700;800;900';
                    const fontNames = [...new Set([font, headingFont, 'Inter', 'Cairo'])]
                        .map(f => `family=${f.replace(/ /g, '+')}:${weights}`)
                        .join('&');
                    link.href = `https://fonts.googleapis.com/css2?${fontNames}&display=swap`;
                }
            }
        };

        window.addEventListener('message', handleMessage);
        return () => window.removeEventListener('message', handleMessage);
    }, []);

    useEffect(() => {
        loadStore();
    }, [slug]);

    const loadStore = async () => {
        if (!slug || ['checkout', 'cart', 'login', 'register', 'dashboard', 'admin', 'demo'].includes(slug)) {
            setLoading(false);
            setStore({ name: 'Your Store', settings: { primaryColor: '#2563eb', components: [] } });
            return;
        }
        setLoading(true);

        // Check if slug is a valid UUID or MongoID
        const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(slug);
        const isMongoID = /^[0-9a-fA-F]{24}$/.test(slug);
        const isId = isUUID || isMongoID;

        const [storeResult, componentsResult] = await Promise.all([
            storeService.getStoreBySlugOrId(slug),
            storeService.getComponents()
        ]);

        if (storeResult.success) {
            setStore(storeResult.data);
            const activeStoreId = storeResult.data._id || storeResult.data.id;

            if (componentsResult.success) {
                setAvailableComponents(componentsResult.data);
            }

            // Load products and categories for this store
            const [productsResult, categoriesResult] = await Promise.all([
                productService.getProducts(activeStoreId),
                categoryService.getAll(activeStoreId)
            ]);

            if (productsResult.success) {
                console.log('[Storefront] Loaded products:', productsResult.data?.length || 0);
                setProducts(productsResult.data || []);
            }
            if (categoriesResult.success) {
                setCategories(categoriesResult.data || []);
            }
        } else {
            setError(storeResult.error);
        }
        setLoading(false);
    };

    if (loading) {
        return (
            <div className="storefront">
                <div className="store-header skeleton-header">
                    <div className="container">
                        <Skeleton width="60%" height="48px" borderRadius="12px" className="mx-auto mb-4" />
                        <Skeleton width="40%" height="24px" borderRadius="6px" className="mx-auto" />
                    </div>
                </div>
                <div className="container products-section">
                    <div className="section-header-modern">
                        <Skeleton width="180px" height="36px" borderRadius="8px" className="mx-auto mb-6" />
                        <Skeleton width="70%" height="20px" borderRadius="4px" className="mx-auto" />
                    </div>
                    <div className="products-grid">
                        {[1, 2, 3, 4].map(i => (
                            <div key={i} className="product-card skeleton-card">
                                <Skeleton height="260px" borderRadius="12px" className="mb-6" />
                                <Skeleton width="90%" height="28px" className="mb-3" />
                                <Skeleton width="50%" height="24px" className="mb-6" />
                                <Skeleton height="44px" borderRadius="10px" />
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        );
    }
    if (error) return <div className="storefront-error"><h1>404</h1><p>{error}</p></div>;

    const brandColor = store?.settings?.primaryColor || '#2563eb';
    const colorPalette = store?.settings?.colorPalette || [brandColor, brandColor, brandColor];
    const typography = store?.settings?.typography || {
        fontFamily: 'Inter',
        headingSize: 'medium',
        bodySize: 'medium',
        fontWeight: 'normal'
    };

    // Standardize: fallback to availableComponents if settings.components is missing or empty
    const components = (store?.settings?.components && store.settings.components.length > 0)
        ? store.settings.components
        : availableComponents;

    // Find specific components for navbar/footer layout wrapping
    const navbarComp = components.find(c => c.type === 'navbar' || c.type === 'navigation');
    const footerComp = components.find(c => c.type === 'footer');
    const sidebarComp = components.find(c => c.type === 'sidebar');

    const getComponentConfig = (comp) => {
        if (!comp) return null;
        // 1. Precise Match (UUID)
        if (store?.settings?.componentContent?.[comp.id]) {
            return store.settings.componentContent[comp.id];
        }
        // 2. Fallback to Type (e.g., 'footer', 'hero')
        if (store?.settings?.componentContent?.[comp.type]) {
            return store.settings.componentContent[comp.type];
        }
        // 3. Fallback to Name (case-insensitive)
        const nameKey = Object.keys(store?.settings?.componentContent || {}).find(
            k => k.toLowerCase() === (comp.name || '').toLowerCase()
        );
        if (nameKey) return store.settings.componentContent[nameKey];

        return {};
    };

    const navbarConfig = getComponentConfig(navbarComp);
    const footerConfig = getComponentConfig(footerComp);
    const sidebarConfig = getComponentConfig(sidebarComp);

    const activeComponents = components;

    const isPreview = window.self !== window.top;

    const handleRemoveSection = (sectionId) => {
        if (window.parent) {
            window.parent.postMessage({
                type: 'REMOVE_SECTION',
                sectionId
            }, window.location.origin);
        }
    };

    const renderComponent = (component, filteredProducts = null) => {
        const content = getComponentConfig(component) || {};
        const type = component.type;
        const name = component.name || '';

        // Unified component identification (matching Customizer logic)
        const isHero = type === 'hero' || name.toLowerCase().includes('hero');
        const isProductGrid = type === 'product-grid' || type === 'grid' || name.toLowerCase().includes('product');

        if (isHero) {
            return (
                <SectionWrapper
                    key={component.id}
                    id={component.id}
                    isPreview={isPreview}
                    onRemove={handleRemoveSection}
                >
                    <StorefrontHero
                        componentId={component.id}
                        {...content}
                        brandColor={brandColor}
                        storeName={store.name}
                        description={store.description}
                    />
                </SectionWrapper>
            );
        }

        if (isProductGrid) {
            const selectedIds = Array.isArray(content.selectedProductIds)
                ? content.selectedProductIds.map(String)
                : [];

            // More robust product matching (checks both _id and id)
            const matchedProducts = selectedIds.map(id => products.find(p => String(p._id) === id || String(p.id) === id)).filter(Boolean);
            console.log(`[Storefront] Product matching for grid ${component.id}: selected=${selectedIds.length}, found=${matchedProducts.length}`);

            const productsToShow = filteredProducts || (selectedIds.length > 0
                ? matchedProducts
                : products.slice(0, 8));

            return (
                <SectionWrapper
                    key={component.id}
                    id={component.id}
                    isPreview={isPreview}
                    onRemove={handleRemoveSection}
                >
                    <section className="products-section container" id={`section-${component.id}`}>
                        <div className="section-header-modern">
                            <EditableText
                                tag="h2"
                                value={content.title}
                                componentId={component.id}
                                field="title"
                                placeholder="Featured Collection"
                            />
                        </div>
                        {productsToShow.length === 0 ? (
                            <p className="no-products">No products matched the selection.</p>
                        ) : (
                            <div className="products-grid">
                                {productsToShow.map(product => (
                                    <Card key={product._id || product.id} className="product-card">
                                        <Link to={`${storePath}/product/${product._id || product.id}`} className="product-link">
                                            <div className="product-image-container">
                                                {product.images?.[0] ? (
                                                    <img src={formatImageUrl(product.images[0])} alt={product.name} className="product-img" />
                                                ) : (
                                                    <div className="product-image-placeholder">
                                                        <div className="image-icon">🛍️</div>
                                                    </div>
                                                )}
                                            </div>
                                            <div className="product-info">
                                                <h3>{product.name}</h3>
                                                <p className="product-price">${product.price}</p>
                                            </div>
                                        </Link>
                                        <button
                                            className="add-to-cart"
                                            style={{ backgroundColor: brandColor }}
                                            onClick={() => {
                                                // Explicitly include storeId to ensure cart context
                                                const storeId = store?.id || store?._id || activeStoreId;
                                                addItem({ ...product, storeId });
                                                setIsCartOpen(true);
                                            }}
                                        >
                                            Add to Cart
                                        </button>
                                    </Card>
                                ))}
                            </div>
                        )}
                    </section>
                </SectionWrapper>
            );
        }

        const isHighlight = type === 'highlight' || name.toLowerCase().includes('highlight');
        if (isHighlight) {
            return (
                <SectionWrapper
                    key={component.id}
                    id={component.id}
                    isPreview={isPreview}
                    onRemove={handleRemoveSection}
                >
                    <section className="highlight-section container" id={`section-${component.id}`}>
                        <SydneyHighlight
                            {...content}
                            brandColor={brandColor}
                        />
                    </section>
                </SectionWrapper>
            );
        }

        return null;
    };

    const fontSizeMap = {
        'small': '0.875rem',
        'medium': '1rem',
        'large': '1.25rem',
        'extra-large': '1.5rem'
    };

    const headingSizeMap = {
        'small': '1.5rem',
        'medium': '2rem',
        'large': '2.5rem',
        'extra-large': '3.5rem'
    };

    // Apply CSS variables for color palette and typography
    const cssVariables = {
        '--primary-color': brandColor,
        '--primary-color-rgb': brandColor.startsWith('#') ? hexToRgb(brandColor) : '37, 99, 235',
        '--color-palette-primary': colorPalette[0] || brandColor,
        '--color-palette-secondary': colorPalette[1] || brandColor,
        '--color-palette-accent': colorPalette[2] || brandColor,
        '--font-family': typography.fontFamily || 'Inter',
        '--heading-font-family': typography.headingFontFamily || typography.fontFamily || 'Inter',
        '--font-weight': typography.fontWeight === 'bold' ? 'var(--font-bold)' : (typography.fontWeight === 'light' ? 'var(--font-light)' : 'var(--font-normal)'),
        '--base-font-size': fontSizeMap[typography.bodySize] || '1rem',
        '--heading-font-size-config': headingSizeMap[typography.headingSize], // Pass specific config if set
        '--line-height': typography.lineHeight || '1.6',
        '--letter-spacing': typography.letterSpacing || '0px',
        '--color-text': '#0f172a',
        '--color-text-muted': '#64748b',
        '--color-bg': '#ffffff',
    };

    return (
        <div className="storefront" style={cssVariables}>
            {navbarConfig && (
                <StorefrontNavbar
                    config={navbarConfig}
                    componentId={navbarComp?.id}
                    brandColor={brandColor}
                    storeName={store.name}
                    logo={store.settings?.logo_url ? formatImageUrl(store.settings.logo_url) : null}
                    onCartClick={() => setIsCartOpen(true)}
                    onSearch={setSearchQuery}
                    searchQuery={searchQuery}
                />
            )}

            {/* Hero Section - Full Width */}
            {activeComponents
                .filter(c => !c.disabled)
                .filter(c => c.type === 'hero' || (c.name && c.name.toLowerCase().includes('hero')))
                .map(comp => renderComponent(comp))}

            {/* Main Content with Sidebar */}
            <main className={sidebarConfig ? "storefront-main-with-sidebar container" : "container"}>
                {sidebarConfig && (
                    <StorefrontSidebar
                        config={sidebarConfig}
                        componentId={sidebarComp?.id}
                        brandColor={brandColor}
                        categories={categories}
                        onSearch={setSearchQuery}
                        searchQuery={searchQuery}
                    />
                )}
                <div className="storefront-content">
                    {activeComponents
                        .filter(c => !c.disabled)
                        .filter(c => !['navigation', 'navbar', 'footer', 'sidebar', 'hero'].includes(c.type))
                        .filter(c => !(c.name && c.name.toLowerCase().includes('hero')))
                        .map(comp => {
                            // Filter products for the product grid if search is active
                            if (searchQuery.trim() && (comp.type === 'product-grid' || comp.type === 'grid' || (comp.name && comp.name.toLowerCase().includes('product')))) {
                                const query = searchQuery.toLowerCase();
                                const filtered = products.filter(p =>
                                    p.name.toLowerCase().includes(query) ||
                                    (p.description && p.description.toLowerCase().includes(query))
                                );
                                return renderComponent(comp, filtered);
                            }
                            return renderComponent(comp);
                        })}
                </div>
            </main>

            {footerConfig !== null ? (
                <StorefrontFooter
                    config={footerConfig}
                    brandColor={brandColor}
                    storeName={store.name}
                    socialLinks={{
                        facebook: store.facebook_url,
                        instagram: store.instagram_url,
                        twitter: store.twitter_url,
                        linkedin: store.linkedin_url,
                        tiktok: store.tiktok_url
                    }}
                />
            ) : (
                <footer className="store-footer">
                    <div className="container">
                        <p>&copy; {new Date().getFullYear()} {store.name}. Powered by Storely.</p>
                    </div>
                </footer>
            )}

            <CartDrawer
                isOpen={isCartOpen}
                onClose={() => setIsCartOpen(false)}
                brandColor={brandColor}
            />
        </div >
    );
};

// Helper for RGB conversion
const hexToRgb = (hex) => {
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);
    return `${r}, ${g}, ${b}`;
};

export default Storefront;
