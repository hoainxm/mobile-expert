const mongoose = require("mongoose");

const ProductSchema = new mongoose.Schema({
    name: String,
    image: String,
    mota: String,
    price: Number,
    sold: Number,
    category: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Category" // Kết nối với bảng Category
    }
});

module.exports = mongoose.model("Product", ProductSchema);