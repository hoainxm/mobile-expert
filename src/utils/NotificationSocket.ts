import {io, Socket} from 'socket.io-client';

interface NotificationPayload {
  type: 'order' | 'post' | 'review' | 'comment';
  data: OrderData | PostData | ReviewData | CommentData;
}

export interface OrderData {
  customerName: string;
  type: 'order';
  totalAmount: number;
  quantity?: number;
}

export interface PostData {
  postId: string;
  authorName: string;
  type: 'post';
  title: string;
}

export interface ReviewData {
  reviewId: string;
  authorName: string;
  type: 'review';
  rating: number;
}

export interface CommentData {
  commentId: string;
  authorName: string;
  type: 'comment';
  content: string;
}

type NotificationCallback = (payload: NotificationPayload) => void;

const SOCKET_URL = 'http://10.0.2.2:3001';

class SocketManager {
  private socket: Socket;
  private reconnectAttempts: number = 0;
  private maxReconnectAttempts: number = 5;
  private reconnectInterval: number = 5000;
  private notificationCallback?: NotificationCallback;

  constructor() {
    this.socket = this.initializeSocket();
  }

  private initializeSocket(): Socket {
    const socket = io(SOCKET_URL, {
      transports: ['websocket'],
      autoConnect: true,
      reconnection: true,
      reconnectionAttempts: this.maxReconnectAttempts,
      reconnectionDelay: this.reconnectInterval,
      timeout: 10000,
    });

    this.setupSocketListeners(socket);
    return socket;
  }

  private setupSocketListeners(socket: Socket): void {
    socket.on('connect', () => {
      console.log('Socket connected successfully');
      this.reconnectAttempts = 0;
    });

    socket.on('connect_error', error => {
      console.error('Socket connection error:', error);
      this.handleReconnect();
    });

    socket.on('disconnect', reason => {
      console.log('Socket disconnected:', reason);
      if (reason === 'io server disconnect') {
        this.handleReconnect();
      }
    });

    socket.on('error', error => {
      console.error('Socket error:', error);
    });
  }

  private handleReconnect(): void {
    if (this.reconnectAttempts < this.maxReconnectAttempts) {
      this.reconnectAttempts++;
      console.log(
        `Attempting to reconnect... (${this.reconnectAttempts}/${this.maxReconnectAttempts})`,
      );
      setTimeout(() => {
        this.socket.connect();
      }, this.reconnectInterval);
    } else {
      console.error('Max reconnection attempts reached');
    }
  }

  public setupNotificationListener(callback: NotificationCallback): void {
    this.notificationCallback = callback;
    this.socket.on('notify', (payload: NotificationPayload) => {
      console.log('Notification received:', payload);
      if (this.notificationCallback) {
        this.notificationCallback(payload);
      }
    });
  }

  public emitNewOrder(orderData: OrderData): void {
    if (!orderData) return;

    if (this.socket.connected) {
      this.socket.emit('new-order', orderData);
      console.log('New order emitted:', orderData);
    } else {
      console.error('Socket not connected, order not sent');
    }
  }

  public emitNewPost(postData: PostData): void {
    if (!postData) return;

    if (this.socket.connected) {
      this.socket.emit('new-post', postData);
      console.log('New post emitted:', postData);
    } else {
      console.error('Socket not connected, post not sent');
    }
  }

  public emitNewReview(reviewData: ReviewData): void {
    if (!reviewData) return;

    if (this.socket.connected) {
      this.socket.emit('new-review', reviewData);
      console.log('New review emitted:', reviewData);
    } else {
      console.error('Socket not connected, review not sent');
    }
  }

  public emitNewComment(commentData: CommentData): void {
    if (!commentData) return;

    if (this.socket.connected) {
      this.socket.emit('new-comment', commentData);
      console.log('New comment emitted:', commentData);
    } else {
      console.error('Socket not connected, comment not sent');
    }
  }

  public disconnect(): void {
    if (this.socket) {
      this.socket.disconnect();
    }
  }

  public get isConnected(): boolean {
    return this.socket?.connected ?? false;
  }
}

const socketManager = new SocketManager();
export default socketManager;
