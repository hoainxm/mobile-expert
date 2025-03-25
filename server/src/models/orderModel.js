const mongoose = require('mongoose');

const OrderSchema = new mongoose.Schema({
  userId: { type: String, required: true },
  totalAmount: { type: Number, required: true },
  items: [
    {
      id: String,
      name: { type: String, required: true },
      imageUrl: String,
      price: { type: Number, required: true },
      quantity: { type: Number, required: true }
    }
  ],
  paymentMethod: { type: String, required: true },
  status: {
    type: String,
    enum: ['Mới', 'Đã xác nhận', 'Đang chuẩn bị giao hàng', 'Đang giao hàng', 'Đã giao hàng', 'Hủy'],
    default: 'Mới'
  },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

const Order = mongoose.model('Order', OrderSchema);
module.exports = Order;
