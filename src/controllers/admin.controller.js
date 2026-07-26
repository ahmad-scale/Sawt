const mongoose = require('mongoose')
const User = require('../models/user.model')
const jwt = require('jsonwebtoken')
const uploadOnCloudinary = require('../utils/cloudinary.js')
const fs = require('fs').promises

async function editAnyUser(req, res) {
    const userId = req.params?.userId || req.params?.id || req.body?.userId || req.query?.userId
    const { username, password, bio, avatar } = req.body || {}

    if (!userId || !mongoose.Types.ObjectId.isValid(String(userId))) {
        return res.status(400).json({ message: 'Valid user ID is required' })
    }

    const updates = {}
    if (username !== undefined) updates.username = String(username).trim()
    if (password !== undefined) updates.password = password
    if (bio !== undefined) updates.bio = bio

    let avatarUrl = avatar
    if (req.file) {
        try {
            const uploadedAvatar = await uploadOnCloudinary(req.file.path)
            try {
                await fs.unlink(req.file.path)
            } catch (cleanupError) {
                // ignore cleanup errors
            }

            if (!uploadedAvatar?.url) {
                return res.status(502).json({ message: 'Avatar upload failed' })
            }

            avatarUrl = uploadedAvatar.url
        } catch (error) {
            console.error('Avatar upload failed:', error)
            return res.status(502).json({ message: 'Avatar upload failed' })
        }
    }

    if (avatarUrl !== undefined) updates.avatar = avatarUrl

    if (Object.keys(updates).length === 0) {
        return res.status(400).json({ message: 'No update fields provided' })
    }

    try {
        const existingUser = await User.findById(userId).select('+password')

        if (!existingUser) {
            return res.status(404).json({ message: 'User not found' })
        }

        Object.assign(existingUser, updates)
        const updatedUser = await existingUser.save()
        const userResponse = updatedUser.toObject()
        delete userResponse.password

        return res.status(200).json({
            message: 'User updated successfully',
            user: userResponse
        })
    } catch (error) {
        console.error('Update user failed:', error)

        if (error?.name === 'CastError') {
            return res.status(400).json({ message: 'Invalid user ID format' })
        }

        return res.status(500).json({
            message: 'Error occurred while updating user'
        })
    }
}

async function deleteAnyUser(req, res) {

    const userId = req.params?.userId || req.params?.id
    if (!userId) {
        return res.status(400).json({ message: 'User ID not provided' })
    }

    try {
        const deletedUser = await User.findByIdAndDelete(userId)

        if (!deletedUser) {
            return res.status(404).json({ message: 'User not found' })
        }

        return res.status(200).json({
            message: 'User deletion successful',
            user: deletedUser
        })
    } catch (error) {
        console.error('Delete user failed:', error)
        return res.status(500).json({ message: 'Some error occurred while deleting user' })
    }
}

module.exports = { editAnyUser, deleteAnyUser }