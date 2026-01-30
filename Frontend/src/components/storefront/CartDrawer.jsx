import { X, Minus, Plus, ShoppingBag, Trash2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import useCartStore from '../../store/cartStore';
import Button from '../ui/Button';
import { formatImageUrl } from '../../utils/imageUtils';
import './CartDrawer.css';

const CartDrawer = ({ isOpen, onClose, brandColor }) => {
    const navigate = useNavigate();
    const { items, updateQuantity, removeItem, getTotal, getItemCount, clearCart } = useCartStore();

    if (!isOpen) return null;

    return (
        <div className="cart-drawer-overlay" onClick={onClose}>
            <div className="cart-drawer" onClick={e => e.stopPropagation()}>
                <div className="cart-header">
                    <div className="cart-title">
                        <ShoppingBag size={24} />
                        <h2>Your Cart ({getItemCount()})</h2>
                    </div>
                    <button className="close-btn" onClick={onClose}>
                        <X size={24} />
                    </button>
                </div>

                <div className="cart-items">
                    {items.length === 0 ? (
                        <div className="empty-cart">
                            <ShoppingBag size={64} className="empty-icon" />
                            <p>Your cart is empty</p>
                            <Button variant="primary" onClick={onClose} style={{ backgroundColor: brandColor }}>
                                Start Shopping
                            </Button>
                        </div>
                    ) : (
                        items.map((item) => (
                            <div key={item.id} className="cart-item">
                                <div className="item-image">
                                    {item.images && item.images[0] ? (
                                        <img src={formatImageUrl(item.images[0])} alt={item.name} />
                                    ) : (
                                        <div className="image-placeholder">🛍️</div>
                                    )}
                                </div>
                                <div className="item-details">
                                    <div className="item-header">
                                        <h3>{item.name}</h3>
                                        <button className="remove-btn" onClick={() => removeItem(item.id)}>
                                            <Trash2 size={16} />
                                        </button>
                                    </div>
                                    <p className="item-price">${parseFloat(item.price).toFixed(2)}</p>
                                    <div className="item-quantity">
                                        <button
                                            onClick={() => updateQuantity(item.id, item.quantity - 1)}
                                            disabled={item.quantity <= 1}
                                        >
                                            <Minus size={16} />
                                        </button>
                                        <span>{item.quantity}</span>
                                        <button
                                            onClick={() => updateQuantity(item.id, item.quantity + 1)}
                                        >
                                            <Plus size={16} />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))
                    )}
                </div>

                {items.length > 0 && (
                    <div className="cart-footer">
                        <div className="cart-summary">
                            <div className="summary-row total">
                                <span>Total</span>
                                <span>${getTotal().toFixed(2)}</span>
                            </div>
                        </div>
                        <div className="cart-actions">
                            <Button
                                variant="primary"
                                fullWidth
                                style={{ backgroundColor: brandColor }}
                                onClick={() => navigate('/checkout')}
                            >
                                Checkout
                            </Button>
                            <button className="clear-cart-btn" onClick={clearCart}>
                                Clear Cart
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default CartDrawer;
