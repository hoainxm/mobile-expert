const { v4: uuidv4 } = require('uuid'); // Thư viện để tạo mã giảm giá ngẫu nhiên
const Discount = require('../models/DiscountCode');

exports.getallDiscountCode = async (req, res) => {
    try {
        const discountCodes = await Discount.find({});
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
        const discountCode = new Discount({
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
exports.getdiscountbyid = async (req, res) => {
    try {
        console.log(req.params.id);

        const discountCode = await Discount.findById(req.params.id);
        if (!discountCode) {
            return res.status(404).json({
                success: false,
                message: 'Mã giảm giá không tồn tại.',
            });
        }
        res.status(200).json({
            success: true,
            discountCode,
        });
    } catch (error) {
        console.error('Lỗi khi lấy mã giảm giá:', error);
        res.status(500).json({
            success: false,
            message: 'Lỗi khi lấy mã giảm giá.',
            error: error.message,
        });
    }
}

exports.getuserDiscountCode = async (req, res) => {
    try {
        const userId = req.user.id;
        const discounts = await Discount.find({ userId: userId }).populate('code');
        const usedDiscountCodes = discounts.map(discount => discount.discountCode).filter(code => code !== null);
        res.status(200).json({
            success: true,
            usedDiscountCodes,
        });
    } catch (error) {
        console.error('Lỗi khi lấy mã giảm giá của người dùng:', error);
        res.status(500).json({
            success: false,
            message: 'Lỗi khi lấy mã giảm giá của người dùng.',
            error: error.message,
        });
    }
}
