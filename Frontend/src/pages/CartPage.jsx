import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { ShoppingCart, Trash2, Plus, Minus, ArrowRight, ShoppingBag } from 'lucide-react';
import storeService from '../services/storeService';
import StorefrontNavbar from '../components/storefront/StorefrontNavbar';
import useCartStore from '../store/cartStore';
import Button from '../components/ui/Button';
import { useStorePath } from '../hooks/useStorePath';
import { formatImageUrl } from '../utils/imageUtils';
import './CartPage.css';

const CartPage = ({ slug: slugProp }) => {
    const navigate = useNavigate();
    const { slug: slugParam } = useParams();
    const slug = slugProp || slugParam;
    const [store, setStore] = useState(null);
    const [availableComponents, setAvailableComponents] = useState([]);
    const [loading, setLoading] = useState(true);
    const storePath = useStorePath();

    const { items, updateQuantity, removeItem, getTotal, clearCart, initializeSession } = useCartStore();

    useEffect(() => {
        initializeSession();
    }, []);

    useEffect(() => {
        loadStore();
    }, [slug]);

    const loadStore = async () => {
        setLoading(true);
        const [storeResult, componentsResult] = await Promise.all([
            storeService.getStoreBySlugOrId(slug),
            storeService.getComponents()
        ]);

        if (storeResult.success) {
            setStore(storeResult.data);
        }
        if (componentsResult.success) {
            setAvailableComponents(componentsResult.data || []);
        }
        setLoading(false);
    };

    const handleCheckout = () => {
        navigate(`${storePath}/checkout`);
    };

    if (loading) return <div className="cart-page-loading">جاري التحميل...</div>;

    const brandColor = store?.settings?.primaryColor || '#2563eb';
    const components = store?.settings?.components || [];
    const navbarComponent = components.find(c => c.type === 'navbar' || c.type === 'navigation');
    const navbarConfig = navbarComponent
        ? store?.settings?.componentContent?.[navbarComponent.id]
        : null;

    return (
        <div className="cart-page" style={{ '--brand-color': brandColor }}>
            {navbarConfig ? (
                <StorefrontNavbar
                    config={navbarConfig}
                    brandColor={brandColor}
                    storeName={store?.name || 'Store'}
                    onCartClick={() => { }}
                />
            ) : (
                <nav className="simple-navbar">
                    <div className="container">
                        <Link to={storePath} className="navbar-brand">{store?.name || 'Store'}</Link>
                        <div className="navbar-links">
                            <Link to={storePath}>الرئيسية</Link>
                            <Link to={`${storePath}/categories`}>التصنيفات</Link>
                            <Link to={`${storePath}/cart`} className="active">السلة</Link>
                        </div>
                    </div>
                </nav>
            )}

            <main className="cart-main container">
                <div className="cart-header">
                    <ShoppingCart size={32} style={{ color: brandColor }} />
                    <h1>سلة التسوق</h1>
                </div>

                {items.length === 0 ? (
                    <div className="empty-cart">
                        <ShoppingBag size={80} className="empty-icon" />
                        <h2>سلتك فارغة</h2>
                        <p>لم تضف أي منتجات بعد</p>
                        <Link to={`${storePath}/categories`} className="continue-shopping" style={{ backgroundColor: brandColor }}>
                            تصفح المنتجات
                        </Link>
                    </div>
                ) : (
                    <div className="cart-content">
                        <div className="cart-items">
                            {items.map(item => (
                                <div key={item.id} className="cart-item">
                                    <div className="item-image">
                                        {item.images && item.images.length > 0 ? (
                                            <img src={formatImageUrl(item.images[0])} alt={item.name} />
                                        ) : (
                                            <div className="image-placeholder">🛍️</div>
                                        )}
                                    </div>
                                    <div className="item-details">
                                        <h3>{item.name}</h3>
                                        <p className="item-price">${item.price}</p>
                                    </div>
                                    <div className="quantity-controls">
                                        <button
                                            className="qty-btn"
                                            onClick={() => updateQuantity(item.id, item.quantity - 1)}
                                        >
                                            <Minus size={16} />
                                        </button>
                                        <span className="quantity">{item.quantity}</span>
                                        <button
                                            className="qty-btn"
                                            onClick={() => updateQuantity(item.id, item.quantity + 1)}
                                        >
                                            <Plus size={16} />
                                        </button>
                                    </div>
                                    <div className="item-total">
                                        ${(item.price * item.quantity).toFixed(2)}
                                    </div>
                                    <button
                                        className="remove-btn"
                                        onClick={() => removeItem(item.id)}
                                    >
                                        <Trash2 size={18} />
                                    </button>
                                </div>
                            ))}

                            <button className="clear-cart-btn" onClick={clearCart}>
                                <Trash2 size={16} />
                                إفراغ السلة
                            </button>
                        </div>

                        <div className="cart-summary">
                            <h3>ملخص الطلب</h3>
                            <div className="summary-row">
                                <span>المجموع الفرعي</span>
                                <span>${getTotal().toFixed(2)}</span>
                            </div>
                            <div className="summary-row">
                                <span>الشحن</span>
                                <span className="free">مجاني</span>
                            </div>
                            <div className="summary-row total">
                                <span>الإجمالي</span>
                                <span>${getTotal().toFixed(2)}</span>
                            </div>
                            <Button
                                size="lg"
                                fullWidth
                                onClick={handleCheckout}
                                style={{ backgroundColor: brandColor }}
                            >
                                إتمام الطلب
                                <ArrowRight size={18} />
                            </Button>
                            <Link to={`${storePath}/categories`} className="continue-link">
                                متابعة التسوق
                            </Link>
                        </div>
                    </div>
                )}
            </main>

            <footer className="store-footer">
                <div className="container">
                    <p>&copy; {new Date().getFullYear()} {store?.name}. Powered by Storely.</p>
                </div>
            </footer>
        </div>
    );
};

export default CartPage;
