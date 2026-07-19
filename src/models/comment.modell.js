const mongoose = require('mongoose')

const commentModel = new mongoose.Schema(
    {
        postId:{
            type:  mongoose.Schema.Types.ObjectId,
            ref: 'Post',
            required: [true, 'Post ID is required for comment']
        },
        authorId :{
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: [true, 'User ID is required for comment']
        },
        content: {
            type: String,
            required: [true, 'Content is required for a comment']
        }
    },
)

const Comment = mongoose.model('Comment', commentModel)

module.exports = Comment