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
import { formatImageUrl } from '../utils/imageUtils';
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
    }, [initializeSession]);

    useEffect(() => {
        loadData();
    }, [slug]);

    const loadData = async () => {
        setLoading(true);

        const storeResult = await storeService.getStoreBySlugOrId(slug);
        if (!storeResult.success) {
            setError(storeResult.error);
            setLoading(false);
            return;
        }
        setStore(storeResult.data);

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

    const brandColor = store?.settings?.colorPalette?.[0] || store?.settings?.primaryColor || '#2563eb';
    const colorPalette = store?.settings?.colorPalette || [brandColor, brandColor, brandColor];
    const typography = store?.settings?.typography || {
        fontFamily: 'Inter',
        headingSize: 'medium',
        bodySize: 'medium',
        fontWeight: 'normal'
    };

    const components = (store?.settings?.components && store.settings.components.length > 0)
        ? store.settings.components
        : availableComponents;

    const navbarComponent = components.find(c => c.type === 'navbar' || c.type === 'navigation');
    const footerComponent = components.find(c => c.type === 'footer');

    const navbarConfig = navbarComponent
        ? store?.settings?.componentContent?.[navbarComponent.id]
        : null;
    const footerConfig = footerComponent
        ? (store?.settings?.componentContent?.[footerComponent.id] || {})
        : null;

    const fontSizeMap = {
        small: '0.875rem',
        medium: '1rem',
        large: '1.25rem',
        'extra-large': '1.5rem'
    };

    const headingSizeMap = {
        small: '1.5rem',
        medium: '2rem',
        large: '2.5rem',
        'extra-large': '3.5rem'
    };

    const cssVariables = {
        '--brand-color': brandColor,
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
        '--letter-spacing': typography.letterSpacing || '0px'
    };

    return (
        <div className="categories-page" style={cssVariables}>
            <StorefrontNavbar
                config={navbarConfig}
                brandColor={brandColor}
                storeName={store.name}
                logo={store.settings?.logo_url ? formatImageUrl(store.settings.logo_url) : null}
                onCartClick={() => setIsCartOpen(true)}
            />

            <main className="categories-main">
                <div className="categories-hero">
                    <div className="hero-background">
                        {store.settings?.globalHeaderAsset ? (
                            <img src={formatImageUrl(store.settings.globalHeaderAsset)} alt="" className="header-library-asset" />
                        ) : (
                            <>
                                <div className="glass-blob blob-1"></div>
                                <div className="glass-blob blob-2"></div>
                            </>
                        )}
                    </div>
                    <div className="container">
                        <nav className="breadcrumbs">
                            <Link to={`${storePath}/`}>Home</Link>
                            <ArrowRight size={12} />
                            <span>Categories</span>
                        </nav>
                        <div className="page-header">
                            <h1>Categories</h1>
                            <p>Explore our curated collections and find exactly what you're looking for.</p>
                        </div>
                    </div>
                </div>

                {categories.length === 0 ? (
                    <div className="no-categories">
                        <Package size={64} className="empty-icon" />
                        <p>No categories found yet. Please check back soon.</p>
                    </div>
                ) : (
                    <div className="categories-grid">
                        {categories.map(category => (
                            <Link
                                key={category._id || category.id}
                                to={`${storePath}/category/${category._id || category.id}`}
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
                                        View products <ArrowRight size={16} />
                                    </span>
                                </div>
                            </Link>
                        ))}
                    </div>
                )}
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
        </div>
    );
};

export default CategoriesPage;
