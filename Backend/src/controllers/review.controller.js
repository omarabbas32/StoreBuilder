const ReviewService = require('../services/review.service');

class ReviewController {
    async create(req, res) {
        try {
            // Assuming user is attached to req by auth middleware
            const customer_id = req.user ? req.user.id : null;

            // If images uploaded via multer
            const images = req.files ? req.files.map(file => ({
                url: file.path, // or cloud URL
                alt: file.originalname
            })) : [];

            const reviewData = {
                ...req.body,
                customer_id,
                images: images.length > 0 ? images : req.body.images // allow sending direct JSON if no file upload
            };

            const review = await ReviewService.createReview(reviewData);
            res.status(201).json(review);
        } catch (error) {
            console.error(error);
            res.status(500).json({ error: 'Failed to create review' });
        }
    }

    async getProductReviews(req, res) {
        try {
            const { productId } = req.params;
            const page = parseInt(req.query.page) || 1;
            const limit = parseInt(req.query.limit) || 20;
            const result = await ReviewService.getProductReviews(productId, page, limit);
            res.json(result);
        } catch (error) {
            console.error('Fetch reviews error:', error);
            res.status(500).json({ error: 'Failed to fetch reviews' });
        }
    }

    async markHelpful(req, res) {
        try {
            const { id } = req.params;
            const customer_id = req.user ? req.user.id : null;
            if (!customer_id) return res.status(401).json({ error: 'Unauthorized' });

            await ReviewService.markHelpful(id, customer_id);
            res.json({ message: 'Vote recorded' });
        } catch (error) {
            console.error(error);
            res.status(500).json({ error: 'Failed to record vote' });
        }
    }
}

module.exports = new ReviewController();
