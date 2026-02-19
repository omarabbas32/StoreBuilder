const express = require('express');
const router = express.Router();
const { reviewController } = require('../container');
const { auth } = require('../middleware/auth');

/**
 * Review Routes
 */

router.get('/product/:productId', reviewController.getByProduct);
router.get('/eligibility/:productId', auth, reviewController.checkEligibility);

router.post('/',
    auth,
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
