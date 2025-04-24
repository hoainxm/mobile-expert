const express = require('express');
const verifyToken = require('../middlewares/verifyMiddleware');
const { getallDiscountCode, addDiscountCode } = require('../controllers/discountController');
const disCountRouter = express.Router();

disCountRouter.get('/', verifyToken, getallDiscountCode),
    disCountRouter.post('/', verifyToken, addDiscountCode);

module.exports = disCountRouter;