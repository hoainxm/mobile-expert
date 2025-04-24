
const Router = require('express');
const { getOrders, getOrderDetails, updateOrderStatus, createOrder } = require('../controllers/orderController');


const orderRouter = Router();


// Lấy danh sách đơn hàng của người dùng
orderRouter.get('/user/:userId', getOrders);

// Lấy chi tiết đơn hàng
orderRouter.get('/:orderId', getOrderDetails);

// Cập nhật trạng thái đơn hàng
orderRouter.put('/:orderId/status', updateOrderStatus);
orderRouter.post('/cod', createOrder);
orderRouter.get('/status/:userId', getOrders); // Lấy danh sách đơn hàng của người dùng theo trạng thái
module.exports = orderRouter;
