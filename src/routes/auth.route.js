const express = require('express')
const router = express.Router()
const authController = require('../controllers/auth.controller')

// [POST - /api/auth/register {New User Registration}]
router.post('/register', authController.registerUser)

module.exports = router