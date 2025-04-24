const Comment = require('../models/Comment');

exports.getCommentsByProduct = async (req, res) => {
	try {
		const { productId } = req.params;
		console.log('Product ID:', productId); // Debugging line

		const comments = await Comment.find({ productId }).sort({ createdAt: -1 });
		res.json(comments);
	} catch (error) {
		res.status(500).json({ error: 'Internal Server Error' });
	}
};

exports.addComment = async (req, res) => {
	try {
		const { productId } = req.params;
		const { user_email, content } = req.body;
		if (!user_email || !content) {
			return res.status(400).json({ error: 'Email và nội dung bình luận là bắt buộc' });
		}
		const newComment = new Comment({
			productId,
			userName: user_email, // Lưu email làm tên người dùng
			content,
		});

		await newComment.save();
		res.status(201).json(newComment);
	} catch (error) {
		res.status(500).json({ error: 'Internal Server Error' });
	}
};