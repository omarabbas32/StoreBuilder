const { UnauthorizedError } = require('../utils/errors');
const Store = require('../models/Store');

const restrictTo = (...roles) => {
    return (req, res, next) => {
        if (!req.user || !roles.includes(req.user.role)) {
            return next(new UnauthorizedError('You do not have permission to perform this action'));
        }
        next();
    };
};

const isStoreOwner = async (req, res, next) => {
    try {
        const storeId = req.params.storeId || req.body.store_id;
        if (!storeId) return next(new UnauthorizedError('Store ID is required'));

        const store = await Store.findById(storeId);
        if (!store) return next(new UnauthorizedError('Store not found'));

        if (store.owner_id !== req.user.id && req.user.role !== 'admin') {
            return next(new UnauthorizedError('You do not own this store'));
        }

        req.store = store;
        next();
    } catch (error) {
        next(error);
    }
};

module.exports = { restrictTo, isStoreOwner };
