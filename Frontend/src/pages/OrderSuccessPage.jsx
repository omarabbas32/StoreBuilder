import { useEffect, useState, cloneElement } from 'react';
import { Link, useParams, useSearchParams } from 'react-router-dom';
import { CheckCircle, Package, ArrowRight, Home, Copy, Check, Clock, Truck, XCircle } from 'lucide-react';
import storeService from '../services/storeService';
import orderService from '../services/orderService';
import StorefrontNavbar from '../components/storefront/StorefrontNavbar';
import useCartStore from '../store/cartStore';
import { useStorePath } from '../hooks/useStorePath';
import './OrderSuccessPage.css';

const OrderSuccessPage = ({ slug: slugProp }) => {
    const { slug: slugParam } = useParams();
    const [searchParams] = useSearchParams();
    const slug = slugProp || slugParam;
    const [store, setStore] = useState(null);
    const [order, setOrder] = useState(null);
    const [loading, setLoading] = useState(true);
    const [copied, setCopied] = useState(false);
    const initializeSession = useCartStore(state => state.initializeSession);
    const storePath = useStorePath();

    const orderId = searchParams.get('orderId');

    useEffect(() => {
        initializeSession();
    }, []);

    useEffect(() => {
        loadData();
    }, [slug, orderId]);

    const loadData = async () => {
        setLoading(true);
        const promises = [
            storeService.getStoreBySlugOrId(slug),
            storeService.getComponents()
        ];

        if (orderId) {
            promises.push(orderService.getOrder(orderId));
        }

        const results = await Promise.all(promises);
        const storeResult = results[0];
        const componentsResult = results[1];
        const orderResult = orderId ? results[2] : null;

        if (storeResult.success) {
            setStore(storeResult.data);
        }
        if (orderResult?.success) {
            setOrder(orderResult.data);
        }
        setLoading(false);
    };

    const handleCopy = () => {
        navigator.clipboard.writeText(orderId);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const getStatusInfo = (status) => {
        switch (status) {
            case 'pending': return { label: 'Placed', icon: <Clock />, color: '#f59e0b', desc: 'Order received and waiting for processing.' };
            case 'processing': return { label: 'Processing', icon: <Package />, color: '#0ea5e9', desc: 'We are preparing your items.' };
            case 'shipped': return { label: 'Shipped', icon: <Truck />, color: '#6366f1', desc: 'Your order is on the way!' };
            case 'delivered': return { label: 'Delivered', icon: <CheckCircle />, color: '#10b981', desc: 'Order has been delivered.' };
            case 'cancelled': return { label: 'Cancelled', icon: <XCircle />, color: '#ef4444', desc: 'This order was cancelled.' };
            default: return { label: 'Confirmed', icon: <CheckCircle />, color: '#10b981', desc: 'Thank you for your order.' };
        }
    };

    if (loading) return <div className="order-success-loading">Loading order details...</div>;

    const currentStatus = getStatusInfo(order?.status || 'pending');
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
                    <div className="success-icon-wrapper" style={{ backgroundColor: `${currentStatus.color}20` }}>
                        <div style={{ color: currentStatus.color }}>
                            {cloneElement(currentStatus.icon, { size: 64 })}
                        </div>
                    </div>

                    <h1>Order {currentStatus.label} Successfully!</h1>
                    <p className="success-message">{currentStatus.desc}</p>

                    {orderId && (
                        <div className="order-summary-box">
                            <div className="order-id-track">
                                <Package size={20} />
                                <span>Order tracking: <strong>#{orderId.substring(0, 8).toUpperCase()}</strong></span>
                                <button className="copy-btn-inline" onClick={handleCopy}>
                                    {copied ? <Check size={16} className="text-success" /> : <Copy size={16} />}
                                </button>
                            </div>

                            {order && (
                                <div className="order-status-timeline">
                                    <div className={`status-pill status-${order.status}`}>
                                        {order.status}
                                    </div>
                                    <span className="order-total-summary">Total: ${parseFloat(order.totalAmount).toFixed(2)}</span>
                                </div>
                            )}
                        </div>
                    )}

                    <div className="success-details">
                        <div className="detail-item">
                            <span className="detail-icon">📧</span>
                            <div>
                                <strong>Status: {currentStatus.label}</strong>
                                <p>Updated on {new Date(order?.updatedAt || order?.createdAt || Date.now()).toLocaleString()}</p>
                            </div>
                        </div>
                        <div className="detail-item">
                            <span className="detail-icon">🚚</span>
                            <div>
                                <strong>Delivery Address</strong>
                                <p>{order?.shippingAddress || 'Standard Shipping'}</p>
                            </div>
                        </div>
                        <div className="detail-item">
                            <span className="detail-icon">💳</span>
                            <div>
                                <strong>Payment Method</strong>
                                <p>Cash on Delivery</p>
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
                        <Link to={`${storePath}/orders`} className="secondary-btn">
                            My Order History
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
