const express = require('express')
const { authMiddleware } = require('../middlewares/auth.middleware')
const router = express.Router()
const followController = require('../controllers/follow.controller')

// [POST - /api/follow/:userId]
router.post('/:userId', authMiddleware, followController.toggleFollow)

// [GET - /api/follow/:userId/followers]
router.get('/:userId/followers', authMiddleware, followController.listFollowers)

// [GET - /api/follow/:userId/following]
router.get('/:userId/following', authMiddleware, followController.listFollowings)

module.exports = router