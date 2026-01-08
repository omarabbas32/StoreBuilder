const PaymentService = require('../services/payment.service');

class PaymentController {
    async process(req, res) {
        try {
            const { orderId, amount } = req.body;
            const result = await PaymentService.processPayment(orderId, amount);
            res.json(result);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    }
}

module.exports = new PaymentController();
