const Comment = require('../models/Comment');

exports.getCommentsByProduct = async (req, res) => {
	try {
		const { productId } = req.params;
		const comments = await Comment.find({ productId }).sort({ createdAt: -1 });
		res.json(comments);
	} catch (error) {
		res.status(500).json({ error: 'Internal Server Error' });
	}
};

exports.addComment = async (req, res) => {
	try {
		const { productId } = req.params;
		const { userName, content } = req.body;

		if (!userName || !content) {
			return res.status(400).json({ error: 'User name and content are required' });
		}

		const newComment = new Comment({ productId, userName, content });
		await newComment.save();

		res.status(201).json(newComment);
	} catch (error) {
		res.status(500).json({ error: 'Internal Server Error' });
	}
};