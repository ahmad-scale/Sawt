const mongoose = require('mongoose')
const User = require('../models/user.model')
const Post = require('../models/post.model')
const Like = require('../models/like.model')

async function toggleLike(req, res) {
    const user = req.user
    const userId = user?._id

    if (!userId || !mongoose.Types.ObjectId.isValid(String(userId))) {
        return res.status(400).json({
            message: 'Valid user ID is required!'
        })
    }

    const postId = req.params?.postId

    if (!postId || !mongoose.Types.ObjectId.isValid(String(postId))) {
        return res.status(400).json({
            message: 'Valid post ID is required!'
        })
    }

    try {
        const post = await Post.findById(postId)

        if (!post) {
            return res.status(404).json({
                message: 'Post not found!'
            })
        }

        const existingLike = await Like.findOne({ postId, userId })
        if (existingLike) {
            await Like.deleteOne({ _id: existingLike._id })
            return res.status(200).json({
                message: 'Like removed successfully!'
            })
        }

        const newLike = await Like.create({
            postId,
            userId
        })

        if (!newLike) {
            return res.status(400).json({
                message: 'Failed to like the post!'
            })
        }

        return res.status(200).json({
            message: 'Successfully liked the post!',
            newLike
        })
    } catch (error) {
        return res.status(500).json({
            message: 'Something went wrong while liking the post',
            error: error.message
        })
    }
}

module.exports = { toggleLike }