import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import storeService from '../services/storeService';
import productService from '../services/productService';
import Card from '../components/ui/Card';
import SydneyHero from '../components/storefront/SydneyHero';
import SydneyHighlight from '../components/storefront/SydneyHighlight';
import SydneyAttributeGrid from '../components/storefront/SydneyAttributeGrid';
import StorefrontNavbar from '../components/storefront/StorefrontNavbar';
import StorefrontFooter from '../components/storefront/StorefrontFooter';
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
    const addItem = useCartStore(state => state.addItem);
    const initializeSession = useCartStore(state => state.initializeSession);

    useEffect(() => {
        initializeSession();
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
    const componentIds = store?.settings?.componentIds || [];

    // Get navbar and footer configs
    const navbarComponent = availableComponents.find(c => c.name === 'Store Navbar');
    const footerComponent = availableComponents.find(c => c.name === 'Store Footer');
    const sidebarComponent = availableComponents.find(c => c.name === 'Category Sidebar');

    const navbarConfig = navbarComponent && componentIds.includes(navbarComponent.id)
        ? store?.settings?.componentContent?.[navbarComponent.id]
        : null;
    const footerConfig = footerComponent && componentIds.includes(footerComponent.id)
        ? store?.settings?.componentContent?.[footerComponent.id]
        : null;
    const sidebarConfig = sidebarComponent && componentIds.includes(sidebarComponent.id)
        ? store?.settings?.componentContent?.[sidebarComponent.id]
        : null;

    // Filter and sort components based on store settings order
    const activeComponents = componentIds
        .map(id => availableComponents.find(c => c.id === id))
        .filter(Boolean);

    const renderComponent = (component) => {
        const content = store?.settings?.componentContent?.[component.id] || {};

        switch (component.name) {
            case 'Sydney Hero':
                return <SydneyHero key={component.id} {...content} brandColor={brandColor} />;
            case 'Sydney Highlight':
                return <SydneyHighlight key={component.id} {...content} brandColor={brandColor} />;
            case 'Sydney Attributes':
                return <SydneyAttributeGrid key={component.id} {...content} />;
            case 'Sydney Product Grid':
                return (
                    <section key={component.id} className="products-section container">
                        <h2>{content.title || 'Our Products'}</h2>
                        {products.length === 0 ? (
                            <p className="no-products">No products available in this store yet.</p>
                        ) : (
                            <div className="products-grid">
                                {products.slice(0, content.limit || 4).map(product => (
                                    <Card key={product.id} className="product-card">
                                        <Link to={`/product/${product.id}`} className="product-link">
                                            <div className="product-image-placeholder">
                                                <div className="image-icon">🛍️</div>
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

    return (
        <div className="storefront" style={{ '--primary-color': brandColor }}>
            {navbarConfig && (
                <StorefrontNavbar
                    config={navbarConfig}
                    brandColor={brandColor}
                    storeName={store.name}
                    onCartClick={() => setIsCartOpen(true)}
                />
            )}

            {!componentIds.length ? (
                // Fallback / Default view if no components selected
                <>
                    <header className="store-header">
                        <div className="container">
                            <h1 className="store-name">{store.name}</h1>
                            <p className="store-description">{store.description}</p>
                        </div>
                    </header>
                    <main className="container">
                        <section className="products-section">
                            <h2>Our Products</h2>
                            <div className="products-grid">
                                {products.map(product => (
                                    <Card key={product.id} className="product-card">
                                        <Link to={`/product/${product.id}`} className="product-link">
                                            <div className="product-image-placeholder">
                                                <div className="image-icon">🛍️</div>
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
                        </section>
                    </main>
                </>
            ) : (
                <main className={sidebarConfig ? "storefront-main-with-sidebar container" : "container"}>
                    {sidebarConfig && (
                        <StorefrontSidebar
                            config={sidebarConfig}
                            brandColor={brandColor}
                        />
                    )}
                    <div className="storefront-content">
                        {activeComponents
                            .filter(c => !['navigation', 'footer', 'sidebar'].includes(c.type))
                            .map(renderComponent)}
                    </div>
                </main>
            )}

            <footer className="store-footer">
                <div className="container">
                    <p>&copy; {new Date().getFullYear()} {store.name}. Powered by Storely.</p>
                </div>
            </footer>

            {footerConfig && (
                <StorefrontFooter
                    config={footerConfig}
                    brandColor={brandColor}
                    storeName={store.name}
                />
            )}

            <CartDrawer
                isOpen={isCartOpen}
                onClose={() => setIsCartOpen(false)}
                brandColor={brandColor}
            />
        </div>
    );
};

export default Storefront;
