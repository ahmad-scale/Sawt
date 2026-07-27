const express = require('express')
const { authMiddleware } = require('../middlewares/auth.middleware')
const router = express.Router()
const feedController = require('../controllers/feed.controller')

// [GET - /api/feed]
router.get('/feed', authMiddleware, feedController.feedUser)

module.exports = router