import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Clock } from 'lucide-react';
import { useStorePath } from '../../hooks/useStorePath';
import { formatImageUrl } from '../../utils/imageUtils';
import './RecentlyViewed.css';

const RecentlyViewed = ({ currentProductId }) => {
    const [recentProducts, setRecentProducts] = useState([]);
    const storePath = useStorePath();

    useEffect(() => {
        const stored = localStorage.getItem('recentlyViewed');
        if (stored) {
            try {
                const parsed = JSON.parse(stored);
                // Filter out current product and return last 4
                const filtered = parsed
                    .filter(p => p.id !== currentProductId)
                    .slice(0, 4);
                setRecentProducts(filtered);
            } catch (e) {
                console.error('Error parsing recently viewed products', e);
            }
        }
    }, [currentProductId]);

    if (recentProducts.length === 0) return null;

    return (
        <div className="recently-viewed">
            <div className="section-header">
                <Clock size={20} />
                <h3>Recently Viewed</h3>
            </div>
            <div className="recent-grid">
                {recentProducts.map(product => (
                    <Link
                        key={product.id}
                        to={`${storePath}/product/${product.id}`}
                        className="recent-item"
                    >
                        <div className="recent-thumb">
                            {product.image ? (
                                <img src={formatImageUrl(product.image)} alt={product.name} />
                            ) : (
                                <div className="thumb-placeholder">🛍️</div>
                            )}
                        </div>
                        <div className="recent-info">
                            <p className="recent-name">{product.name}</p>
                            <p className="recent-price">${product.price}</p>
                        </div>
                    </Link>
                ))}
            </div>
        </div>
    );
};

export default RecentlyViewed;
