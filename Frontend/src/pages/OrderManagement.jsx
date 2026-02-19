import { useEffect, useState } from 'react';
import { toast } from 'react-hot-toast';
import { ShoppingBag, Eye, CheckCircle, Clock, Copy, Check, Truck, Package, XCircle } from 'lucide-react';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import PageLoader from '../components/ui/PageLoader';
import orderService from '../services/orderService';
import useAuthStore from '../store/authStore';
import '../styles/empty-states.css';
import './OrderManagement.css';

const OrderManagement = () => {
    const { store } = useAuthStore();
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [pagination, setPagination] = useState({ currentPage: 1, totalPages: 1 });
    const [filters, setFilters] = useState({ status: 'all', startDate: '', endDate: '' });
    const [selectedOrder, setSelectedOrder] = useState(null);
    const [copiedId, setCopiedId] = useState(null);
    const [updatingStatus, setUpdatingStatus] = useState(false);

    const handleCopyId = (id) => {
        navigator.clipboard.writeText(id);
        setCopiedId(id);
        setTimeout(() => setCopiedId(null), 2000);
    };

    const handleStatusUpdate = async (orderId, newStatus) => {
        setUpdatingStatus(true);
        try {
            const result = await orderService.updateOrderStatus(orderId, newStatus);
            if (result.success) {
                toast.success(`Order status updated to ${newStatus}`);
                setOrders(prev => prev.map(o => o.id === orderId ? { ...o, status: newStatus } : o));
                if (selectedOrder?.id === orderId) {
                    setSelectedOrder(prev => ({ ...prev, status: newStatus }));
                }
            } else {
                toast.error(result.message || 'Failed to update status');
            }
        } catch (error) {
            console.error('Status update error:', error);
            toast.error('An error occurred while updating status');
        } finally {
            setUpdatingStatus(false);
        }
    };

    useEffect(() => {
        if (store?.id) {
            loadOrders(pagination.currentPage);
        }
    }, [store?.id, pagination.currentPage, filters]);

    const loadOrders = async (page = 1) => {
        setLoading(true);
        const result = await orderService.getStoreOrders(store.id, page, 20, filters);
        if (result.success) {
            setOrders(result.data || []);
            if (result.pagination) {
                setPagination({
                    currentPage: result.pagination.currentPage,
                    totalPages: result.pagination.pages
                });
            }
        }
        setLoading(false);
    };

    const getStatusIcon = (status) => {
        const iconSize = 16;
        switch (status) {
            case 'pending': return <Clock size={iconSize} />;
            case 'processing': return <Package size={iconSize} />;
            case 'shipped': return <Truck size={iconSize} />;
            case 'delivered':
            case 'completed': return <CheckCircle size={iconSize} />;
            case 'cancelled': return <XCircle size={iconSize} />;
            default: return <Clock size={iconSize} />;
        }
    };

    if (loading) return <div className="order-management"><PageLoader type="table" /></div>;

    return (
        <div className="order-management">
            <div className="management-header">
                <h1>Order Management</h1>
                <p className="text-muted">View and manage orders for {store.name}</p>
            </div>

            <Card className="filters-card">
                <div className="filters-grid">
                    <div className="filter-item">
                        <label>Order Status</label>
                        <select
                            value={filters.status}
                            onChange={(e) => setFilters(prev => ({ ...prev, status: e.target.value }))}
                            className="filter-select"
                        >
                            <option value="all">All Statuses</option>
                            <option value="pending">Pending</option>
                            <option value="processing">Processing</option>
                            <option value="shipped">Shipped</option>
                            <option value="delivered">Delivered</option>
                            <option value="cancelled">Cancelled</option>
                        </select>
                    </div>
                    <div className="filter-item">
                        <label>From Date</label>
                        <input
                            type="date"
                            value={filters.startDate}
                            onChange={(e) => setFilters(prev => ({ ...prev, startDate: e.target.value }))}
                            className="filter-input"
                        />
                    </div>
                    <div className="filter-item">
                        <label>To Date</label>
                        <input
                            type="date"
                            value={filters.endDate}
                            onChange={(e) => setFilters(prev => ({ ...prev, endDate: e.target.value }))}
                            className="filter-input"
                        />
                    </div>
                    <div className="filter-item actions">
                        <label>&nbsp;</label>
                        <Button
                            variant="secondary"
                            size="sm"
                            onClick={() => setFilters({ status: 'all', startDate: '', endDate: '' })}
                            className="clear-filters"
                        >
                            Reset Filters
                        </Button>
                    </div>
                </div>
            </Card>

            <div className="orders-container">
                {orders.length === 0 ? (
                    <Card className="empty-state-card">
                        <div className="empty-state-icon">🛒</div>
                        <h3>No Orders Yet</h3>
                        <p className="text-muted">
                            When customers purchase from your store, orders will appear here.
                            In the meantime, share your store link to start getting sales!
                        </p>
                        <Button
                            onClick={() => {
                                navigator.clipboard.writeText(window.location.origin + '/' + store.slug);
                                alert('Store link copied to clipboard!');
                            }}
                            size="lg"
                        >
                            📋 Copy Store Link
                        </Button>
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
                                                <td className="order-id-cell">
                                                    <span className="order-id">#{order.id.substring(0, 8)}</span>
                                                    <button
                                                        className="copy-id-btn"
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            handleCopyId(order.id);
                                                        }}
                                                        title="Copy Full ID"
                                                    >
                                                        {copiedId === order.id ? <Check size={14} className="text-success" /> : <Copy size={14} />}
                                                    </button>
                                                </td>
                                                <td>{order.customerName}</td>
                                                <td>{new Date(order.createdAt).toLocaleDateString()}</td>
                                                <td>${parseFloat(order.totalAmount).toFixed(2)}</td>
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
                                        <p><strong>Name:</strong> {selectedOrder.customerName}</p>
                                        <p><strong>Email:</strong> {selectedOrder.customerEmail}</p>
                                        <p><strong>Phone:</strong> {selectedOrder.customerPhone}</p>
                                    </div>

                                    <div className="details-section">
                                        <h4>Shipping Address</h4>
                                        <p className="address-text">{selectedOrder.shippingAddress}</p>
                                    </div>

                                    <div className="details-section">
                                        <h4>Order Items</h4>
                                        <div className="order-items-list">
                                            {selectedOrder.items?.map((item, idx) => (
                                                <div key={idx} className="order-item">
                                                    <span>Item #{item.productId?.substring(0, 8)} x {item.quantity}</span>
                                                    <span>${(item.unitPrice * item.quantity).toFixed(2)}</span>
                                                </div>
                                            ))}
                                        </div>
                                        <div className="order-total">
                                            <span>Total</span>
                                            <span>${parseFloat(selectedOrder.totalAmount).toFixed(2)}</span>
                                        </div>
                                    </div>

                                    {selectedOrder.notes && (
                                        <div className="details-section">
                                            <h4>Notes</h4>
                                            <p className="note-text">{selectedOrder.notes}</p>
                                        </div>
                                    )}

                                    <div className="details-actions">
                                        <h4>Update Order Status</h4>
                                        <div className="status-grid">
                                            {['pending', 'processing', 'shipped', 'delivered', 'cancelled'].map((status) => (
                                                <Button
                                                    key={status}
                                                    variant={selectedOrder.status === status ? 'primary' : 'secondary'}
                                                    size="sm"
                                                    onClick={() => handleStatusUpdate(selectedOrder.id, status)}
                                                    disabled={updatingStatus || selectedOrder.status === status}
                                                    className={`status-btn-${status}`}
                                                >
                                                    {status}
                                                </Button>
                                            ))}
                                        </div>
                                    </div>
                                </Card>
                            </div>
                        )}
                    </div>
                )}
            </div>

            {pagination.totalPages > 1 && (
                <div className="pagination-controls" style={{ marginTop: '20px', display: 'flex', justifyContent: 'center', gap: '10px' }}>
                    <Button
                        variant="secondary"
                        disabled={pagination.currentPage === 1}
                        onClick={() => setPagination(prev => ({ ...prev, currentPage: prev.currentPage - 1 }))}
                    >
                        Previous
                    </Button>
                    <span style={{ alignSelf: 'center' }}>Page {pagination.currentPage} of {pagination.totalPages}</span>
                    <Button
                        variant="secondary"
                        disabled={pagination.currentPage === pagination.totalPages}
                        onClick={() => setPagination(prev => ({ ...prev, currentPage: prev.currentPage + 1 }))}
                    >
                        Next
                    </Button>
                </div>
            )}
        </div>
    );
};

export default OrderManagement;
