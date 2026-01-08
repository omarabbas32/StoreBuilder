const Customer = require('../models/Customer');

class CustomerService {
    async createCustomer(data) {
        return await Customer.create(data);
    }

    async getCustomerById(id) {
        return await Customer.findById(id);
    }

    async updateCustomer(id, data) {
        // Basic implementation placeholder
        return await Customer.update(id, data);
    }
}

module.exports = new CustomerService();
