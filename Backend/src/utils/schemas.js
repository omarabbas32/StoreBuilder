const Joi = require('joi');

const schemas = {
    // Auth
    register: Joi.object({
        name: Joi.string().required().min(2),
        email: Joi.string().email().required(),
        password: Joi.string().required().min(6),
        role: Joi.string().valid('admin', 'owner', 'customer').default('customer')
    }),
    login: Joi.object({
        email: Joi.string().email().required(),
        password: Joi.string().required()
    }),

    // Store
    createStore: Joi.object({
        name: Joi.string().required().min(2),
        slug: Joi.string().required().pattern(/^[a-z0-9-]+$/).lowercase().messages({
            'string.pattern.base': 'Slug must only contain lowercase alphanumeric characters and hyphens'
        }),
        description: Joi.string().allow('', null),
        settings: Joi.object().default({})
    }),

    // Product
    createProduct: Joi.object({
        store_id: Joi.string().uuid().required(),
        category_id: Joi.string().uuid().allow(null),
        name: Joi.string().required(),
        description: Joi.string().allow('', null),
        price: Joi.number().required().min(0),
        stock: Joi.number().integer().min(0).default(0),
        images: Joi.array().items(Joi.string()).default([])
    }),
    updateProduct: Joi.object({
        name: Joi.string(),
        description: Joi.string().allow('', null),
        price: Joi.number().min(0),
        stock: Joi.number().integer().min(0),
        images: Joi.array().items(Joi.string()),
        category_id: Joi.string().uuid().allow(null)
    }),
    filterProducts: Joi.object({
        store_id: Joi.string().uuid(),
        limit: Joi.number().integer().min(1).max(100),
        offset: Joi.number().integer().min(0)
    }),

    // Order
    createOrder: Joi.object({
        orderData: Joi.object({
            store_id: Joi.string().uuid().required(),
            customer_name: Joi.string().required(),
            customer_email: Joi.string().email().required(),
            customer_phone: Joi.string().required(),
            shipping_address: Joi.string().required(),
            total_amount: Joi.number().required().min(0),
            notes: Joi.string().allow('', null)
        }).required(),
        items: Joi.array().items(Joi.object({
            product_id: Joi.string().uuid(),
            id: Joi.string().uuid(), // fallback for some frontend refs
            quantity: Joi.number().integer().min(1).required(),
            price: Joi.number().required().min(0)
        })).min(1).required(),
        cartId: Joi.string().uuid().allow(null)
    }),

    // Review
    createReview: Joi.object({
        product_id: Joi.string().uuid().required(),
        store_id: Joi.string().uuid().required(),
        rating: Joi.number().integer().min(1).max(5).required(),
        title: Joi.string().allow('', null),
        comment: Joi.string().allow('', null),
        images: Joi.array().items(Joi.object({
            url: Joi.string().uri().required(),
            alt: Joi.string().allow('', null)
        })).default([])
    })
};

module.exports = schemas;
