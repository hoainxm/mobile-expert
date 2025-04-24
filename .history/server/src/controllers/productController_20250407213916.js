const Category = require("../models/Category");
const Product = require("../models/Product");

exports.getTopSellingProducts = async (req, res) => {
    try {
        const products = await Product.find().sort({ sold: -1 }).limit(10);
        res.json(products);
    } catch (error) {
        res.status(500).json({ error: "Internal Server Error" });
    }
};
exports.getSimilarProducts = async (req, res) => {
    try {
        const { productId } = req.params;

        // Lấy thông tin sản phẩm hiện tại
        const currentProduct = await Product.findById(productId);
        if (!currentProduct) {
            return res.status(404).json({ error: 'Sản phẩm không tồn tại' });
        }

        // Tìm các sản phẩm tương tự dựa trên categoryId (hoặc tiêu chí khác)
        const similarProducts = await Product.find({
            category: currentProduct.category, // Lọc theo danh mục
            _id: { $ne: productId }, // Loại trừ sản phẩm hiện tại
        }).limit(10); // Giới hạn số lượng sản phẩm trả về

        res.json(similarProducts);
    } catch (error) {
        console.error('Lỗi khi lấy sản phẩm tương tự:', error);
        res.status(500).json({ error: 'Lỗi máy chủ' });
    }
};
exports.getAllCategories = async (req, res) => {
    try {
        const categories = await Category.find();
        if (categories.length === 0) {
            return res.status(404).json({ message: "No categories found" });
        }
        res.json(categories);
    } catch (error) {
        res.status(500).json({ error: error.message || "Internal Server Error" });
    }
};

exports.searchAndFilterProducts = async (req, res) => {
    try {
        const { keyword, minPrice, maxPrice } = req.query;
        console.log(req.query)
        const filterConditions = {};

        if (keyword) {
            filterConditions.name = { $regex: keyword, $options: "i" };
        }
        if (minPrice) {
            filterConditions.price = { ...filterConditions.price, $gte: Number(minPrice) };
        }
        if (maxPrice) {
            filterConditions.price = { ...filterConditions.price, $lte: Number(maxPrice) }; // Giá nhỏ hơn hoặc bằng
        }

        const products = await Product.find(filterConditions).populate("category");
        res.json(products);
    } catch (error) {
        res.status(500).json({ error: "Internal Server Error" });
    }
};
exports.getProductDetails = async (req, res) => {
    try {
        const { productId } = req.params;
        console.log(productId)
        const product = await Product.findById(productId).populate("category");

        if (!product) {
            return res.status(404).json({ message: "Sản phẩm không tồn tại" });
        }

        res.json(product);
    } catch (error) {
        res.status(500).json({ error: "Internal Server Error" });
    }
};
