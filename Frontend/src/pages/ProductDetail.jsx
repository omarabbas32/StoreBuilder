import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, ShoppingCart, ShieldCheck } from 'lucide-react';
import productService from '../services/productService';
import reviewService from '../services/reviewService';
import storeService from '../services/storeService';
import Button from '../components/ui/Button';
import Card from '../components/ui/Card';
import ErrorBoundary from '../components/ErrorBoundary';
import ReviewList from '../components/review/ReviewList';
// import ReviewForm from '../components/review/ReviewForm'; // Moving review submission to Orders page
import RecentlyViewed from '../components/storefront/RecentlyViewed';
import { useStorePath } from '../hooks/useStorePath';
import { formatImageUrl } from '../utils/imageUtils';
import useCartStore from '../store/cartStore';
import { ProductDetailSkeleton } from '../components/storefront/StorefrontSkeletons';
import './ProductDetail.css';

const ProductDetail = () => {
    const { productId } = useParams();
    const [product, setProduct] = useState(null);
    const [store, setStore] = useState(null);
    const [reviews, setReviews] = useState([]);
    const [loading, setLoading] = useState(true);
    const storePath = useStorePath();
    const [error, setError] = useState(null);
    const addItem = useCartStore(state => state.addItem);
    const [addToCartMessage, setAddToCartMessage] = useState('');

    useEffect(() => {
        loadProductData();
    }, [productId]);

    const loadProductData = async () => {
        setLoading(true);
        // Add cache breaker for reviews to avoid 304 on fresh submissions
        const [productResult, reviewsResult] = await Promise.all([
            productService.getProductById(productId),
            reviewService.getProductReviews(productId, { _t: Date.now() })
        ]);

        if (productResult.success) {
            setProduct(productResult.data);

            const storeId = productResult.data.storeId || productResult.data.store_id;
            if (storeId) {
                const storeResult = await storeService.getStoreById(storeId);
                if (storeResult.success) {
                    setStore(storeResult.data);
                }
            }
        } else {
            setError(productResult.error);
        }

        if (reviewsResult.success) {
            // Very robust extraction
            const reviewData = reviewsResult.data;
            let extractedReviews = [];

            if (Array.isArray(reviewData)) {
                extractedReviews = reviewData;
            } else if (reviewData && typeof reviewData === 'object') {
                if (Array.isArray(reviewData.data)) {
                    extractedReviews = reviewData.data;
                } else if (Array.isArray(reviewData.reviews)) {
                    extractedReviews = reviewData.reviews;
                }
            }

            setReviews(extractedReviews);
        }

        // Add to recently viewed
        if (productResult.success) {
            const p = productResult.data;
            const recentlyViewed = JSON.parse(localStorage.getItem('recentlyViewed') || '[]');
            const newItem = {
                id: p.id || p._id,
                name: p.name,
                price: p.price,
                image: p.images?.[0],
                timestamp: Date.now()
            };

            // Remove if already exists and add to front
            const filtered = recentlyViewed.filter(item => item.id !== newItem.id);
            const updated = [newItem, ...filtered].slice(0, 10); // Keep last 10
            localStorage.setItem('recentlyViewed', JSON.stringify(updated));
        }

        setLoading(false);
    };

    const handleAddToCart = () => {
        const storeId = product.storeId || product.store_id;
        addItem({ ...product, storeId }, 1);
        setAddToCartMessage('Added to cart!');
        setTimeout(() => setAddToCartMessage(''), 2000);
    };

    const handleReviewSubmitted = (newReview) => {
        // Reload all reviews to ensure data consistency
        loadProductData();
    };

    if (loading) return <ProductDetailSkeleton />;
    if (error) return <div className="product-detail-error"><h1>Error</h1><p>{error}</p></div>;

    const brandColor = store?.settings?.primaryColor || '#2563eb';

    return (
        <div className="product-detail-page">
            <div className="container">
                <Link to={`${storePath}/`} className="back-link">
                    <ArrowLeft size={16} />
                    Back to Store
                </Link>

                <div className="product-main">
                    <div className="product-gallery">
                        {product.images && product.images.length > 0 ? (
                            <div className="main-image">
                                <img src={formatImageUrl(product.images[0])} alt={product.name} />
                                {product.images.length > 1 && (
                                    <div className="image-thumbnails">
                                        {product.images.map((img, idx) => (
                                            <div key={idx} className="thumb">
                                                <img src={formatImageUrl(img)} alt="" />
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        ) : (
                            <div className="main-image-placeholder">
                                <span>🛍️</span>
                                <p>No image available</p>
                            </div>
                        )}
                    </div>

                    <div className="product-info-panel">
                        <h1 className="product-name">{product.name}</h1>
                        <div className="product-price">${product.price}</div>

                        <div className="product-description">
                            <h3>Description</h3>
                            <p>{product.description}</p>
                        </div>

                        <div className="product-meta">
                            <div className="meta-item">
                                <ShieldCheck size={18} />
                                <span>Authentic Product</span>
                            </div>
                            <div className="meta-item">
                                <span>Stock: {product.stock > 0 ? `${product.stock} available` : 'Out of stock'}</span>
                            </div>
                        </div>

                        <Button
                            size="lg"
                            fullWidth
                            className="add-to-cart-btn"
                            style={{ backgroundColor: brandColor }}
                            disabled={product.stock <= 0}
                            onClick={handleAddToCart}
                        >
                            <ShoppingCart size={20} />
                            {addToCartMessage || 'Add to Cart'}
                        </Button>
                    </div>
                </div>

                <div className="product-reviews-section">
                    <div className="reviews-header">
                        <h2>Customer Reviews</h2>
                    </div>

                    <div className="reviews-container-single">
                        <ErrorBoundary>
                            <ReviewList reviews={reviews} onHelpfulVote={loadProductData} />
                        </ErrorBoundary>
                    </div>
                </div>

                <RecentlyViewed currentProductId={productId} />
            </div>
        </div>
    );
};

export default ProductDetail;
