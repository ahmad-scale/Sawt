const mongoose = require('mongoose')
const User = require('../models/user.model')
const Follow = require('../models/follow.model')

async function toggleFollow(req, res) {
    const user = req.user
    const followerId = user?._id
    const followedId = req.params?.userId

    if (!followerId || !mongoose.Types.ObjectId.isValid(String(followerId))) {
        return res.status(400).json({
            message: 'Valid follower ID is required!'
        })
    }

    if (!followedId) {
        return res.status(400).json({
            message: 'Valid user ID is required!'
        })
    }

    try {
        const followedUser = await User.findById(followedId)

        if (!followedUser) {
            return res.status(404).json({
                message: 'User not found!'
            })
        }

        const existingFollow = await Follow.findOne({ followingId: followedId, followerId })
        if (existingFollow) {
            await Follow.deleteOne({ _id: existingFollow._id })
            return res.status(200).json({
                message: 'Unfollowed successfully!'
            })
        }

        const newFollowing = await Follow.create({
            followingId: followedId,
            followerId
        })

        if (!newFollowing) {
            return res.status(400).json({
                message: 'Failed to follow the user!'
            })
        }

        return res.status(200).json({
            message: 'Successfully followed the user!',
            newFollowing
        })
    } catch (error) {
        return res.status(500).json({
            message: 'Something went wrong while following the user',
            error: error.message
        })
    }
}

async function listFollowers(req, res) {
    const userId = req.params?.userId

    if (!userId) {
        return res.status(402).json({
            message: 'User ID not provided!'
        })
    }

    try {

        const followingsList = await Follow.find({ followingId: userId }).select('followerId')

        if (!followingsList || !followingsList.length) {
            return res.status(402).json({
                message: 'The list is empty'
            })
        }

        return res.status(200).json({
            message: 'Followers List fetched successfully!',
            followingsList
        })

    } catch (error) {
        return res.status(500).json({
            message: 'Error occurred while fetching user details!',
            error: error.message
        })
    }
}

async function listFollowings(req, res) {
    const userId = req.params?.userId

    if (!userId) {
        return res.status(402).json({
            message: 'User ID not provided!'
        })
    }

    try {

        const followingsList = await Follow.find({ followerId: userId }).select('followingId')

        if (!followingsList || !followingsList.length) {
            return res.status(402).json({
                message: 'The list is empty'
            })
        }

        return res.status(200).json({
            message: 'Followings List fetched successfully!',
            followingsList
        })

    } catch (error) {
        return res.status(500).json({
            message: 'Error occurred while fetching user details!',
            error: error.message
        })
    }
}


module.exports = { toggleFollow, listFollowers, listFollowings }