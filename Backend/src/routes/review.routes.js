const express = require('express');
const router = express.Router();
const ReviewController = require('../controllers/review.controller');
// const authMiddleware = require('../middleware/auth.middleware'); // Uncomment when creating auth
// const upload = require('../middleware/upload.middleware'); // Uncomment when creating upload

// Placeholder middlewares if not exists yet
const authMiddleware = (req, res, next) => next();
const upload = { array: () => (req, res, next) => next() };

router.post('/', authMiddleware, upload.array('images', 5), ReviewController.create);
router.get('/product/:productId', ReviewController.getProductReviews);
router.post('/:id/helpful', authMiddleware, ReviewController.markHelpful);

module.exports = router;
