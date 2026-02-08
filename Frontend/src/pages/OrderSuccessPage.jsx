import { useEffect, useState } from 'react';
import { Link, useParams, useSearchParams } from 'react-router-dom';
import { CheckCircle, Package, ArrowRight, Home, Copy, Check } from 'lucide-react';
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
    const [copied, setCopied] = useState(false);
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

    const handleCopy = () => {
        navigator.clipboard.writeText(orderId);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    if (loading) return <div className="order-success-loading">Loading...</div>;

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
                        <Link to={storePath} className="navbar-brand">{store?.name || 'Store'}</Link>
                        <div className="navbar-links">
                            <Link to={storePath}>Home</Link>
                            <Link to={`${storePath}/categories`}>Categories</Link>
                            <Link to={`${storePath}/cart`}>Cart</Link>
                        </div>
                    </div>
                </nav>
            )}

            <main className="order-success-main container">
                <div className="success-card">
                    <div className="success-icon-wrapper" style={{ backgroundColor: `${brandColor} 15` }}>
                        <CheckCircle size={64} style={{ color: brandColor }} />
                    </div>

                    <h1>Order Confirmed Successfully!</h1>
                    <p className="success-message">Thank you for your order. We will contact you shortly to confirm the details.</p>

                    {orderId && (
                        <div className="order-id-box">
                            <Package size={20} />
                            <span>Order ID: <strong>#{orderId}</strong></span>
                            <button
                                className="copy-btn-inline"
                                onClick={handleCopy}
                                title="Copy ID"
                            >
                                {copied ? <Check size={16} className="text-success" /> : <Copy size={16} />}
                            </button>
                        </div>
                    )}

                    <div className="success-details">
                        <div className="detail-item">
                            <span className="detail-icon">📧</span>
                            <div>
                                <strong>Email Confirmation</strong>
                                <p>Order details will be sent to your email</p>
                            </div>
                        </div>
                        <div className="detail-item">
                            <span className="detail-icon">🚚</span>
                            <div>
                                <strong>Delivery</strong>
                                <p>We will contact you to schedule delivery</p>
                            </div>
                        </div>
                        <div className="detail-item">
                            <span className="detail-icon">💳</span>
                            <div>
                                <strong>Cash on Delivery</strong>
                                <p>Pay cash upon delivery</p>
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
                            Back to Home
                        </Link>
                        <Link to={`${storePath}/categories`} className="secondary-btn">
                            Continue Shopping
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
