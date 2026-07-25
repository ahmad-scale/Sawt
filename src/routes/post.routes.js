const express = require('express')
const router = express.Router()
const authMiddleware = require('../middlewares/auth.middleware')
const postController = require('../controllers/post.controller')
const upload  = require('../middlewares/multer.middleware')

// [POST - /api/posts ]
router.post('',
    upload.fields([
        {
            name: 'image',
            maxCount: 1
        }
    ])
    ,authMiddleware.authMiddleware, postController.createPost)

//[GET - /api/posts/all]
router.get('/all', authMiddleware.authMiddleware, postController.viewAllPosts)

// [DELETE - /api/posts/all]
router.delete('/all', authMiddleware.adminMiddleware, postController.deleteAllPosts)

//[GET - /api/posts/:userId]
router.get('/:userId', authMiddleware.authMiddleware, postController.viewUsersPosts)

//[PATCH - /api/posts/:postId]
router.patch('/:postId', authMiddleware.authMiddleware, postController.editPost)

//[DELETE - /api/posts/:postId]
router.delete('/:postId', authMiddleware.authMiddleware, postController.deletePost)

//[GET - /api/posts]
router.get('', authMiddleware.authMiddleware, postController.viewMyPosts)

module.exports = router