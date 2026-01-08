import { useEffect, useState } from 'react';
import { ShoppingBag, Eye, CheckCircle, Clock } from 'lucide-react';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import orderService from '../services/orderService';
import useAuthStore from '../store/authStore';
import './OrderManagement.css';

const OrderManagement = () => {
    const { store } = useAuthStore();
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedOrder, setSelectedOrder] = useState(null);

    useEffect(() => {
        if (store?.id) {
            loadOrders();
        }
    }, [store]);

    const loadOrders = async () => {
        setLoading(true);
        const result = await orderService.getStoreOrders(store.id);
        if (result.success) {
            setOrders(result.data || []);
        }
        setLoading(false);
    };

    const getStatusIcon = (status) => {
        switch (status) {
            case 'pending': return <Clock size={16} className="status-pending" />;
            case 'completed': return <CheckCircle size={16} className="status-completed" />;
            default: return <Clock size={16} />;
        }
    };

    if (loading) return <div className="order-management">Loading orders...</div>;

    return (
        <div className="order-management">
            <div className="management-header">
                <h1>Order Management</h1>
                <p className="text-muted">View and manage orders for {store.name}</p>
            </div>

            <div className="orders-container">
                {orders.length === 0 ? (
                    <Card className="empty-orders">
                        <ShoppingBag size={48} />
                        <h3>No orders yet</h3>
                        <p className="text-muted">When customers buy from your store, their orders will appear here.</p>
                    </Card>
                ) : (
                    <div className="orders-grid">
                        <div className="orders-list">
                            <Card>
                                <table className="orders-table">
                                    <thead>
                                        <tr>
                                            <th>Order ID</th>
                                            <th>Customer</th>
                                            <th>Date</th>
                                            <th>Total</th>
                                            <th>Status</th>
                                            <th>Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {orders.map((order) => (
                                            <tr key={order.id} className={selectedOrder?.id === order.id ? 'selected' : ''}>
                                                <td>#{order.id.substring(0, 8)}</td>
                                                <td>{order.customer_name}</td>
                                                <td>{new Date(order.created_at).toLocaleDateString()}</td>
                                                <td>${parseFloat(order.total_amount).toFixed(2)}</td>
                                                <td>
                                                    <span className={`status-badge ${order.status}`}>
                                                        {getStatusIcon(order.status)}
                                                        {order.status}
                                                    </span>
                                                </td>
                                                <td>
                                                    <Button variant="secondary" size="sm" onClick={() => setSelectedOrder(order)}>
                                                        <Eye size={16} />
                                                        View
                                                    </Button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </Card>
                        </div>

                        {selectedOrder && (
                            <div className="order-details-panel">
                                <Card>
                                    <div className="details-header">
                                        <h3>Order Details</h3>
                                        <button className="close-details" onClick={() => setSelectedOrder(null)}>&times;</button>
                                    </div>

                                    <div className="details-section">
                                        <h4>Customer Information</h4>
                                        <p><strong>Name:</strong> {selectedOrder.customer_name}</p>
                                        <p><strong>Email:</strong> {selectedOrder.customer_email}</p>
                                        <p><strong>Phone:</strong> {selectedOrder.customer_phone}</p>
                                    </div>

                                    <div className="details-section">
                                        <h4>Shipping Address</h4>
                                        <p className="address-text">{selectedOrder.shipping_address}</p>
                                    </div>

                                    <div className="details-section">
                                        <h4>Order Items</h4>
                                        <div className="order-items-list">
                                            {selectedOrder.items?.map((item, idx) => (
                                                <div key={idx} className="order-item">
                                                    <span>Item #{item.product_id?.substring(0, 8)} x {item.quantity}</span>
                                                    <span>${(item.unit_price * item.quantity).toFixed(2)}</span>
                                                </div>
                                            ))}
                                        </div>
                                        <div className="order-total">
                                            <span>Total</span>
                                            <span>${parseFloat(selectedOrder.total_amount).toFixed(2)}</span>
                                        </div>
                                    </div>

                                    {selectedOrder.notes && (
                                        <div className="details-section">
                                            <h4>Notes</h4>
                                            <p className="note-text">{selectedOrder.notes}</p>
                                        </div>
                                    )}

                                    <div className="details-actions">
                                        <Button fullWidth>Mark as Completed</Button>
                                    </div>
                                </Card>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};

export default OrderManagement;
