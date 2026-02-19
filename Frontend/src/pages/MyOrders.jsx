import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ShoppingBag, ArrowRight, Package, Truck, CheckCircle, Clock, XCircle, ChevronRight, Star } from 'lucide-react';
import api from '../services/api';
import useAuthStore from '../store/authStore';
import { useStorePath } from '../hooks/useStorePath';
import ReviewForm from '../components/review/ReviewForm';
import './MyOrders.css';

const MyOrders = () => {
    const [orders, setOrders] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const [reviewModal, setReviewModal] = useState({ show: false, product: null });
    const user = useAuthStore(state => state.user);
    const storePath = useStorePath();

    const handleOpenReview = (product) => {
        setReviewModal({ show: true, product });
    };

    const handleCloseReview = () => {
        setReviewModal({ show: false, product: null });
    };

    const handleReviewSubmitted = () => {
        // We could refresh orders, but since it's a modal over a list,
        // the item list itself doesn't strictly need updating immediately 
        // unless we add a "Reviewed" status tag.
    };

    useEffect(() => {
        const fetchOrders = async () => {
            try {
                setIsLoading(true);
                const response = await api.get('/orders/my-orders');
                if (response.success) {
                    setOrders(Array.isArray(response.data) ? response.data : []);
                } else {
                    setError(response.error || 'Failed to load orders');
                }
            } catch (err) {
                console.error('Error fetching orders:', err);
                setError('Failed to load orders. Please try again later.');
            } finally {
                setIsLoading(false);
            }
        };

        if (user) {
            fetchOrders();
        }
    }, [user]);

    const getStatusIcon = (status) => {
        switch (status) {
            case 'pending': return <Clock size={16} />;
            case 'processing': return <Package size={16} />;
            case 'shipped': return <Truck size={16} />;
            case 'delivered':
            case 'completed': return <CheckCircle size={16} />;
            case 'cancelled': return <XCircle size={16} />;
            default: return <Clock size={16} />;
        }
    };

    const StatusTracker = ({ status }) => {
        const steps = [
            { id: 'pending', label: 'Placed', icon: <Clock size={14} /> },
            { id: 'processing', label: 'Processing', icon: <Package size={14} /> },
            { id: 'shipped', label: 'Shipped', icon: <Truck size={14} /> },
            { id: 'delivered', label: 'Delivered', icon: <CheckCircle size={14} /> }
        ];

        const getStatusIndex = (s) => {
            if (s === 'cancelled') return -1;
            return steps.findIndex(step => step.id === s);
        };

        const currentIndex = getStatusIndex(status);

        if (status === 'cancelled') {
            return (
                <div className="status-tracker cancelled">
                    <div className="tracker-step active">
                        <div className="step-dot" style={{ background: '#fee2e2', borderColor: '#ef4444' }}>
                            <XCircle size={18} color="#ef4444" />
                        </div>
                        <span className="step-label" style={{ color: '#ef4444' }}>Cancelled</span>
                    </div>
                </div>
            );
        }

        return (
            <div className="status-tracker">
                {steps.map((step, index) => {
                    const isActive = index === currentIndex;
                    const isCompleted = index < currentIndex;

                    return (
                        <div key={step.id} className={`tracker-step ${isActive ? 'active' : ''} ${isCompleted ? 'completed' : ''}`}>
                            <div className="step-dot">
                                {isCompleted ? <CheckCircle size={14} /> : step.icon}
                            </div>
                            <span className="step-label">{step.label}</span>
                        </div>
                    );
                })}
            </div>
        );
    };

    if (isLoading) {
        return (
            <div className="my-orders-container">
                <div className="orders-loading">
                    <div className="loader-spinner"></div>
                    <p>Fetching your order history...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="my-orders-container">
                <div className="orders-error">
                    <XCircle size={48} color="#ef4444" />
                    <h2>Oops!</h2>
                    <p>{error}</p>
                    <button onClick={() => window.location.reload()} className="shop-button">Retry</button>
                </div>
            </div>
        );
    }

    return (
        <div className="my-orders-container">
            <header className="page-header">
                <h1>My Orders</h1>
                <p className="text-muted">Track and manage your recent purchases</p>
            </header>

            {orders.length === 0 ? (
                <div className="no-orders text-center">
                    <div className="empty-icon">🛍️</div>
                    <h2>No orders yet</h2>
                    <p>It seems you haven't placed any orders from this account.</p>
                    <Link to={`${storePath}/`} className="shop-button">
                        <ShoppingBag size={20} />
                        Start Shopping
                    </Link>
                </div>
            ) : (
                <div className="orders-list">
                    {orders.map(order => (
                        <div key={order.id} className="order-card">
                            <div className="order-header">
                                <div className="order-info">
                                    <span className="order-number">Order #{order.id.substring(0, 8).toUpperCase()}</span>
                                    <span className="order-date">Placed on {new Date(order.createdAt).toLocaleDateString(undefined, { month: 'long', day: 'numeric', year: 'numeric' })}</span>
                                </div>
                                <div className={`order-status status-${order.status}`}>
                                    {getStatusIcon(order.status)}
                                    {order.status}
                                </div>
                            </div>

                            <StatusTracker status={order.status} />

                            <div className="order-items">
                                {order.items?.map(item => (
                                    <div key={item.id} className="order-item">
                                        <div className="item-main">
                                            <Link to={`${storePath}/product/${item.productId}`} className="item-link">
                                                <span className="item-name">{item.productName || 'Product'}</span>
                                            </Link>
                                            <span className="item-details">Qty: {item.quantity}</span>
                                        </div>
                                        <div className="item-actions">
                                            <span className="item-price">${(parseFloat(item.unitPrice) * item.quantity).toFixed(2)}</span>
                                            {(order.status === 'delivered' || order.status === 'completed' || order.status === 'paid') && (
                                                <button
                                                    className="btn-review-item"
                                                    onClick={() => handleOpenReview({
                                                        id: item.productId || item.product_id,
                                                        name: item.productName
                                                    })}
                                                >
                                                    <Star size={14} />
                                                    Review
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>

                            <div className="order-footer">
                                <div className="order-total-group">
                                    <span className="order-total-label">Total Amount</span>
                                    <span className="order-total-amount">${parseFloat(order.totalAmount).toFixed(2)}</span>
                                </div>
                                <Link to={`${storePath}/order-success?orderId=${order.id}`} className="view-details-btn">
                                    View Details
                                    <ChevronRight size={16} />
                                </Link>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {reviewModal.show && (
                <div className="modal-overlay" onClick={handleCloseReview}>
                    <div className="modal-content" onClick={e => e.stopPropagation()}>
                        <ReviewForm
                            productId={reviewModal.product.id}
                            productName={reviewModal.product.name}
                            onReviewSubmitted={handleReviewSubmitted}
                            onCancel={handleCloseReview}
                        />
                    </div>
                </div>
            )}
        </div>
    );
};

export default MyOrders;
