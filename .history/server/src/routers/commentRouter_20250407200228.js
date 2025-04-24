const express = require('express');
const { getCommentsByProduct, addComment } = require('../controllers/commentController');
const router = express.Router();

router.get('/:productId', getCommentsByProduct);
router.post('/:productId', addComment);

module.exports = router;