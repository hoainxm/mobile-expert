const DiscountCode = require('../models/DiscountCode');
const { v4: uuidv4 } = require('uuid'); // Thư viện để tạo mã giảm giá ngẫu nhiên
const Order = require('../models/Order');


exports.getallDiscountCode = async (req, res) => {
    try {
        const discountCodes = await DiscountCode.find({});
        res.status(200).json({
            success: true,
            discountCodes,
        });
    } catch (error) {
        console.error('Lỗi khi lấy danh sách mã giảm giá:', error);
        res.status(500).json({
            success: false,
            message: 'Lỗi khi lấy danh sách mã giảm giá.',
            error: error.message,
        });
    }
}
exports.addDiscountCode = async (req, res) => {
    try {
        const { discountPercentage, expiresAt } = req.body;
        const code = uuidv4(); // Tạo mã giảm giá ngẫu nhiên

        // Tạo mã giảm giá mới
        const discountCode = new DiscountCode({
            code,
            discountPercentage,
            isUsed: false,
            createdAt: new Date(),
            expiresAt: new Date(expiresAt), // Ngày hết hạn từ yêu cầu
        });

        await discountCode.save();

        res.status(201).json({
            success: true,
            message: 'Mã giảm giá đã được tạo thành công!',
            discountCode: discountCode.code,
        });
    } catch (error) {
        console.error('Lỗi khi thêm mã giảm giá:', error);
        res.status(500).json({
            success: false,
            message: 'Lỗi khi thêm mã giảm giá.',
            error: error.message,
        });
    }
}
