const express = require('express');
const ProductRouter = express.Router();
const {
  getTopSellingProducts,
  getAllCategories,
  searchAndFilterProducts,
  getProductDetails,
  getSimilarProducts,
  getproductbycategoryid,
  getAndFilter,
  getAllProducts,
} = require('../controllers/productController');

ProductRouter.get('/top-selling', getTopSellingProducts);
ProductRouter.get('/categories', getAllCategories);
ProductRouter.get('/getvafiller', getAndFilter);
ProductRouter.get('/allproducts', getAllProducts); // Moved before dynamic routes
ProductRouter.get('/similar/:productId', getSimilarProducts);
ProductRouter.get(
  '/getproductbycategoryid/:categoryId',
  getproductbycategoryid,
);
ProductRouter.get('/:productId', getProductDetails); // Moved after /allproducts

module.exports = ProductRouter;
