const express = require('express');
const { addReview, getProductReviews } = require('../controllers/reviewController');
const verifyToken = require('../middlewares/verifyMiddleware');
const router = express.Router();

router.post('/', verifyToken, addReview);
router.get('/:productId', getProductReviews);

module.exports = router;