const mongoose = require('mongoose');
const Order = require("../models/Order");


exports.createOrder = async (req, res) => {
  try {
    const { userId, totalAmount, items, paymentMethod } = req.body;
    console.log('Dữ liệu nhận được:', req.body);

    if (!userId) {
      return res.status(400).json({ message: 'Thiếu userId' });
    }

    // Chuyển đổi productId thành ObjectId
    const products = items.map((item) => ({
      productId: new mongoose.Types.ObjectId(item.productId), // Sử dụng 'new' ở đây
      quantity: item.quantity,
    }));

    const newOrder = await Order.create({
      userId: new mongoose.Types.ObjectId(userId), // Sử dụng 'new' ở đây
      totalAmount,
      products,
      paymentMethod,
      status: 'Pending',
    });

    console.log('Đơn hàng mới:', newOrder);

    res.status(201).json({
      message: 'Đơn hàng đã được đặt thành công',
      orderId: newOrder._id,
      data: newOrder,

    });
  } catch (error) {
    console.error('Lỗi khi tạo đơn hàng:', error);
    res.status(400).json({ message: 'Lỗi khi tạo đơn hàng', error: error.message });
  }
};

exports.getOrdersbyUserId = async (req, res) => {
  try {
    const { userId } = req.params;
    const orders = await Order.find({ userId });
    console.log("hheh");

    if (orders.length === 0) {
      return res.status(404).json({ message: 'Không tìm thấy đơn hàng của người dùng này' });
    }

    res.status(200).json(orders);
  } catch (error) {
    console.error('Lỗi khi lấy danh sách đơn hàng:', error);
    res.status(500).json({ message: 'Lỗi khi lấy danh sách đơn hàng', error: error.message });
  }
};
// thông kê dòng tiền 
exports.getOrderByUserIdStatistics = async (req, res) => {
  try {
    const { userId } = req.params;
    console.log('userId:', userId); // Kiểm tra giá trị của userId
    const orders = await Order.find({
      userId: new mongoose.Types.ObjectId(userId), // Chuyển đổi userId thành ObjectId
    });

    if (orders.length === 0) {
      return res.status(200).json({ message: 'Không tìm thấy đơn hàng của người dùng này' });
    }
    const complateStatus = 'complate';
    const stats = await Order.aggregate([
      {
        $match: {
          userId: new mongoose.Types.ObjectId(userId), // Chuyển đổi userId thành ObjectId
          status: complateStatus, 
        }
      },
      {
        $group: {
          _id: null, // Group all matched documents into one result
          completedOrdersCount: { $sum: 1 }, // Count the number of documents in the group
          totalCompletedAmount: { $sum: "$totalAmount" } // Sum the 'totalAmount' field
        }
      },
      {
         $project: {
           _id: 0, // Exclude the default _id field from the group stage
           completedOrdersCount: 1,
           totalCompletedAmount: 1
         }
      }
    ]);
    console.log('Thống kê đơn hàng:', stats); // Kiểm tra kết quả thống kê

    if (stats.length === 0) {
      return res.status(404).json({ message: 'Không tìm thấy đơn hàng đã hoàn thành của người dùng này' });
    }
    const result = {
      completedOrdersCount: stats[0].completedOrdersCount,
      totalCompletedAmount: stats[0].totalCompletedAmount,
    };
    console.log('Kết quả thống kê:', result); // Kiểm tra kết quả cuối cùng

    res.status(200).json(result);

  } catch (error) {
    console.error('Error fetching user order stats:', error);
    res.status(500).json({ message: 'Error fetching user order statistics', error: error.message });
  }
};


// Lấy chi tiết đơn hàng
exports.getOrderDetails = async (req, res) => {
  try {
    const { orderId } = req.params;
    const order = await Order.findById(orderId);

    if (!order) {
      return res.status(404).json({ message: 'Đơn hàng không tồn tại' });
    }

    res.status(200).json(order);
  } catch (error) {
    console.error('Lỗi khi lấy chi tiết đơn hàng:', error);
    res.status(500).json({ message: 'Lỗi khi lấy chi tiết đơn hàng', error: error.message });
  }
};

// Cập nhật trạng thái đơn hàng
exports.updateOrderStatus = async (req, res) => {
  try {
    const { orderId } = req.params;
    const { status } = req.body;

    // Kiểm tra trạng thái hợp lệ
    const validStatuses = ['Mới', 'Đã xác nhận', 'Đang chuẩn bị giao hàng', 'Đang giao hàng', 'Đã giao hàng', 'Hủy'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ message: 'Trạng thái không hợp lệ' });
    }

    const updatedOrder = await Order.findByIdAndUpdate(
      orderId,
      { status, updatedAt: Date.now() },
      { new: true }
    );

    if (!updatedOrder) {
      return res.status(404).json({ message: 'Đơn hàng không tồn tại' });
    }

    res.status(200).json({ message: 'Trạng thái đơn hàng đã được cập nhật', updatedOrder });
  } catch (error) {
    console.error('Lỗi khi cập nhật trạng thái đơn hàng:', error);
    res.status(500).json({ message: 'Lỗi khi cập nhật trạng thái đơn hàng', error: error.message });
  }
};


// Get all orders
exports.getOrders = async (req, res) => {
  try {
    const orders = await Order.find();
    res.status(200).json(orders);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching orders', error });
  }
};

// Get a single order by ID
exports.getOrderById = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }
    res.status(200).json(order);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching order', error });
  }
};

// Update an order by ID
exports.updateOrder = async (req, res) => {
  try {
    const order = await Order.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }
    res.status(200).json(order);
  } catch (error) {
    res.status(400).json({ message: 'Error updating order', error });
  }
};

// Delete an order by ID
exports.deleteOrder = async (req, res) => {
  try {
    const order = await Order.findByIdAndDelete(req.params.id);
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }
    res.status(200).json({ message: 'Order deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting order', error });
  }
};