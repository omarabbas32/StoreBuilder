import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, ShoppingCart, ShieldCheck } from 'lucide-react';
import productService from '../services/productService';
import reviewService from '../services/reviewService';
import storeService from '../services/storeService';
import Button from '../components/ui/Button';
import Card from '../components/ui/Card';
import ReviewList from '../components/review/ReviewList';
import ReviewForm from '../components/review/ReviewForm';
import './ProductDetail.css';

const ProductDetail = () => {
    const { productId } = useParams();
    const [product, setProduct] = useState(null);
    const [store, setStore] = useState(null);
    const [reviews, setReviews] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

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

            // Load store info
            const storeResult = await storeService.getStoreById(productResult.data.store_id);
            if (storeResult.success) {
                setStore(storeResult.data);
            }
        } else {
            setError(productResult.error);
        }

        if (reviewsResult.success) {
            setReviews(reviewsResult.data || []);
        }

        setLoading(false);
    };

    const handleReviewSubmitted = (newReview) => {
        setReviews([newReview, ...reviews]);
    };

    if (loading) return <div className="product-detail-loading">Loading product...</div>;
    if (error) return <div className="product-detail-error"><h1>Error</h1><p>{error}</p></div>;

    const brandColor = store?.settings?.primaryColor || '#2563eb';

    return (
        <div className="product-detail-page">
            <div className="container">
                <Link to={store ? `/${store.slug}` : '/'} className="back-link">
                    <ArrowLeft size={16} />
                    Back to Store
                </Link>

                <div className="product-main">
                    <div className="product-gallery">
                        <div className="main-image-placeholder">
                            <span>🛍️</span>
                        </div>
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
                        >
                            <ShoppingCart size={20} />
                            Add to Cart
                        </Button>
                    </div>
                </div>

                <div className="product-reviews-section">
                    <div className="reviews-header">
                        <h2>Customer Reviews</h2>
                    </div>

                    <div className="reviews-grid">
                        <div className="reviews-list-col">
                            <ReviewList reviews={reviews} onHelpfulVote={loadProductData} />
                        </div>
                        <div className="reviews-form-col">
                            <ReviewForm productId={productId} onReviewSubmitted={handleReviewSubmitted} />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ProductDetail;
