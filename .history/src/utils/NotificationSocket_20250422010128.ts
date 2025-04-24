import { io, Socket } from 'socket.io-client';

interface NotificationPayload {
  type: 'order' | 'post' | 'review' | 'comment';
  data: any; // Có thể tạo thêm interface cụ thể cho từng loại nếu cần
}
export interface OrderData {
  orderId: string;      
  customerName: string; 
  type: 'order';        
  totalAmount: number;  
  itemCount: number;    
}
type NotificationCallback = (payload: NotificationPayload) => void;

const SOCKET_URL = 'http://10.0.2.2:3001'; // Thay bằng địa chỉ thực tế

// Khởi tạo kết nối socket
const socket: Socket = io(SOCKET_URL, {
  transports: ['websocket'],
  autoConnect: true,
  reconnection: true,
 
});

// Thiết lập lắng nghe sự kiện từ server
export const setupSocketListeners = (onReceiveNotification: NotificationCallback): void => {
  socket.on('connect', () => {
    if (socket.connected) {
      console.log('Socket connected');
    }else {
      console.error('Socket not connected');
    }
    
  });

  socket.on('notify', (payload: NotificationPayload) => {
    console.log('Notification received:', payload);
    onReceiveNotification(payload);
  });
};

// Emit sự kiện tạo đơn hàng mới
export const emitNewOrder = (orderData: any): void => {
  if (!orderData) return;
  if(socket.connected) {
    socket.emit('new-order', orderData);
  console.log('New order emitted:', orderData);
  }
  else {
    console.error('Socket not connected');
  }
};

// Emit sự kiện bài viết mới
export const emitNewPost = (postData: any): void => {
  socket.emit('new-post', postData);
};

// Emit sự kiện đánh giá mới
export const emitNewReview = (reviewData: any): void => {
  socket.emit('new-review', reviewData);
};

// Emit sự kiện bình luận mới
export const emitNewComment = (commentData: any): void => {
  socket.emit('new-comment', commentData);
};

export default socket;
