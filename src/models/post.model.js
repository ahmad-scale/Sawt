const mongoose = require('mongoose')

const postModel = new mongoose.Schema(
    {
        authorId : {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: [true, 'Author ID is required!']
        },
        content: {
            type: String,
            required: [true, 'Post Content Cannot be empty']
        },
        imageUrl: {
            type: String,
            required: false
        }
    }
)

const Post = mongoose.model('Post', postModel)

module.exports = Post