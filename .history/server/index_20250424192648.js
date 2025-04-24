/** @format */
const express = require('express');
const cors = require('cors');
const http = require('http');
const socketIo = require('socket.io');
const authRouter = require('./src/routers/authRouter');
const connectDB = require('./src/configs/connectDb');
const errorMiddleHandle = require('./src/middlewares/errorMiddleware');
const userRouter = require('./src/routers/userRouter');
const verifyToken = require('./src/middlewares/verifyMiddleware');
const eventRouter = require('./src/routers/eventRouter');
const ProductRouter = require('./src/routers/productRoutes');
const OrderRouter = require('./src/routers/orderRouter');
const commentRoutes = require('./src/routers/commentRouter');
const reviewRouter = require('./src/routers/reviewRoutes');
const disCountRouter = require('./src/routers/disCountRouter');

require('dotenv').config();

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST'],
    credentials: true
  },
  pingTimeout: 60000,
  pingInterval: 25000
});

app.use(cors());
app.use(express.json());

const PORT = 3001;

app.use('/auth', authRouter);
app.use('/users', verifyToken, userRouter);
app.use('/events', verifyToken, eventRouter);
app.use("/products", ProductRouter);
app.use("/order", OrderRouter);
app.use('/comments', commentRoutes);
app.use('/reviews', reviewRouter);
app.use('/discount', disCountRouter);

// Socket.IO connection handling
io.on('connection', (socket) => {
  console.log('Client connected:', socket.id);

  // Handle client disconnection
  socket.on('disconnect', (reason) => {
    console.log('Client disconnected:', socket.id, 'Reason:', reason);
  });

  // Handle connection errors
  socket.on('error', (error) => {
    console.error('Socket error:', error);
  });

  // Handle new order notifications
  socket.on('new-order', (data) => {
    try {
      console.log('New order received:', data);
      io.emit('notify', { type: 'order', data });
    } catch (error) {
      console.error('Error handling new order:', error);
      socket.emit('error', { message: 'Failed to process order notification' });
    }
  });

  // Handle new post notifications
  socket.on('new-post', (data) => {
    try {
      console.log('New post received:', data);
      io.emit('notify', { type: 'post', data });
    } catch (error) {
      console.error('Error handling new post:', error);
      socket.emit('error', { message: 'Failed to process post notification' });
    }
  });

  // Handle new review notifications
  socket.on('new-review', (data) => {
    try {
      console.log('New review received:', data);
      io.emit('notify', { type: 'review', data });
    } catch (error) {
      console.error('Error handling new review:', error);
      socket.emit('error', { message: 'Failed to process review notification' });
    }
  });

  // Handle new comment notifications
  socket.on('new-comment', (data) => {
    try {
      console.log('New comment received:', data);
      io.emit('notify', { type: 'comment', data });
    } catch (error) {
      console.error('Error handling new comment:', error);
      socket.emit('error', { message: 'Failed to process comment notification' });
    }
  });
});

connectDB();

// Start server with socket.io
server.listen(PORT, (err) => {
  if (err) {
    console.error('Error starting server:', err);
    return;
  }
  console.log(`Server running with Socket.IO at http://localhost:${PORT}`);
});
