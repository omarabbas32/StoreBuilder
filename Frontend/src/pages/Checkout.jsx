import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ShoppingBag, CreditCard, ChevronLeft, CheckCircle } from 'lucide-react';
import useCartStore from '../store/cartStore';
import useAuthStore from '../store/authStore';
import orderService from '../services/orderService';
import Button from '../components/ui/Button';
import Card from '../components/ui/Card';
import Input from '../components/ui/Input';
import storeService from '../services/storeService';
import { useStorePath } from '../hooks/useStorePath';
import './Checkout.css';

const Checkout = () => {
    const navigate = useNavigate();
    const { slug } = useParams();
    const { items, getTotal, clearCart } = useCartStore();
    const storePath = useStorePath();
    const [loading, setLoading] = useState(false);
    const [orderComplete, setOrderComplete] = useState(false);
    const [orderResult, setOrderResult] = useState(null);
    const [store, setStore] = useState(null);

    const [formData, setFormData] = useState({
        customer_name: '',
        customer_email: '',
        customer_phone: '',
        shipping_address: '',
        notes: ''
    });

    useEffect(() => {
        if (items.length === 0 && !orderComplete) {
            navigate(storePath || '/'); // Back to store
        }
    }, [items, orderComplete]);

    useEffect(() => {
        if (slug && !['checkout', 'demo', 'cart'].includes(slug)) {
            loadStore();
        }
    }, [slug]);

    const loadStore = async () => {
        const result = await storeService.getStoreBySlugOrId(slug);
        if (result.success) {
            setStore(result.data);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (items.length === 0) {
            alert('Your cart is empty');
            return;
        }

        setLoading(true);

        // Resolve store_id with exhaustive multi-layered fallback
        // PRIORITIZE items if we are on global /checkout
        const firstItem = items[0] || {};
        const storeFromItem = firstItem.storeId ||
            firstItem.store_id ||
            firstItem.storeID ||
            firstItem.store_ID ||
            (firstItem.store ? (firstItem.store.id || firstItem.store._id) : null);

        const storeFromState = store?.id || store?._id;
        const store_id = storeFromItem || storeFromState;

        console.log('[CHECKOUT_DEBUG_DEEP]', {
            slug,
            storeFromState,
            storeFromItem,
            resolvedId: store_id,
            firstItemKeys: Object.keys(firstItem),
            firstItemSample: firstItem
        });

        const orderData = {
            store_id: store_id,
            total_amount: getTotal(),
            ...formData
        };

        console.log('[CHECKOUT_SUBMIT]', { orderData, itemsCount: items.length });

        if (!store_id) {
            alert('Error: Store ID could not be identified. Please try returning to the store and adding items again.');
            setLoading(false);
            return;
        }

        const result = await orderService.createOrder(orderData, items);
        console.log('[CHECKOUT_RESULT]', result);

        if (result.success) {
            clearCart();
            // Ensure we use a clean path for redirection
            const successPath = storePath ? `${storePath}/order-success` : '/order-success';
            navigate(`${successPath}?orderId=${result.data.id}`);
        } else {
            alert('Error: ' + result.error);
        }
        setLoading(false);
    };

    if (orderComplete) {
        return (
            <div className="checkout-page success-view">
                <Card className="success-card">
                    <CheckCircle size={64} className="success-icon" />
                    <h1>Order Placed Successfully!</h1>
                    <p className="text-muted">Thank you for your purchase. Your order ID is: {orderResult?.id}</p>
                    <div className="success-actions">
                        <Button onClick={() => navigate(storePath)}>Continue Shopping</Button>
                    </div>
                </Card>
            </div>
        );
    }

    return (
        <div className="checkout-page">
            <div className="container">
                <button className="back-btn" onClick={() => navigate(-1)}>
                    <ChevronLeft size={20} />
                    Back
                </button>

                <div className="checkout-grid">
                    <div className="checkout-form-section">
                        <h2>Checkout Details</h2>
                        <Card>
                            <form onSubmit={handleSubmit}>
                                <div className="form-grid">
                                    <Input
                                        label="Full Name"
                                        value={formData.customer_name}
                                        onChange={(e) => setFormData({ ...formData, customer_name: e.target.value })}
                                        required
                                        fullWidth
                                    />
                                    <Input
                                        label="Email Address"
                                        type="email"
                                        value={formData.customer_email}
                                        onChange={(e) => setFormData({ ...formData, customer_email: e.target.value })}
                                        required
                                        fullWidth
                                    />
                                    <Input
                                        label="Phone Number"
                                        value={formData.customer_phone}
                                        onChange={(e) => setFormData({ ...formData, customer_phone: e.target.value })}
                                        required
                                        fullWidth
                                    />
                                    <div className="field-group full-width">
                                        <label className="field-label">Shipping Address</label>
                                        <textarea
                                            value={formData.shipping_address}
                                            onChange={(e) => setFormData({ ...formData, shipping_address: e.target.value })}
                                            className="field-textarea"
                                            required
                                        />
                                    </div>
                                    <div className="field-group full-width">
                                        <label className="field-label">Order Notes (Optional)</label>
                                        <textarea
                                            value={formData.notes}
                                            onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                                            className="field-textarea"
                                        />
                                    </div>
                                </div>

                                <div className="payment-method-section">
                                    <h3>Payment Method</h3>
                                    <div className="payment-option selected">
                                        <CreditCard size={24} />
                                        <div>
                                            <p className="option-title">Cash on Delivery</p>
                                            <p className="option-desc">Pay when your order arrives</p>
                                        </div>
                                    </div>
                                </div>

                                <Button type="submit" size="lg" fullWidth loading={loading}>
                                    Place Order (${getTotal().toFixed(2)})
                                </Button>
                            </form>
                        </Card>
                    </div>

                    <div className="checkout-summary-section">
                        <h2>Order Summary</h2>
                        <Card className="summary-card">
                            <div className="summary-items">
                                {items.map((item) => (
                                    <div key={item.id} className="summary-item">
                                        <div className="item-info">
                                            <p className="item-name">{item.name} x {item.quantity}</p>
                                        </div>
                                        <p className="item-total">${(item.price * item.quantity).toFixed(2)}</p>
                                    </div>
                                ))}
                            </div>
                            <div className="summary-totals">
                                <div className="summary-row">
                                    <span>Subtotal</span>
                                    <span>${getTotal().toFixed(2)}</span>
                                </div>
                                <div className="summary-row">
                                    <span>Shipping</span>
                                    <span>Free</span>
                                </div>
                                <div className="summary-row total">
                                    <span>Total</span>
                                    <span>${getTotal().toFixed(2)}</span>
                                </div>
                            </div>
                        </Card>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Checkout;
