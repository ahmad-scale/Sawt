const mongoose = require('mongoose')
const User = require('../models/user.model')
const Post = require('../models/post.model')
const Comment = require('../models/comment.modell')

async function commentOnPost(req, res) {
    const user = req.user
    const userId = user?._id

    if (!user || !mongoose.Types.ObjectId.isValid(String(userId))) {
        return res.status(401).json({
            message: 'User ID not provided!'
        })
    }

    const postId = req.params?.postId || req.params?.id || req.body?.postId || req.query?.postId
    if (!postId || !mongoose.Types.ObjectId.isValid(String(postId))) {
        return res.status(400).json({
            message: 'Please provide a valid postId'
        })
    }

    const body = req.body || {}
    const content = body.content ?? body.newContent ?? body.updatedContent ?? body.new_comment

    if (!content || String(content).trim().length === 0) {
        return res.status(400).json({
            message: 'Comment content cannot be empty!'
        })
    }

    try {
        const newComment = await Comment.create({
            postId,
            authorId: userId,
            content: String(content)
        })

        if (!newComment) {
            return res.status(500).json({
                message: 'Cannot find the new Comment!'
            })
        }

        return res.status(200).json({
            message: `New Comment Added by ${user.username}`,
            newComment
        })
    } catch (error) {
        if (error?.name === 'CastError') {
            return res.status(400).json({
                message: 'Invalid postId format',
                error: error.message
            })
        }

        return res.status(500).json({
            message: 'Something went wrong while creating the comment!',
            error: error.message
        })
    }
}

async function readComments(req, res) {
    const commentId = req.params?.commentId

    try {

        if (commentId === 'all') {
            const allComments = await Comment.find()

            if (!allComments || !allComments.length) {
                return res.status(400).json({
                    message: 'Failed to fetch all comments!'
                })
            }

            return res.status(200).json({
                message: 'All comments fetched successfully',
                allComments
            })
        }

        const selectedComment = await Comment.findById(commentId)

        if (!selectedComment) {
            return res.status(400).json({
                message: 'Failed to fetch the comment!'
            })
        }

        return res.status(200).json({
            message: 'Comment fetched successfully',
            selectedComment
        })

    } catch (error) {
        return res.status(500).json({
            message: 'Something went wrong while fetching comment!',
            error: error.message
        })
    }
}

async function updateComment(req, res) {
    const user = req.user
    const userId = user?._id

    if (!user || !mongoose.Types.ObjectId.isValid(String(userId))) {
        return res.status(400).json({
            message: 'UserID is required!'
        })
    }

    const commentId = req.params?.commentId

    if (!commentId || !mongoose.Types.ObjectId.isValid(String(commentId))) {
        return res.status(400).json({
            message: 'Valid CommentID is required!'
        })
    }

    const body = req.body || {}
    const content = body.content ?? body.newContent ?? body.updatedContent ?? body.new_comment

    if (!content || String(content).trim().length === 0) {
        return res.status(400).json({
            message: 'Comment content cannot be empty!'
        })
    }

    try {
        const updatedComment = await Comment.findOneAndUpdate(
            {
                _id: commentId,
                authorId: userId
            },
            {
                content: String(content)
            },
            {
                new: true,
                runValidators: true
            }
        )

        if (!updatedComment) {
            return res.status(400).json({
                message: 'Failed to update the comment!'
            })
        }

        return res.status(200).json({
            message: 'Comment Updated Successfully!',
            updatedComment
        })
    } catch (error) {
        if (error?.name === 'CastError') {
            return res.status(400).json({
                message: 'Invalid comment ID format',
                error: error.message
            })
        }

        return res.status(500).json({
            message: 'Something went wrong while updating the comment',
            error: error.message
        })
    }
}

async function deleteComment(req, res){

    const user = req.user
    const userId = user?._id

    if(!userId || !mongoose.Types.ObjectId.isValid(String(userId))){
        return res.status(400).json({
            message: 'Valid UserID is required!'
        })
    }

    const commentId = req.params?.commentId || req.params?.id

    if(!commentId || !mongoose.Types.ObjectId.isValid(String(commentId))){
        return res.status(400).json({
            message: 'Valid Comment ID is required!'
        })
    }

    try {

        const deletedComment = await Comment.findOneAndDelete({
            authorId: userId,
            _id: commentId
        })
        
        if(!deletedComment) {
            return res.status(400).json({
                message: 'Failed to delete the comment!'
            })
        }

        return res.status(200).json({
            message: 'Comment deleted successfully!',
            deletedComment
        })

    } catch (error) {
        return res.status(500).json({
            message: 'Something went wrong while deleting the comment',
            error: error.message
        })
    }
}

module.exports = { commentOnPost, readComments, updateComment, deleteComment }