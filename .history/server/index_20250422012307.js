/** @format */
const express = require('express');
const cors = require('cors');
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
const http = require('http'); 
const socketIo = require('socket.io'); 
const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: '*', // hoặc domain app của bạn
    methods: ['GET', 'POST'],
  }
});
require('dotenv').config();

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
connectDB();
io.on('connection', (socket) => {
	console.log('Client connected: ', socket.id);
  
	// Gửi thông báo khi có đơn hàng mới
	socket.on('new-order', (data) => {
	  io.emit('notify', { type: 'order', data });
	});
  
	// Gửi thông báo khi có bài viết mới
	socket.on('new-post', (data) => {
	  io.emit('notify', { type: 'post', data });
	});
  
  });
  
  
app.use(errorMiddleHandle);

app.listen(PORT, (err) => {
	if (err) {
		console.log(err);
		return;
	}

	console.log(`Server starting at http://localhost:${PORT}`);
});
