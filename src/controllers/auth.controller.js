const User = require('../models/user.model')
const jwt = require('jsonwebtoken')
const uploadOnCloudinary = require('../utils/cloudinary.js')
const fs = require('fs').promises

const COOKIE_OPTIONS = {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
}

async function registerUser(req, res) {
    try {
        const { username, email, password, bio } = req.body

        if ([username, email, password].some((field) => !field || !String(field).trim())) {
            return res.status(400).json({ message: 'username, email and password are required' })
        }

        const normalizedEmail = String(email).trim().toLowerCase()
        const normalizedUsername = String(username).trim().toLowerCase()

        const ifUserExists = await User.findOne({
            $or: [{ username: normalizedUsername }, { email: normalizedEmail }]
        })

        if (ifUserExists) {
            return res.status(409).json({ message: 'User already exists' })
        }

        const avatarLocalPath = req.files?.avatar?.[0]?.path

        if (!avatarLocalPath) {
            return res.status(400).json({ message: 'Avatar is required' })
        }

        const avatar = await uploadOnCloudinary(avatarLocalPath)

        // remove temp local file if present
        try {
            await fs.unlink(avatarLocalPath)
        } catch (e) {
            // ignore cleanup errors
        }

        if (!avatar?.url) {
            return res.status(502).json({ message: 'Avatar upload failed' })
        }

        const newUser = await User.create({
            email: normalizedEmail,
            username: normalizedUsername,
            password,
            bio,
            avatar: avatar.url
        })

        if (!newUser) {
            return res.status(500).json({ message: 'Failed to create user' })
        }

        if (!process.env.JWT_SECRET_KEY) {
            console.error('Missing JWT secret')
            return res.status(500).json({ message: 'Server misconfiguration' })
        }

        const token = jwt.sign({ userId: newUser._id }, process.env.JWT_SECRET_KEY, { expiresIn: '7d' })

        res.cookie('token', token, COOKIE_OPTIONS)

        return res.status(201).json({
            message: 'User registered successfully',
            user: {
                _id: newUser._id,
                email: newUser.email,
                username: newUser.username,
                avatar: newUser.avatar
            },
            token
        })
    } catch (error) {
        console.error('Register user failed:', error)
        return res.status(500).json({ message: 'Something went wrong while registering user' })
    }
}

async function loginUser(req, res) {
    try {
        const { email, password } = req.body
        if (!email || !password) {
            return res.status(400).json({ message: 'Email and password are required' })
        }

        const normalizedEmail = String(email).trim().toLowerCase()

        const user = await User.findOne({ email: normalizedEmail }).select('+password')

        if (!user) {
            return res.status(401).json({ message: 'Invalid credentials' })
        }

        const isValidPassword = await user.comparePassword(password)

        if (!isValidPassword) {
            return res.status(401).json({ message: 'Invalid credentials' })
        }

        if (!process.env.JWT_SECRET_KEY) {
            console.error('Missing JWT secret')
            return res.status(500).json({ message: 'Server misconfiguration' })
        }

        const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET_KEY, {
            expiresIn: '7d'
        })

        res.cookie('token', token, COOKIE_OPTIONS)

        return res.status(200).json({
            message: 'User logged in successfully',
            user: {
                userId: user._id,
                email: user.email,
                username: user.username
            },
            token
        })
    } catch (error) {
        console.error('Login user failed:', error)
        return res.status(500).json({ message: 'Something went wrong while logging in' })
    }
}

async function logoutUser(req, res) {
    const token = req.cookies.token || req.headers.authorization?.split(' ')[1]

    if(!token) {
        return res.status(400).json({
            message: 'User Logged Out Successfully'
        })
    }

    try {

        res.clearCookie('token', "")

        return res.status(200).json({
            message: 'User Logged Out Successfully'
        })
        
    } catch (error) {
        return res.status(402).json({
            message: 'Error occured', error
        })
    }
}

async function getMyDetails(req, res) {
    const userId = req.user && req.user._id

    if (!userId) {
        return res.status(400).json({ message: 'User id not provided' })
    }

    try {
        const user = await User.findById(userId).select('-password')

        if (!user) {
            return res.status(404).json({ message: 'User not found' })
        }

        return res.status(200).json({ user })
    } catch (error) {
        console.error('Fetch user details failed:', error)
        return res.status(500).json({ message: 'Some error occurred while fetching user data' })
    }
}

async function deleteMyId(req, res) {
    const userId = req.user && req.user._id
    if (!userId) {
        return res.status(400).json({ message: 'User id not provided' })
    }

    try {
        const deletedUser = await User.findByIdAndDelete(userId).select('-password')

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

async function updateUser(req, res) {
    const user = req.user
    const { username, password, bio, avatar } = req.body || {}

    if (!user || !user._id) {
        return res.status(400).json({ message: 'User id not provided' })
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
        const existingUser = await User.findById(user._id).select('+password')

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
        return res.status(500).json({
            message: 'Error occurred while updating user'
        })
    }
}

module.exports = { registerUser, loginUser, logoutUser, getMyDetails, deleteMyId, updateUser}