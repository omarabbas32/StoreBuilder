import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Package, ShoppingCart } from 'lucide-react';
import productService from '../services/productService';
import storeService from '../services/storeService';
import StorefrontNavbar from '../components/storefront/StorefrontNavbar';
import StorefrontFooter from '../components/storefront/StorefrontFooter';
import CartDrawer from '../components/storefront/CartDrawer';
import Card from '../components/ui/Card';
import useCartStore from '../store/cartStore';
import { useStorePath } from '../hooks/useStorePath';
import './ProductsPage.css';

const ProductsPage = ({ slug: slugProp }) => {
    const { slug: slugParam } = useParams();
    const slug = slugProp || slugParam;
    const [store, setStore] = useState(null);
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [isCartOpen, setIsCartOpen] = useState(false);
    const storePath = useStorePath();

    const addItem = useCartStore(state => state.addItem);
    const initializeSession = useCartStore(state => state.initializeSession);

    useEffect(() => {
        initializeSession();
    }, []);

    useEffect(() => {
        loadData();
    }, [slug]);

    const loadData = async () => {
        setLoading(true);
        const storeResult = await storeService.getStoreBySlug(slug);
        if (!storeResult.success) {
            setError(storeResult.error);
            setLoading(false);
            return;
        }
        setStore(storeResult.data);

        const productsResult = await productService.getProducts(storeResult.data.id);
        if (productsResult.success) {
            setProducts(productsResult.data || []);
        }
        setLoading(false);
    };

    const handleAddToCart = (product) => {
        addItem(product);
        setIsCartOpen(true);
    };

    if (loading) return <div className="products-page-loading">Loading products...</div>;
    if (error) return <div className="products-page-error"><h1>Error</h1><p>{error}</p></div>;

    const brandColor = store?.settings?.colorPalette?.[0] || store?.settings?.primaryColor || '#2563eb';

    return (
        <div className="products-page" style={{ '--brand-color': brandColor }}>
            <StorefrontNavbar
                brandColor={brandColor}
                storeName={store.name}
                onCartClick={() => setIsCartOpen(true)}
            />

            <main className="products-main">
                <div className="products-mini-hero">
                    <div className="hero-background">
                        <div className="glass-blob blob-1"></div>
                        <div className="glass-blob blob-2"></div>
                    </div>
                    <div className="container">
                        <div className="page-header">
                            <h1>Our Products</h1>
                            <p>Discover our curated collection of premium items</p>
                        </div>
                    </div>
                </div>

                <div className="container">
                    {products.length === 0 ? (
                        <div className="no-products-glass">
                            <div className="empty-visual">
                                <Package size={64} className="empty-icon-animated" />
                                <div className="visual-glow"></div>
                            </div>
                            <h3>No products found</h3>
                            <p>We're currently restocking our shelves. Check back soon!</p>
                            <Link to={`${storePath}/`} className="back-home-btn">
                                Return to Store
                            </Link>
                        </div>
                    ) : (
                        <div className="products-grid">
                            {products.map(product => (
                                <Card key={product.id} className="product-card">
                                    <Link to={`${storePath}/product/${product.id}`} className="product-link">
                                        <div className="product-image">
                                            {product.images?.[0] ? (
                                                <img src={product.images[0]} alt={product.name} />
                                            ) : (
                                                <div className="product-placeholder">
                                                    <Package size={48} />
                                                </div>
                                            )}
                                        </div>
                                        <div className="product-info">
                                            <h3>{product.name}</h3>
                                            <p className="product-price">${product.price}</p>
                                        </div>
                                    </Link>
                                    <button
                                        className="add-to-cart-btn"
                                        style={{ backgroundColor: brandColor }}
                                        onClick={() => handleAddToCart(product)}
                                        disabled={product.stock <= 0}
                                    >
                                        <ShoppingCart size={18} />
                                        {product.stock <= 0 ? 'Out of Stock' : 'Add to Cart'}
                                    </button>
                                </Card>
                            ))}
                        </div>
                    )}
                </div>
            </main>

            <footer className="store-footer">
                <div className="container">
                    <p>&copy; {new Date().getFullYear()} {store.name}. Powered by Storely.</p>
                </div>
            </footer>

            <CartDrawer
                isOpen={isCartOpen}
                onClose={() => setIsCartOpen(false)}
                brandColor={brandColor}
            />
        </div>
    );
};

export default ProductsPage;
