const express = require('express');
const router = express.Router();
const container = require('../container');
const auth = require('../middleware/auth');
const validate = require('../middleware/validate');

// Import Schemas
const { registerSchema, loginSchema } = require('../validators/auth.validator');
const { createStoreSchema } = require('../validators/store.validator');

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
storeRouter.get('/', (req, res, next) => container.storeController.getAll(req, res, next));
storeRouter.get('/:id', (req, res, next) => container.storeController.getById(req, res, next));
storeRouter.post('/', auth, validate(createStoreSchema), (req, res, next) => container.storeController.create(req, res, next));
router.use('/stores', storeRouter);

// Products
const productRouter = express.Router();
productRouter.get('/store/:storeId', (req, res, next) => container.productController.getByStore(req, res, next));
productRouter.get('/:id', (req, res, next) => container.productController.getById(req, res, next));
router.use('/products', productRouter);

// Categories
const categoryRouter = express.Router();
categoryRouter.get('/store/:storeId', (req, res, next) => container.categoryController.getByStore(req, res, next));
router.use('/categories', categoryRouter);

// Customers
const customerRouter = express.Router();
customerRouter.get('/me', auth, (req, res, next) => container.customerController.getByUserId(req, res, next));
router.use('/customers', customerRouter);

// Orders
const orderRouter = express.Router();
orderRouter.post('/', auth, (req, res, next) => container.orderController.create(req, res, next));
orderRouter.get('/me', auth, (req, res, next) => container.orderController.getByCustomer(req, res, next));
router.use('/orders', orderRouter);

// Reviews
const reviewRouter = express.Router();
reviewRouter.post('/', auth, (req, res, next) => container.reviewController.create(req, res, next));
router.use('/reviews', reviewRouter);

// Themes
const themeRouter = express.Router();
themeRouter.get('/', (req, res, next) => container.themeController.getAll(req, res, next));
router.use('/themes', themeRouter);

// Components
const componentRouter = express.Router();
componentRouter.get('/active', (req, res, next) => container.componentController.getActive(req, res, next));
router.use('/components', componentRouter);

// Onboarding
const onboardingRouter = express.Router();
onboardingRouter.get('/schema', (req, res, next) => container.onboardingController.getSchema(req, res, next));
onboardingRouter.post('/ai-create', auth, (req, res, next) => container.onboardingController.aiCreateStore(req, res, next));
router.use('/onboarding', onboardingRouter);

// Cart
const cartRouter = express.Router();
cartRouter.get('/', (req, res, next) => container.cartController.getCart(req, res, next));
cartRouter.post('/items', (req, res, next) => container.cartController.addItem(req, res, next));
router.use('/cart', cartRouter);

module.exports = router;
