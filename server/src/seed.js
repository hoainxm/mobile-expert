const mongoose = require("mongoose");
const dotenv = require("dotenv");
const connectDB = require("./configs/connectDB"); // Import kết nối DB
const Category = require("./models/Category");
const Product = require("./models/Product");

dotenv.config(); // Load biến môi trường từ .env

const seedDatabase = async () => {
    try {
        // Kết nối MongoDB
        await connectDB();

        // Xóa dữ liệu cũ (nếu có)
        await Category.deleteMany({});
        await Product.deleteMany({});

        // Tạo danh mục mẫu
        const categories = await Category.insertMany([
            { name: "Điện thoại", description: "Các loại điện thoại thông minh" },
            { name: "Laptop", description: "Máy tính xách tay các loại" },
            { name: "Phụ kiện", description: "Các loại phụ kiện điện tử" }
        ]);

        console.log("Categories created:", categories);

        // Tạo sản phẩm mẫu
        const products = await Product.insertMany([
            {
                name: "iPhone 15 Pro Max",
                image: "iphone15.jpg",
                mota: "Điện thoại cao cấp từ Apple",
                price: 29990000,
                sold: 100,
                category: categories[0]._id // Liên kết với danh mục "Điện thoại"
            },
            {
                name: "MacBook Air M2",
                image: "macbookair.jpg",
                mota: "Laptop siêu nhẹ của Apple",
                price: 25990000,
                sold: 50,
                category: categories[1]._id // Liên kết với danh mục "Laptop"
            },
            {
                name: "Tai nghe AirPods Pro",
                image: "airpods.jpg",
                mota: "Tai nghe không dây chất lượng cao",
                price: 5490000,
                sold: 80,
                category: categories[2]._id // Liên kết với danh mục "Phụ kiện"
            }
        ]);

        console.log("Products created:", products);
        mongoose.connection.close();
    } catch (error) {
        console.error("Error seeding database:", error);
        mongoose.connection.close();
    }
};

// Chạy hàm tạo dữ liệu
seedDatabase();
