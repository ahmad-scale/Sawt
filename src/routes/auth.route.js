const express = require('express')
const router = express.Router()
const authController = require('../controllers/auth.controller')
const upload  = require('../middlewares/multer.middleware')
const authMiddleware = require('../middlewares/auth.middleware')

// [POST - /api/auth/register {New User Registration}]
router.post('/register',
    upload.fields([
        {
            name: 'avatar',
            maxCount: 1
        },
        {
            name: 'coverImage',
            maxCount: 1
        }
    ]),
     authController.registerUser)

// [POST - /api/auth/register {Login User}]
router.post('/login', authController.loginUser)

//[POST - /api/auth/logout {Logout user}]
router.post('/logout', authController.logoutUser)

//[POST - /api/auth/me {Get logged-in user details}]
router.get('/me', authMiddleware.authMiddleware, authController.getMyDetails)

//[POST - /api/auth/delete {Get the Logged-in User ID delete}]
router.delete('/delete', authMiddleware.authMiddleware, authController.deleteMyId)

//[PATCH - /api/auth/ {Edit the logged-in user}]
router.patch('', authMiddleware.authMiddleware, upload.single('avatar'), authController.updateUser)

module.exports = router