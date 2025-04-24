
const Router = require('express');
const { create } = require('../models/orderModel');
const { getOrders, getOrderDetails, updateOrderStatus } = require('../controllers/orderController');


const orderRouter = Router();

// Lấy danh sách đơn hàng của người dùng
orderRouter.get('/user/:userId', getOrders);

// Lấy chi tiết đơn hàng
orderRouter.get('/:orderId', getOrderDetails);

// Cập nhật trạng thái đơn hàng
orderRouter.put('/:orderId/status', updateOrderStatus);
orderRouter.post('/cod', create);

module.exports = orderRouter;
