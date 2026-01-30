import { useEffect, useState } from 'react';
import { Link, useParams, useSearchParams } from 'react-router-dom';
import { CheckCircle, Package, ArrowRight, Home } from 'lucide-react';
import storeService from '../services/storeService';
import StorefrontNavbar from '../components/storefront/StorefrontNavbar';
import useCartStore from '../store/cartStore';
import { useStorePath } from '../hooks/useStorePath';
import './OrderSuccessPage.css';

const OrderSuccessPage = ({ slug: slugProp }) => {
    const { slug: slugParam } = useParams();
    const [searchParams] = useSearchParams();
    const slug = slugProp || slugParam;
    const [store, setStore] = useState(null);
    const [availableComponents, setAvailableComponents] = useState([]);
    const [loading, setLoading] = useState(true);
    const initializeSession = useCartStore(state => state.initializeSession);
    const storePath = useStorePath();

    const orderId = searchParams.get('orderId');

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

    if (loading) return <div className="order-success-loading">جاري التحميل...</div>;

    const brandColor = store?.settings?.primaryColor || '#2563eb';
    const components = store?.settings?.components || [];
    const navbarComponent = components.find(c => c.type === 'navbar' || c.type === 'navigation');
    const navbarConfig = navbarComponent
        ? store?.settings?.componentContent?.[navbarComponent.id]
        : null;

    return (
        <div className="order-success-page" style={{ '--brand-color': brandColor }}>
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
                        <Link to="/" className="navbar-brand">{store?.name || 'Store'}</Link>
                        <div className="navbar-links">
                            <Link to="/">الرئيسية</Link>
                            <Link to="/categories">التصنيفات</Link>
                            <Link to="/cart">السلة</Link>
                        </div>
                    </div>
                </nav>
            )}

            <main className="order-success-main container">
                <div className="success-card">
                    <div className="success-icon-wrapper" style={{ backgroundColor: `${brandColor} 15` }}>
                        <CheckCircle size={64} style={{ color: brandColor }} />
                    </div>

                    <h1>تم تأكيد طلبك بنجاح!</h1>
                    <p className="success-message">شكراً لك على طلبك. سنتواصل معك قريباً لتأكيد التفاصيل.</p>

                    {orderId && (
                        <div className="order-id-box">
                            <Package size={20} />
                            <span>رقم الطلب: <strong>#{orderId}</strong></span>
                        </div>
                    )}

                    <div className="success-details">
                        <div className="detail-item">
                            <span className="detail-icon">📧</span>
                            <div>
                                <strong>تأكيد بالبريد الإلكتروني</strong>
                                <p>سيتم إرسال تفاصيل الطلب إلى بريدك الإلكتروني</p>
                            </div>
                        </div>
                        <div className="detail-item">
                            <span className="detail-icon">🚚</span>
                            <div>
                                <strong>التوصيل</strong>
                                <p>سيتم التواصل معك لتحديد موعد التوصيل</p>
                            </div>
                        </div>
                        <div className="detail-item">
                            <span className="detail-icon">💳</span>
                            <div>
                                <strong>الدفع عند الاستلام</strong>
                                <p>ادفع نقداً عند استلام طلبك</p>
                            </div>
                        </div>
                    </div>

                    <div className="success-actions">
                        <Link
                            to={storePath}
                            className="primary-btn"
                            style={{ backgroundColor: brandColor }}
                        >
                            <Home size={18} />
                            العودة للرئيسية
                        </Link>
                        <Link to="/categories" className="secondary-btn">
                            متابعة التسوق
                            <ArrowRight size={18} />
                        </Link>
                    </div>
                </div>
            </main>

            <footer className="store-footer">
                <div className="container">
                    <p>&copy; {new Date().getFullYear()} {store?.name}. Powered by Storely.</p>
                </div>
            </footer>
        </div>
    );
};

export default OrderSuccessPage;
