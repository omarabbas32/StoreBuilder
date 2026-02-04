const express = require('express');
const router = express.Router();
const { reviewController } = require('../container');
const { auth } = require('../middleware/auth');

/**
 * Review Routes
 */

router.get('/product/:productId', reviewController.getByProduct);

router.post('/',
   // auth,
    // NOTE: FormData cannot be validated by middleware before body parsing
    // Validation happens inside controller instead
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
