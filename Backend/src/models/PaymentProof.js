const BaseModel = require('./BaseModel');
const db = require('../config/database');

class PaymentProof extends BaseModel {
    constructor() {
        super('payment_proofs');
    }

    // Implementation of payment proof logic
}

module.exports = new PaymentProof();
