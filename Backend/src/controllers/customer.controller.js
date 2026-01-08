const CustomerService = require('../services/customer.service');

class CustomerController {
    async create(req, res) {
        try {
            const customer = await CustomerService.createCustomer(req.body);
            res.status(201).json(customer);
        } catch (error) {
            res.status(400).json({ error: error.message });
        }
    }

    async getById(req, res) {
        try {
            const customer = await CustomerService.getCustomerById(req.params.id);
            if (!customer) return res.status(404).json({ error: 'Customer not found' });
            res.json(customer);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    }
}

module.exports = new CustomerController();
