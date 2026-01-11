import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { Grid, ArrowRight, Package } from 'lucide-react';
import categoryService from '../services/categoryService';
import storeService from '../services/storeService';
import StorefrontNavbar from '../components/storefront/StorefrontNavbar';
import StorefrontFooter from '../components/storefront/StorefrontFooter';
import CartDrawer from '../components/storefront/CartDrawer';
import useCartStore from '../store/cartStore';
import { useStorePath } from '../hooks/useStorePath';
import './CategoriesPage.css';

const CategoriesPage = ({ slug: slugProp }) => {
    const { slug: slugParam } = useParams();
    const slug = slugProp || slugParam;
    const [store, setStore] = useState(null);
    const [categories, setCategories] = useState([]);
    const [availableComponents, setAvailableComponents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [isCartOpen, setIsCartOpen] = useState(false);
    const initializeSession = useCartStore(state => state.initializeSession);
    const storePath = useStorePath();

    useEffect(() => {
        initializeSession();
    }, []);

    useEffect(() => {
        loadData();
    }, [slug]);

    const loadData = async () => {
        setLoading(true);

        // Load store first
        const storeResult = await storeService.getStoreBySlug(slug);
        if (!storeResult.success) {
            setError(storeResult.error);
            setLoading(false);
            return;
        }
        setStore(storeResult.data);

        // Load categories and components
        const [categoriesResult, componentsResult] = await Promise.all([
            categoryService.getAll(storeResult.data.id),
            storeService.getComponents()
        ]);

        if (categoriesResult.success) {
            setCategories(categoriesResult.data || []);
        }
        if (componentsResult.success) {
            setAvailableComponents(componentsResult.data || []);
        }

        setLoading(false);
    };

    if (loading) return <div className="categories-loading">Loading categories...</div>;
    if (error) return <div className="categories-error"><h1>Error</h1><p>{error}</p></div>;

    const brandColor = store?.settings?.primaryColor || '#2563eb';
    const components = store?.settings?.components || [];
    const navbarComponent = components.find(c => c.type === 'navbar' || c.type === 'navigation');
    const footerComponent = components.find(c => c.type === 'footer');
    const navbarConfig = navbarComponent
        ? store?.settings?.componentContent?.[navbarComponent.id]
        : null;
    const footerConfig = footerComponent
        ? store?.settings?.componentContent?.[footerComponent.id]
        : null;

    return (
        <div className="categories-page" style={{ '--brand-color': brandColor }}>
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
                            <Link to={storePath}>الرئيسية</Link>
                            <Link to={`${storePath}/categories`} className="active">التصنيفات</Link>
                            <Link to={`${storePath}/cart`}>السلة</Link>
                        </div>
                    </div>
                </nav>
            )}

            <main className="categories-main container">
                <div className="page-header">
                    <Grid size={32} className="header-icon" style={{ color: brandColor }} />
                    <h1>التصنيفات</h1>
                    <p>تصفح منتجاتنا حسب التصنيف</p>
                </div>

                {categories.length === 0 ? (
                    <div className="no-categories">
                        <Package size={64} className="empty-icon" />
                        <p>لا توجد تصنيفات متاحة حالياً</p>
                    </div>
                ) : (
                    <div className="categories-grid">
                        {categories.map(category => (
                            <Link
                                key={category.id}
                                to={`${storePath}/category/${category.id}`}
                                className="category-card"
                            >
                                <div className="category-image">
                                    {category.image_url ? (
                                        <img src={category.image_url} alt={category.name} />
                                    ) : (
                                        <div className="category-placeholder">
                                            <Package size={48} />
                                        </div>
                                    )}
                                </div>
                                <div className="category-info">
                                    <h3>{category.name}</h3>
                                    {category.description && (
                                        <p className="category-description">{category.description}</p>
                                    )}
                                    <span className="view-products" style={{ color: brandColor }}>
                                        عرض المنتجات <ArrowRight size={16} />
                                    </span>
                                </div>
                            </Link>
                        ))}
                    </div>
                )}
            </main>

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

export default CategoriesPage;
