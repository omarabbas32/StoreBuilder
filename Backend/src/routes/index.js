const express = require('express');
const router = express.Router();

console.log('[DEBUG_INDEX] Loading routes...');
try {
    console.log('[DEBUG_INDEX] categoryRoutes path:', require.resolve('./category.routes'));
} catch (e) {
    console.log('[DEBUG_INDEX] Failed to resolve categoryRoutes');
}

const authRoutes = require('./auth.routes');
const storeRoutes = require('./store.routes');
const productRoutes = require('./product.routes');
const customerRoutes = require('./customer.routes');
const orderRoutes = require('./order.routes');
const reviewRoutes = require('./review.routes');
const themeRoutes = require('./theme.routes');
const paymentRoutes = require('./payment.routes');
const categoryRoutes = require('./category.routes');
const componentRoutes = require('./component.routes');
const adminRoutes = require('./admin.routes');
const mediaRoutes = require('./media.routes');
const cartRoutes = require('./cart.routes');
const uploadRoutes = require('./upload.routes');

router.use('/auth', authRoutes);
router.use('/stores', storeRoutes);
router.use('/products', productRoutes);
router.use('/customers', customerRoutes);
router.use('/orders', orderRoutes);
router.use('/reviews', reviewRoutes);
router.use('/themes', themeRoutes);
router.use('/payments', paymentRoutes);
router.use('/categories', categoryRoutes);
router.use('/components', componentRoutes);
router.use('/admin', adminRoutes);
router.use('/media', mediaRoutes);
router.use('/cart', cartRoutes);
router.use('/stores/:storeId/uploads', uploadRoutes);

module.exports = router;
