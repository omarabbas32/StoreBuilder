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
import ReviewForm from '../components/review/ReviewForm';
import { useStorePath } from '../hooks/useStorePath';
import { formatImageUrl } from '../utils/imageUtils';
import useCartStore from '../store/cartStore';
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
        const [productResult, reviewsResult] = await Promise.all([
            productService.getProductById(productId),
            reviewService.getProductReviews(productId)
        ]);

        if (productResult.success) {
            setProduct(productResult.data);

            // Load store info only if store_id exists
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
            // Backend returns { reviews: [], pagination: {} }
            setReviews(reviewsResult.data?.reviews || reviewsResult.data || []);
        }

        setLoading(false);
    };

    const handleAddToCart = () => {
        addItem(product, 1);
        setAddToCartMessage('Added to cart!');
        setTimeout(() => setAddToCartMessage(''), 2000);
    };

    const handleReviewSubmitted = (newReview) => {
        // Reload all reviews to ensure data consistency
        loadProductData();
    };

    if (loading) return <div className="product-detail-loading">Loading product...</div>;
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

                    <div className="reviews-grid">
                        <div className="reviews-list-col">
                            <ErrorBoundary>
                                <ReviewList reviews={reviews} onHelpfulVote={loadProductData} />
                            </ErrorBoundary>
                        </div>
                        <div className="reviews-form-col">
                            <ErrorBoundary>
                                <ReviewForm productId={productId} onReviewSubmitted={handleReviewSubmitted} />
                            </ErrorBoundary>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ProductDetail;
