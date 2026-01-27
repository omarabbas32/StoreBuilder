const { asyncHandler } = require('../middleware/errorHandler');
const CreateOrderRequestDTO = require('../dtos/order/CreateOrderRequest.dto');
const OrderResponseDTO = require('../dtos/order/OrderResponse.dto');

class OrderController {
    constructor(orderService) {
        this.orderService = orderService;
    }

    createFromCart = asyncHandler(async (req, res) => {
        const dto = CreateOrderRequestDTO.fromRequest(req.validatedData);
        const customerId = req.user?.id;
        const sessionId = req.sessionID || req.session?.id;

        const result = await this.orderService.createOrderFromCart(dto, customerId, sessionId);
        res.status(201).json({ success: true, data: new OrderResponseDTO(result) });
    });

    create = asyncHandler(async (req, res) => {
        const dto = CreateOrderRequestDTO.fromRequest(req.validatedData);
        const result = await this.orderService.createOrder(dto);
        res.status(201).json({ success: true, data: new OrderResponseDTO(result) });
    });

    getById = asyncHandler(async (req, res) => {
        const result = await this.orderService.getOrder(req.params.id);
        res.status(200).json({ success: true, data: new OrderResponseDTO(result) });
    });

    getByStore = asyncHandler(async (req, res) => {
        const results = await this.orderService.getOrdersByStore(req.params.storeId, req.query);
        res.status(200).json({ success: true, data: OrderResponseDTO.fromArray(results) });
    });

    updateStatus = asyncHandler(async (req, res) => {
        const result = await this.orderService.updateOrderStatus(req.params.id, req.validatedData.status, req.user.id);
        res.status(200).json({ success: true, data: new OrderResponseDTO(result) });
    });
}

module.exports = OrderController;
