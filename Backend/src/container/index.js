const prisma = require('../db/prismaClient');

// Import Models
const cartModel = require('../models/cart.model');
const cartItemModel = require('../models/cartItem.model');
const productModel = require('../models/product.model');
const userModel = require('../models/user.model');
const orderModel = require('../models/order.model');
const orderItemModel = require('../models/orderItem.model');
const storeModel = require('../models/store.model');
const categoryModel = require('../models/category.model');
const customerModel = require('../models/customer.model');
const reviewModel = require('../models/review.model');
const reviewHelpfulVoteModel = require('../models/reviewHelpfulVote.model');
const themeModel = require('../models/theme.model');
const componentModel = require('../models/component.model');

// Import Services
const CartService = require('../services/cart.service');
const ProductService = require('../services/product.service');
const OrderService = require('../services/order.service');
const StoreService = require('../services/store.service');
const AuthService = require('../services/auth.service');
const CategoryService = require('../services/category.service');
const ReviewService = require('../services/review.service');
const CustomerService = require('../services/customer.service');
const ThemeService = require('../services/theme.service');
const ComponentService = require('../services/component.service');
const EmailService = require('../services/email.service');
const AIService = require('../services/ai.service');
const AnalyticsService = require('../services/analytics.service');
const OnboardingService = require('../services/onboarding.service');
const PaymentService = require('../services/payment.service');
const UploadService = require('../services/upload.service');
const WebhookService = require('../services/webhook.service');

// Import Controllers
const CartController = require('../controllers/cart.controller');
const ProductController = require('../controllers/product.controller');
const OrderController = require('../controllers/order.controller');
const StoreController = require('../controllers/store.controller');
const AuthController = require('../controllers/auth.controller');
const CategoryController = require('../controllers/category.controller');
const ReviewController = require('../controllers/review.controller');
const CustomerController = require('../controllers/customer.controller');
const ThemeController = require('../controllers/theme.controller');
const ComponentController = require('../controllers/component.controller');
const OnboardingController = require('../controllers/onboarding.controller');
const MediaController = require('../controllers/media.controller');
const WebhookController = require('../controllers/webhook.controller');
const NotificationService = require('../services/notification.service');
const NotificationController = require('../controllers/notification.controller');

// Infrastructure
const emailService = new EmailService();
const uploadService = new UploadService();
const aiService = new AIService();

// Services
const webhookService = new WebhookService({ prisma });
const notificationService = new NotificationService({ prisma });
const cartService = new CartService({ cartModel, cartItemModel, productModel, prisma });
const productService = new ProductService({ productModel, storeModel, categoryModel, prisma, webhookService, notificationService });
const orderService = new OrderService({ orderModel, orderItemModel, productModel, cartModel, cartItemModel, storeModel, prisma, webhookService, notificationService });
const storeService = new StoreService({ storeModel, userModel, categoryModel, prisma });
const authService = new AuthService({ userModel, emailService });
const categoryService = new CategoryService({ categoryModel, storeModel, prisma });
const reviewService = new ReviewService({ reviewModel, reviewHelpfulVoteModel, productModel, orderModel, storeModel, prisma });
const customerService = new CustomerService({ customerModel, userModel });
const themeService = new ThemeService({ themeModel, userModel });
const componentService = new ComponentService({ componentModel });
const paymentService = new PaymentService({ orderModel });
const analyticsService = new AnalyticsService({ prisma, orderModel, productModel, storeModel, userModel });
const onboardingService = new OnboardingService({ themeService, componentService, storeService, aiService, productService, categoryService });
const notificationController = new NotificationController({ notificationService, storeService });

// Controllers
const cartController = new CartController(cartService);
const productController = new ProductController(productService);
const orderController = new OrderController(orderService);
const storeController = new StoreController(storeService);
const authController = new AuthController(authService);
const categoryController = new CategoryController(categoryService);
const reviewController = new ReviewController(reviewService);
const customerController = new CustomerController(customerService);
const themeController = new ThemeController(themeService);
const componentController = new ComponentController(componentService);
const onboardingController = new OnboardingController(onboardingService);
const mediaController = new MediaController(uploadService, prisma);
const webhookController = new WebhookController({ webhookService });

const container = {
    cartService, productService, orderService, storeService, authService, categoryService,
    reviewService, customerService, themeService, componentService, emailService,
    uploadService, aiService, paymentService, analyticsService, onboardingService, webhookService,
    notificationService,
    cartController, productController, orderController, storeController, authController,
    categoryController, reviewController, customerController, themeController,
    componentController, onboardingController, mediaController, webhookController,
    notificationController,
    cartModel, cartItemModel, productModel, userModel, orderModel, orderItemModel,
    storeModel, categoryModel, customerModel, reviewModel, reviewHelpfulVoteModel,
    themeModel, componentModel, prisma
};

console.log('[DEBUG_CONTAINER] container keys:', Object.keys(container));

module.exports = container;
