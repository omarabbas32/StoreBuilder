import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { ArrowLeft, ShoppingCart, Package, Filter } from 'lucide-react';
import categoryService from '../services/categoryService';
import productService from '../services/productService';
import storeService from '../services/storeService';
import StorefrontNavbar from '../components/storefront/StorefrontNavbar';
import CartDrawer from '../components/storefront/CartDrawer';
import Card from '../components/ui/Card';
import useCartStore from '../store/cartStore';
import { useStorePath } from '../hooks/useStorePath';
import { formatImageUrl } from '../utils/imageUtils';
import './CategoryProductsPage.css';

const CategoryProductsPage = ({ slug: slugProp }) => {
    const { slug: slugParam, categoryId } = useParams();
    const slug = slugProp || slugParam;
    const [store, setStore] = useState(null);
    const [category, setCategory] = useState(null);
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
    }, []);

    useEffect(() => {
        loadData();
    }, [slug, categoryId]);

    const loadData = async () => {
        setLoading(true);

        // Load store first
        const storeResult = await storeService.getStoreBySlugOrId(slug);
        if (!storeResult.success) {
            setError(storeResult.error);
            setLoading(false);
            return;
        }
        setStore(storeResult.data);

        // Load category, products, and components in parallel
        const [categoryResult, productsResult, componentsResult] = await Promise.all([
            categoryService.getById(categoryId),
            productService.getProductsByCategory(storeResult.data.id, categoryId),
            storeService.getComponents()
        ]);

        if (categoryResult.success) {
            setCategory(categoryResult.data);
        } else {
            setError('Category not found');
            setLoading(false);
            return;
        }

        if (productsResult.success) {
            setProducts(productsResult.data || []);
        }

        if (componentsResult.success) {
            setAvailableComponents(componentsResult.data || []);
        }

        setLoading(false);
    };

    const handleAddToCart = (product) => {
        const storeId = store?.id || store?._id || product.storeId || product.store_id;
        addItem({ ...product, storeId });
        setIsCartOpen(true);
    };

    if (loading) return <div className="category-products-loading">Loading...</div>;
    if (error) return <div className="category-products-error"><h1>Error</h1><p>{error}</p></div>;

    const brandColor = store?.settings?.primaryColor || '#2563eb';
    const components = store?.settings?.components || [];
    const navbarComponent = components.find(c => c.type === 'navbar' || c.type === 'navigation');
    const navbarConfig = navbarComponent
        ? store?.settings?.componentContent?.[navbarComponent.id]
        : null;

    return (
        <div className="category-products-page" style={{ '--brand-color': brandColor }}>
            {navbarConfig ? (
                <StorefrontNavbar
                    config={navbarConfig}
                    brandColor={brandColor}
                    storeName={store.name}
                    onCartClick={() => setIsCartOpen(true)}
                />
            ) : (
                <nav className="simple-navbar">
                    <div className="container">
                        <Link to={storePath} className="navbar-brand">{store.name}</Link>
                        <div className="navbar-links">
                            <Link to={storePath}>Home</Link>
                            <Link to={`${storePath}/categories`}>Categories</Link>
                            <Link to={`${storePath}/cart`}>Cart</Link>
                        </div>
                    </div>
                </nav>
            )}

            <main className="category-products-main">
                {products.length === 0 ? (
                    <div className="no-products">
                        <Package size={64} className="empty-icon" />
                        <p>No products found in this category</p>
                        <Link to={`${storePath}/categories`} className="back-btn" style={{ backgroundColor: brandColor }}>
                            Browse other categories
                        </Link>
                    </div>
                ) : (
                    <div className="products-grid">
                        {products.map(product => (
                            <Card key={product.id} className="product-card">
                                <Link to={`${storePath}/product/${product.id}`} className="product-link">
                                    <div className="product-image">
                                        {product.images && product.images.length > 0 ? (
                                            <img src={formatImageUrl(product.images[0])} alt={product.name} />
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

export default CategoryProductsPage;
