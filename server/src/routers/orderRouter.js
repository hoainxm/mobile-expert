
const Router = require('express');
const { getOrders, getOrderDetails, updateOrderStatus, createOrder, getOrderByUserIdStatistics, getOrderById, getOrdersbyUserId } = require('../controllers/orderController');
const verifyToken = require('../middlewares/verifyMiddleware');


const orderRouter = Router();


// Lấy danh sách đơn hàng của người dùng
orderRouter.get('/user/:userId', getOrdersbyUserId);
orderRouter.get('/status',verifyToken,  getOrderByUserIdStatistics); // Lấy danh sách đơn hàng của người dùng theo trạng thái

// Lấy chi tiết đơn hàng
orderRouter.get('/:orderId', getOrderDetails);

// Cập nhật trạng thái đơn hàng
orderRouter.put('/:orderId/status',updateOrderStatus);
orderRouter.post('/cod', createOrder);
module.exports = orderRouter;
