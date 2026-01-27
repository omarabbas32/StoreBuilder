const express = require('express');
const router = express.Router();
const validate = require('../middleware/validate');
const { createReviewSchema } = require('../validators/review.validator');
const { reviewController } = require('../container');
const { auth } = require('../middleware/auth');

/**
 * Review Routes
 */

router.get('/product/:productId', reviewController.getByProduct);

router.post('/',
    auth,
    validate(createReviewSchema),
    reviewController.create
);

router.post('/:id/helpful',
    auth,
    reviewController.markHelpful
);

router.delete('/:id',
    auth,
    reviewController.delete
);

module.exports = router;
