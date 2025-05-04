const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    products: [
        {
            
            productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
            quantity: { type: Number, required: true },
        },
    ],
    address:[
        {
            name: { type: String, required: true },
            phone: { type: String, required: true },
            address: { type: String, required: true },
        },
    ],
    totalAmount: { type: Number, required: true },
    status: { type: String, default: 'Pending' }, // Trạng thái đơn hàng: Pending, Completed, Canceled
    createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model('Order', orderSchema);