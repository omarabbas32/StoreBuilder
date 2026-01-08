class PaymentService {
    async processPayment(orderId, amount) {
        return { status: 'success', transactionId: 'fake-id' };
    }
}

module.exports = new PaymentService();
