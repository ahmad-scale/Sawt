const mongoose = require('mongoose')

const followModel = new mongoose.Schema(
    {
        followerId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true
        },
        followingId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true
        }
    }
)

const Follow = mongoose.model('Follow', followModel)

module.exports = Follow