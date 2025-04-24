const express = require('express');
const { addReview, getProductReviews } = require('../controllers/reviewController');
const verifyToken = require('../middlewares/verifyMiddleware'); // Middleware xác thực người dùng
const router = express.Router();

router.post('/', verifyToken, addReview); // Thêm đánh giá
router.get('/:productId', getProductReviews); // Lấy đánh giá của sản phẩm

module.exports = router;