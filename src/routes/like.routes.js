const express = require('express')
const { authMiddleware } = require('../middlewares/auth.middleware')
const router = express.Router()
const likeController = require('../controllers/like.controller')

// [POST - /api/like/:postId]
router.post('/:postId', authMiddleware, likeController.toggleLike)

module.exports = router