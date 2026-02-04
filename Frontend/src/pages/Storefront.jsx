import { useEffect, useState } from 'react';
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
import './Storefront.css';
import './ProductDetail.css'; // Added from instruction
import './ProductsPage.css'; // Added from instruction

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

    if (loading) return <div className="storefront-loading">Loading store...</div>;
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

    const navbarConfig = navbarComp ? (store?.settings?.componentContent?.[navbarComp.id] || {}) : null;
    const footerConfig = footerComp ? (store?.settings?.componentContent?.[footerComp.id] || {}) : null;
    const sidebarConfig = sidebarComp ? (store?.settings?.componentContent?.[sidebarComp.id] || {}) : null;

    const activeComponents = components;

    const renderComponent = (component) => {
        const content = store?.settings?.componentContent?.[component.id] || {};
        const type = component.type;
        const name = component.name || '';

        // Unified component identification (matching Customizer logic)
        const isHero = type === 'hero' || name.toLowerCase().includes('hero');
        const isProductGrid = type === 'product-grid' || type === 'grid' || name.toLowerCase().includes('product');

        if (isHero) {
            return (
                <StorefrontHero
                    key={component.id}
                    componentId={component.id}
                    {...content}
                    brandColor={brandColor}
                    storeName={store.name}
                    description={store.description}
                />
            );
        }

        if (isProductGrid) {
            const selectedIds = Array.isArray(content.selectedProductIds)
                ? content.selectedProductIds.map(String)
                : [];

            // More robust product matching (checks both _id and id)
            const matchedProducts = selectedIds.map(id => products.find(p => String(p._id) === id || String(p.id) === id)).filter(Boolean);
            console.log(`[Storefront] Product matching for grid ${component.id}: selected=${selectedIds.length}, found=${matchedProducts.length}`);

            const productsToShow = selectedIds.length > 0
                ? matchedProducts
                : products.slice(0, 8);

            return (
                <section key={component.id} className="products-section container" id={`section-${component.id}`}>
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
            );
        }

        const isHighlight = type === 'highlight' || name.toLowerCase().includes('highlight');
        if (isHighlight) {
            return (
                <section key={component.id} className="highlight-section container" id={`section-${component.id}`}>
                    <SydneyHighlight
                        {...content}
                        brandColor={brandColor}
                    />
                </section>
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
        '--color-palette-primary': colorPalette[0] || brandColor,
        '--color-palette-secondary': colorPalette[1] || brandColor,
        '--color-palette-accent': colorPalette[2] || brandColor,
        '--font-family': typography.fontFamily,
        '--heading-font-family': typography.headingFontFamily || typography.fontFamily,
        '--font-weight': typography.fontWeight === 'bold' ? '700' : (typography.fontWeight === 'light' ? '300' : '400'),
        '--base-font-size': fontSizeMap[typography.bodySize] || '1rem',
        '--heading-font-size': headingSizeMap[typography.headingSize] || '2rem',
        '--line-height': typography.lineHeight || '1.6',
        '--letter-spacing': typography.letterSpacing || '0px',
    };

    return (
        <div className="storefront" style={cssVariables}>
            {navbarConfig && (
                <StorefrontNavbar
                    config={navbarConfig}
                    brandColor={brandColor}
                    storeName={store.name}
                    logo={store.settings?.logo_url ? formatImageUrl(store.settings.logo_url) : null} // Standardized logo URL
                    onCartClick={() => setIsCartOpen(true)}
                />
            )}

            <main className={sidebarConfig ? "storefront-main-with-sidebar container" : "container"}>
                {sidebarConfig && (
                    <StorefrontSidebar
                        config={sidebarConfig}
                        brandColor={brandColor}
                        categories={categories}
                    />
                )}
                <div className="storefront-content">
                    {activeComponents
                        .filter(c => !c.disabled)
                        .filter(c => !['navigation', 'navbar', 'footer', 'sidebar'].includes(c.type))
                        .map(renderComponent)}
                </div>
            </main>

            {footerConfig !== null ? (
                <StorefrontFooter
                    config={footerConfig}
                    brandColor={brandColor}
                    storeName={store.name}
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

export default Storefront;
