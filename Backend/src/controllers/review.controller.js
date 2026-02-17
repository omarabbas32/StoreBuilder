const { asyncHandler } = require('../middleware/errorHandler');
const CreateReviewRequestDTO = require('../dtos/review/CreateReviewRequest.dto');
const ReviewResponseDTO = require('../dtos/review/ReviewResponse.dto');
const { createReviewSchema } = require('../validators/review.validator');
const { v4: uuidv4 } = require('uuid');

class ReviewController {
    constructor(reviewService) {
        this.reviewService = reviewService;
    }

    create = asyncHandler(async (req, res) => {
        // Validate request data (must happen in controller for FormData support)
        if (!req.body || Object.keys(req.body).length === 0) {
            return res.status(400).json({
                success: false,
                error: 'Request body is empty',
                details: []
            });
        }

        const validation = createReviewSchema.safeParse(req.body);
        if (!validation.success) {
            return res.status(400).json({
                success: false,
                error: 'Validation failed',
                details: validation.error.errors
            });
        }

        const dto = CreateReviewRequestDTO.fromRequest(validation.data);
        // Get IP address for anonymous reviews
        const ipAddress = req.ip || req.connection.remoteAddress;
        const result = await this.reviewService.createReview(dto, ipAddress);
        res.status(201).json({ success: true, data: new ReviewResponseDTO(result) });
    });

    getByProduct = asyncHandler(async (req, res) => {
        const result = await this.reviewService.getProductReviews(req.params.productId, req.query);
        // PaginationDTO wraps the data, we might need to map the internal data array
        result.data = ReviewResponseDTO.fromArray(result.data);
        res.status(200).json({ success: true, data: result });
    });

    markHelpful = asyncHandler(async (req, res) => {
        const ipAddress = req.ip || req.connection.remoteAddress;
        await this.reviewService.markHelpful(req.params.id, ipAddress);
        res.status(200).json({ success: true, message: 'Review marked as helpful' });
    });

    getByStore = asyncHandler(async (req, res) => {
        const result = await this.reviewService.getStoreReviews(req.params.storeId, req.query);
        result.data = ReviewResponseDTO.fromArray(result.data);
        res.status(200).json({ success: true, data: result });
    });

    updateStatus = asyncHandler(async (req, res) => {
        const { status } = req.body;
        const result = await this.reviewService.updateReviewStatus(req.params.id, status, req.user.id);
        res.status(200).json({ success: true, data: new ReviewResponseDTO(result) });
    });

    addResponse = asyncHandler(async (req, res) => {
        const { response } = req.body;
        const result = await this.reviewService.addOwnerResponse(req.params.id, response, req.user.id);
        res.status(200).json({ success: true, data: new ReviewResponseDTO(result) });
    });

    delete = asyncHandler(async (req, res) => {
        const isOwner = req.user.role === 'merchant' || req.user.role === 'admin';
        await this.reviewService.deleteReview(req.params.id, req.user.id, isOwner);
        res.status(200).json({ success: true, message: 'Review deleted successfully' });
    });
}

module.exports = ReviewController;
