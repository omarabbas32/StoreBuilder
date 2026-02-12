const express = require('express');
const router = express.Router();
const container = require('../container');
const auth = require('../middleware/auth');
const validate = require('../middleware/validate');
const { upload, uploadMultipleImages } = require('../middleware/upload');

// Import Schemas
const { registerSchema, loginSchema } = require('../validators/auth.validator');
const { createStoreSchema, updateStoreSchema } = require('../validators/store.validator');
const { createProductSchema, updateProductSchema } = require('../validators/product.validator');
const { createCategorySchema, updateCategorySchema } = require('../validators/category.validator');
const { createOrderSchema } = require('../validators/order.validator');
const themeValidators = require('../validators/theme.validator');
const { createThemeSchema, updateThemeSchema, createTemplateSchema } = themeValidators;

/**
 * Clean Module Routes
 */

// Auth
const authRouter = express.Router();
authRouter.post('/register', validate(registerSchema), (req, res, next) => container.authController.register(req, res, next));
authRouter.post('/login', validate(loginSchema), (req, res, next) => container.authController.login(req, res, next));
authRouter.post('/verify-email', (req, res, next) => container.authController.verifyEmail(req, res, next));
router.use('/auth', authRouter);

// Stores
const storeRouter = express.Router();
storeRouter.get('/', auth, (req, res, next) => container.storeController.getMyStores(req, res, next));
storeRouter.get('/:id', (req, res, next) => container.storeController.getById(req, res, next));
storeRouter.get('/slug/:slug', (req, res, next) => container.storeController.getBySlug(req, res, next));
storeRouter.post('/', auth, validate(createStoreSchema), (req, res, next) => container.storeController.create(req, res, next));
storeRouter.put('/:id', auth, validate(updateStoreSchema), (req, res, next) => container.storeController.update(req, res, next));
storeRouter.put('/:id/components/:componentId', auth, (req, res, next) => container.storeController.updateComponentContent(req, res, next));
storeRouter.delete('/:id', auth, (req, res, next) => container.storeController.delete(req, res, next));
storeRouter.post('/:id/onboarding', auth, (req, res, next) => container.onboardingController.completeStoreOnboarding(req, res, next));
router.use('/stores', storeRouter);

// Products
const productRouter = express.Router();
productRouter.get('/', (req, res, next) => container.productController.getAll(req, res, next));
productRouter.get('/store/:storeId', (req, res, next) => container.productController.getByStore(req, res, next));
productRouter.get('/:id', (req, res, next) => container.productController.getById(req, res, next));
productRouter.post('/', auth, validate(createProductSchema), (req, res, next) => container.productController.create(req, res, next));
productRouter.put('/:id', auth, validate(updateProductSchema), (req, res, next) => container.productController.update(req, res, next));
productRouter.delete('/:id', auth, (req, res, next) => container.productController.delete(req, res, next));
router.use('/products', productRouter);

// Categories
const categoryRouter = express.Router();
categoryRouter.get('/store/:storeId', (req, res, next) => container.categoryController.getByStore(req, res, next));
categoryRouter.get('/:id', (req, res, next) => container.categoryController.getById(req, res, next));
categoryRouter.post('/', auth, validate(createCategorySchema), (req, res, next) => container.categoryController.create(req, res, next));
categoryRouter.put('/:id', auth, validate(updateCategorySchema), (req, res, next) => container.categoryController.update(req, res, next));
categoryRouter.delete('/:id', auth, (req, res, next) => container.categoryController.delete(req, res, next));
router.use('/categories', categoryRouter);

// Customers
const customerRouter = express.Router();
customerRouter.get('/me', auth, (req, res, next) => container.customerController.getByUserId(req, res, next));
router.use('/customers', customerRouter);

// Orders
const orderRouter = express.Router();
orderRouter.get('/store/:storeId', auth, (req, res, next) => container.orderController.getByStore(req, res, next));
orderRouter.get('/my-orders', auth, (req, res, next) => container.orderController.getMyOrders(req, res, next));
orderRouter.post('/', validate(createOrderSchema), (req, res, next) => container.orderController.create(req, res, next));
orderRouter.post('/checkout', validate(createOrderSchema), (req, res, next) => container.orderController.createFromCart(req, res, next));
router.use('/orders', orderRouter);

// Reviews
const reviewRouter = express.Router();
reviewRouter.post('/', auth, (req, res, next) => container.reviewController.create(req, res, next));
router.use('/reviews', reviewRouter);

// Themes
const themeRouter = express.Router();

// Public: Get all active themes (requires auth to get user-specific templates)
themeRouter.get('/', auth, (req, res, next) => container.themeController.getAll(req, res, next));

// User: Create custom template from existing store design
themeRouter.post('/', auth, validate(createTemplateSchema), (req, res, next) => container.themeController.createTemplate(req, res, next));

// Admin: Manage global themes
themeRouter.get('/admin', auth, (req, res, next) => container.themeController.adminGetAll(req, res, next));
themeRouter.post('/admin', auth, validate(createThemeSchema), (req, res, next) => container.themeController.create(req, res, next));
themeRouter.put('/:id', auth, validate(updateThemeSchema), (req, res, next) => container.themeController.update(req, res, next));
themeRouter.delete('/:id', auth, (req, res, next) => container.themeController.delete(req, res, next));

router.use('/themes', themeRouter);

// Components
const componentRouter = express.Router();
componentRouter.get('/', (req, res, next) => container.componentController.getActive(req, res, next));
componentRouter.get('/admin', (req, res, next) => container.componentController.adminGetAll(req, res, next));
componentRouter.post('/admin', (req, res, next) => container.componentController.create(req, res, next));
router.use('/components', componentRouter);

// Onboarding
const onboardingRouter = express.Router();
onboardingRouter.get('/schema', (req, res, next) => container.onboardingController.getSchema(req, res, next));
onboardingRouter.post('/complete/:id', auth, (req, res, next) => container.onboardingController.completeStoreOnboarding(req, res, next));
onboardingRouter.post('/assistant-chat', auth, (req, res, next) => container.onboardingController.assistantChat(req, res, next));
router.use('/onboarding', onboardingRouter);

// Media (Generic & Store-specific)
const mediaRouter = express.Router();
// Legacy/Specific Support
router.post('/stores/:storeId/uploads', auth, upload.single('file'), (req, res, next) => container.mediaController.uploadImage(req, res, next));
router.get('/stores/:storeId/uploads', auth, (req, res, next) => container.mediaController.listByStore(req, res, next));
router.delete('/stores/:storeId/uploads/:id', auth, (req, res, next) => container.mediaController.delete(req, res, next));

// Generic New API
router.get('/media/search', (req, res, next) => container.mediaController.searchImages(req, res, next));
mediaRouter.post('/upload', auth, upload.single('image'), (req, res, next) => container.mediaController.uploadImage(req, res, next));
mediaRouter.post('/upload-multiple', auth, uploadMultipleImages, (req, res, next) => container.mediaController.uploadMultiple(req, res, next));
router.use('/media', mediaRouter);

// Cart
const cartRouter = express.Router();
cartRouter.get('/', (req, res, next) => container.cartController.getCart(req, res, next));
cartRouter.post('/items', (req, res, next) => container.cartController.addItem(req, res, next));
router.use('/cart', cartRouter);

// Webhooks
const webhookRouter = express.Router();
webhookRouter.get('/', auth, (req, res, next) => container.webhookController.getAll(req, res, next));
webhookRouter.post('/', auth, (req, res, next) => container.webhookController.create(req, res, next));
webhookRouter.get('/:id', auth, (req, res, next) => container.webhookController.getOne(req, res, next));
webhookRouter.put('/:id', auth, (req, res, next) => container.webhookController.update(req, res, next));
webhookRouter.delete('/:id', auth, (req, res, next) => container.webhookController.delete(req, res, next));
webhookRouter.post('/:id/regenerate-secret', auth, (req, res, next) => container.webhookController.regenerateSecret(req, res, next));
webhookRouter.post('/:id/test', auth, (req, res, next) => container.webhookController.sendTest(req, res, next));
webhookRouter.get('/:id/logs', auth, (req, res, next) => container.webhookController.getLogs(req, res, next));
router.use('/webhooks', webhookRouter);

// Notifications
const notificationRouter = express.Router();
notificationRouter.get('/', auth, (req, res, next) => container.notificationController.getAll(req, res, next));
notificationRouter.put('/:id/read', auth, (req, res, next) => container.notificationController.markAsRead(req, res, next));
notificationRouter.put('/mark-all-read', auth, (req, res, next) => container.notificationController.markAllAsRead(req, res, next));
notificationRouter.delete('/:id', auth, (req, res, next) => container.notificationController.delete(req, res, next));
router.use('/notifications', notificationRouter);

module.exports = router;
