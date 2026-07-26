const express = require('express')
const router = express.Router()
const adminMiddleware = require('../middlewares/auth.middleware')
const adminController = require('../controllers/admin.controller')

// [PATCH - /api/user/:userId]
router.patch('/:userId', adminMiddleware.authMiddleware, adminController.editAnyUser)

// [DELETE - /api/user/:userId]
router.delete('/:userId', adminMiddleware.authMiddleware, adminController.deleteAnyUser)

module.exports = router