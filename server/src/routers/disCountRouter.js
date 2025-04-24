const express = require('express');
const verifyToken = require('../middlewares/verifyMiddleware');
const { getallDiscountCode, addDiscountCode, getdiscountbyid, getuserDiscountCode, applyDiscountCode } = require('../controllers/discountController');
const disCountRouter = express.Router();

disCountRouter.get('/', verifyToken, getallDiscountCode),
    disCountRouter.post('/', verifyToken, addDiscountCode);
disCountRouter.get('/userid/:id', verifyToken, getuserDiscountCode);
disCountRouter.get('/:id', verifyToken, getdiscountbyid);
disCountRouter.post('/apply', verifyToken, applyDiscountCode);
module.exports = disCountRouter;