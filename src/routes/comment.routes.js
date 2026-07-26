const express = require('express')
const { authMiddleware } = require('../middlewares/auth.middleware')
const router = express.Router()
const commentController = require('../controllers/comment.controller')

// [POST - /api/comment/:postId]
router.post('/:postId', authMiddleware, commentController.commentOnPost)

// [GET - /api/comment/:commentId]
router.get('/:commentId', authMiddleware, commentController.readComments)

// [PATCH - /api/comment/:commentId]
router.patch('/:commentId', authMiddleware, commentController.updateComment)

// [DELETE - /api/comment/:commentId]
router.delete('/:commentId', authMiddleware, commentController.deleteComment)

module.exports = router