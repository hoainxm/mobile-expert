const mongoose = require('mongoose');

const discountCodeSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    code: { type: String, required: true, unique: true },
    discountPercentage: { type: Number, required: true }, // Phần trăm giảm giá
    isUsed: { type: Boolean, default: false }, // Trạng thái mã giảm giá
    createdAt: { type: Date, default: Date.now },
    expiresAt: { type: Date, required: true }, // Ngày hết hạn
});

module.exports = mongoose.model('DiscountCode', discountCodeSchema);