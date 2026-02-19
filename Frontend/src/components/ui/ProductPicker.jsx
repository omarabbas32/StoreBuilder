import React, { useState, useMemo } from 'react';
import { X, Search, Check, ShoppingBag } from 'lucide-react';
import Button from './Button';
import { formatImageUrl } from '../../utils/imageUtils';
import './ProductPicker.css';

const ProductPicker = ({ onClose, products = [], selectedIds = [], onToggle }) => {
    const [searchQuery, setSearchQuery] = useState('');

    const filteredProducts = useMemo(() => {
        if (!searchQuery.trim()) return products;
        const query = searchQuery.toLowerCase();
        return products.filter(p =>
            p.name.toLowerCase().includes(query) ||
            (p.description && p.description.toLowerCase().includes(query))
        );
    }, [products, searchQuery]);

    return (
        <div className="product-picker-overlay" onClick={onClose}>
            <div className="product-picker-modal" onClick={e => e.stopPropagation()}>
                <div className="picker-header">
                    <div className="picker-title">
                        <ShoppingBag size={20} />
                        <h3>Select Products</h3>
                        <span className="count-badge">{selectedIds.length} selected</span>
                    </div>
                    <button className="close-btn" onClick={onClose}>
                        <X size={20} />
                    </button>
                </div>

                <div className="picker-search">
                    <Search size={18} className="search-icon" />
                    <input
                        type="text"
                        placeholder="Search products..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        autoFocus
                    />
                </div>

                <div className="picker-content">
                    {filteredProducts.length === 0 ? (
                        <div className="empty-state">
                            <p>No products found</p>
                        </div>
                    ) : (
                        <div className="products-list">
                            {filteredProducts.map(product => {
                                const isSelected = selectedIds.includes(String(product.id || product._id));
                                return (
                                    <div
                                        key={product.id || product._id}
                                        className={`product-item ${isSelected ? 'selected' : ''}`}
                                        onClick={() => onToggle(product.id || product._id)}
                                    >
                                        <div className="checkbox">
                                            {isSelected && <Check size={14} strokeWidth={3} />}
                                        </div>
                                        <div className="product-thumb">
                                            {product.images && product.images[0] ? (
                                                <img src={formatImageUrl(product.images[0])} alt={product.name} />
                                            ) : (
                                                <div className="thumb-placeholder">🛍️</div>
                                            )}
                                        </div>
                                        <div className="product-info">
                                            <span className="product-name">{product.name}</span>
                                            <span className="product-price">${parseFloat(product.price).toFixed(2)}</span>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>

                <div className="picker-footer">
                    <Button variant="primary" fullWidth onClick={onClose}>
                        Done
                    </Button>
                </div>
            </div>
        </div>
    );
};

export default ProductPicker;
