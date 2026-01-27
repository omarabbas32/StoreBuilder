const { asyncHandler } = require('../middleware/errorHandler');
const CreateReviewRequestDTO = require('../dtos/review/CreateReviewRequest.dto');
const ReviewResponseDTO = require('../dtos/review/ReviewResponse.dto');

class ReviewController {
    constructor(reviewService) {
        this.reviewService = reviewService;
    }

    create = asyncHandler(async (req, res) => {
        const dto = CreateReviewRequestDTO.fromRequest(req.validatedData);
        // Assuming req.user contains customer context or we fetch it
        // For simplicity, using req.user.id as customerId (needs mapping if separate)
        const result = await this.reviewService.createReview(dto, req.user.id);
        res.status(201).json({ success: true, data: new ReviewResponseDTO(result) });
    });

    getByProduct = asyncHandler(async (req, res) => {
        const result = await this.reviewService.getProductReviews(req.params.productId, req.query);
        // PaginationDTO wraps the data, we might need to map the internal data array
        result.data = ReviewResponseDTO.fromArray(result.data);
        res.status(200).json({ success: true, data: result });
    });

    markHelpful = asyncHandler(async (req, res) => {
        await this.reviewService.markHelpful(req.params.id, req.user.id);
        res.status(200).json({ success: true, message: 'Review marked as helpful' });
    });

    delete = asyncHandler(async (req, res) => {
        const isOwner = req.user.role === 'merchant' || req.user.role === 'admin';
        await this.reviewService.deleteReview(req.params.id, req.user.id, isOwner);
        res.status(200).json({ success: true, message: 'Review deleted successfully' });
    });
}

module.exports = ReviewController;
