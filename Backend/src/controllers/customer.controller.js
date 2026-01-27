const { asyncHandler } = require('../middleware/errorHandler');

class CustomerController {
    constructor(customerService) {
        this.customerService = customerService;
    }

    create = asyncHandler(async (req, res) => {
        const result = await this.customerService.createCustomer(req.body, req.user.id);
        res.status(201).json({ success: true, data: result });
    });

    getById = asyncHandler(async (req, res) => {
        const result = await this.customerService.getCustomer(req.params.id);
        res.status(200).json({ success: true, data: result });
    });

    getByUserId = asyncHandler(async (req, res) => {
        const result = await this.customerService.getCustomerByUserId(req.user.id);
        res.status(200).json({ success: true, data: result });
    });

    update = asyncHandler(async (req, res) => {
        const result = await this.customerService.updateCustomer(req.params.id, req.body, req.user.id);
        res.status(200).json({ success: true, data: result });
    });

    delete = asyncHandler(async (req, res) => {
        await this.customerService.deleteCustomer(req.params.id, req.user.id);
        res.status(200).json({ success: true, message: 'Customer profile deleted' });
    });
}

module.exports = CustomerController;
