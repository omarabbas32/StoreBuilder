const { asyncHandler } = require('../middleware/errorHandler');
const AddItemRequestDTO = require('../dtos/cart/AddItemRequest.dto');
const UpdateQuantityRequestDTO = require('../dtos/cart/UpdateQuantityRequest.dto');
const RemoveItemRequestDTO = require('../dtos/cart/RemoveItemRequest.dto');

/**
 * CartController - Thin HTTP layer
 * 
 * RULES:
 * - Parse request
 * - Call service
 * - Return response
 * - NO business logic
 */
class CartController {
    constructor(cartService) {
        this.cartService = cartService;
    }

    /**
     * Add item to cart
     * POST /api/cart/add
     */
    addItem = asyncHandler(async (req, res) => {
        const dto = AddItemRequestDTO.fromRequest(req.validatedData);
        const customerId = req.user?.customerId || null;
        const sessionId = req.sessionID || req.session?.id;

        const result = await this.cartService.addItem(dto, customerId, sessionId);

        res.status(200).json({
            success: true,
            message: 'Item added to cart',
            data: result
        });
    });

    /**
     * Update cart item quantity
     * PUT /api/cart/update
     */
    updateQuantity = asyncHandler(async (req, res) => {
        const dto = UpdateQuantityRequestDTO.fromRequest(req.validatedData);
        const customerId = req.user?.customerId || null;
        const sessionId = req.sessionID || req.session?.id;
        const { storeId } = req.params;

        const result = await this.cartService.updateQuantity(
            dto,
            customerId,
            sessionId,
            storeId
        );

        res.status(200).json({
            success: true,
            message: 'Quantity updated',
            data: result
        });
    });

    /**
     * Remove item from cart
     * DELETE /api/cart/remove/:productId
     */
    removeItem = asyncHandler(async (req, res) => {
        const dto = RemoveItemRequestDTO.fromRequest(req.params, req.query);
        const customerId = req.user?.customerId || null;
        const sessionId = req.sessionID || req.session?.id;
        const { storeId } = req.params;

        const result = await this.cartService.removeItem(
            dto,
            customerId,
            sessionId,
            storeId
        );

        res.status(200).json({
            success: true,
            message: 'Item removed from cart',
            data: result
        });
    });

    /**
     * Get current cart
     * GET /api/cart/:storeId
     */
    getCart = asyncHandler(async (req, res) => {
        const customerId = req.user?.customerId || null;
        const sessionId = req.sessionID || req.session?.id;
        const { storeId } = req.params;

        const result = await this.cartService.getCart(
            customerId,
            sessionId,
            storeId
        );

        res.status(200).json({
            success: true,
            data: result
        });
    });

    /**
     * Clear cart
     * DELETE /api/cart/:storeId/clear
     */
    clearCart = asyncHandler(async (req, res) => {
        const customerId = req.user?.customerId || null;
        const sessionId = req.sessionID || req.session?.id;
        const { storeId } = req.params;

        const result = await this.cartService.clearCart(
            customerId,
            sessionId,
            storeId
        );

        res.status(200).json({
            success: true,
            message: 'Cart cleared',
            data: result
        });
    });
}

module.exports = CartController;
