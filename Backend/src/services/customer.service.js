const AppError = require('../utils/AppError');

/**
 * CustomerService - Contains ALL customer business logic
 * 
 * Business Rules:
 * - Customer is linked to User
 * - One customer per user
 */
class CustomerService {
    constructor({ customerModel, userModel }) {
        this.customerModel = customerModel;
        this.userModel = userModel;
    }

    /**
     * Create customer profile
     * Business Rule: User must exist
     */
    async createCustomer(dto, userId) {
        // Business Rule: User must exist
        const user = await this.userModel.findById(userId);
        if (!user) {
            throw new AppError('User not found', 404);
        }

        // Check if customer profile already exists
        const existing = await this.customerModel.findByUserId(userId);
        if (existing) {
            throw new AppError('Customer profile already exists', 409);
        }

        const customer = await this.customerModel.create({
            user_id: userId,
            first_name: dto.firstName,
            last_name: dto.lastName,
            phone: dto.phone || null,
            address: dto.address || {}
        });

        return customer;
    }

    /**
     * Get customer by ID
     */
    async getCustomer(customerId) {
        const customer = await this.customerModel.findById(customerId);
        if (!customer) {
            throw new AppError('Customer not found', 404);
        }
        return customer;
    }

    /**
     * Get customer by user ID
     */
    async getCustomerByUserId(userId) {
        const customer = await this.customerModel.findByUserId(userId);
        if (!customer) {
            throw new AppError('Customer profile not found', 404);
        }
        return customer;
    }

    /**
     * Update customer
     * Business Rule: User can only update their own profile
     */
    async updateCustomer(customerId, dto, userId) {
        const customer = await this.customerModel.findById(customerId);
        if (!customer) {
            throw new AppError('Customer not found', 404);
        }

        // Verify ownership
        if (customer.user_id !== userId) {
            throw new AppError('You can only update your own profile', 403);
        }

        const updated = await this.customerModel.update(customerId, dto);
        return updated;
    }

    /**
     * Delete customer
     */
    async deleteCustomer(customerId, userId) {
        const customer = await this.customerModel.findById(customerId);
        if (!customer) {
            throw new AppError('Customer not found', 404);
        }

        if (customer.user_id !== userId) {
            throw new AppError('You can only delete your own profile', 403);
        }

        await this.customerModel.delete(customerId);
        return { success: true, message: 'Customer profile deleted' };
    }
}

module.exports = CustomerService;
