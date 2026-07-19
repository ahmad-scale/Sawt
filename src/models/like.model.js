const mongoose = require('mongoose')

const likeModel = new mongoose.Schema(
    {
        postId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Post',
            required: true
        },
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true
        }
    }
)

const Like = mongoose.model('Like', likeModel)

module.exports = Like