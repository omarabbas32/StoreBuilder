import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import storeService from '../services/storeService';
import productService from '../services/productService';
import Card from '../components/ui/Card';
import StorefrontHero from '../components/storefront/StorefrontHero';
import StorefrontNavbar from '../components/storefront/StorefrontNavbar';
import StorefrontFooter from '../components/storefront/StorefrontFooter';
import { useStorePath } from '../hooks/useStorePath';
import StorefrontSidebar from '../components/storefront/StorefrontSidebar';
import CartDrawer from '../components/storefront/CartDrawer';
import useCartStore from '../store/cartStore';
import './Storefront.css';

const Storefront = ({ slug: slugProp }) => {
    const { slug: slugParam } = useParams();
    const slug = slugProp || slugParam;
    const [store, setStore] = useState(null);
    const [products, setProducts] = useState([]);
    const [availableComponents, setAvailableComponents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [isCartOpen, setIsCartOpen] = useState(false);
    const storePath = useStorePath();
    const addItem = useCartStore(state => state.addItem);
    const initializeSession = useCartStore(state => state.initializeSession);

    useEffect(() => {
        initializeSession();

        const handleMessage = (event) => {
            // Security: In production, you might want to check origin
            // For now, same-origin is implied or managed by the customizer
            if (event.data?.type === 'STORE_UPDATE') {
                console.log('Received live update:', event.data.settings);
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
        setLoading(true);
        const [storeResult, componentsResult] = await Promise.all([
            storeService.getStoreBySlug(slug),
            storeService.getComponents()
        ]);

        if (storeResult.success) {
            setStore(storeResult.data);

            if (componentsResult.success) {
                setAvailableComponents(componentsResult.data);
            }

            // Load products for this store
            const productsResult = await productService.getProducts(storeResult.data.id);
            if (productsResult.success) {
                setProducts(productsResult.data || []);
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

        // Use component types for stable matching
        switch (component.type) {
            case 'hero':
                return (
                    <StorefrontHero
                        key={component.id}
                        {...content}
                        brandColor={brandColor}
                        storeName={store.name}
                        description={store.description}
                    />
                );
            case 'product-grid':
                const selectedIds = Array.isArray(content.selectedProductIds)
                    ? content.selectedProductIds.map(String)
                    : [];

                const productsToShow = selectedIds.length > 0
                    ? products.filter(p => selectedIds.includes(String(p._id || p.id)))
                    : products.slice(0, 8);

                return (
                    <section key={component.id} className="products-section container" id={`section-${component.id}`}>
                        <div className="section-header-modern">
                            <h2>{content.title || 'Featured Collection'}</h2>
                            <p>{content.subtitle || 'Hand-picked selections just for you'}</p>
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
                                                    <img src={product.images[0]} alt={product.name} className="product-img" />
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
                                                addItem(product);
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
            default:
                return null;
        }
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
                    logo={store.settings?.logo_url} // Global logo fallback
                    onCartClick={() => setIsCartOpen(true)}
                />
            )}

            <main className={sidebarConfig ? "storefront-main-with-sidebar container" : "container"}>
                {sidebarConfig && (
                    <StorefrontSidebar
                        config={sidebarConfig}
                        brandColor={brandColor}
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
