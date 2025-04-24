const Review = require('../models/Review');
const DiscountCode = require('../models/DiscountCode');
const { v4: uuidv4 } = require('uuid'); // Thư viện để tạo mã giảm giá ngẫu nhiên
const Order = require('../models/Order');

exports.addReview = async (req, res) => {
    try {
        const { productId, rating, comment } = req.body;
        const userId = req.user.id;

        // Kiểm tra xem người dùng đã mua sản phẩm này chưa
        const hasPurchased = await Order.findOne({
            userId,
            'products.productId': productId,
        });
        if (!hasPurchased) {
            return res.status(400).json({ message: 'Bạn chưa mua sản phẩm này, không thể đánh giá.' });
        }

        // Tạo đánh giá mới
        const review = new Review({
            userId,
            productId,
            rating,
            comment,
        });

        await review.save();

        // Tạo mã giảm giá cho lần mua sau
        const discountCode = new DiscountCode({
            userId,
            code: uuidv4(), // Tạo mã giảm giá ngẫu nhiên
            discountPercentage: 10, // Giảm giá 10%
            isUsed: false,
            createdAt: new Date(),
            expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // Hết hạn sau 7 ngày
        });

        await discountCode.save();

        res.status(201).json({
            message: 'Đánh giá thành công! Bạn đã nhận được mã giảm giá cho lần mua sau.',
            discountCode: discountCode.code,
        });
    } catch (error) {
        console.error('Lỗi khi thêm đánh giá:', error);
        res.status(500).json({ message: 'Lỗi khi thêm đánh giá', error: error.message });
    }
};
exports.getProductReviews = async (req, res) => {
    try {
        const { productId } = req.params;

        const reviews = await Review.find({ productId }).populate('userId', 'name email');

        res.status(200).json(reviews);
    } catch (error) {
        console.error('Lỗi khi lấy đánh giá sản phẩm:', error);
        res.status(500).json({ message: 'Lỗi khi lấy đánh giá sản phẩm', error: error.message });
    }
};