const mongoose = require('mongoose')
const User = require('../models/user.model')
const jwt = require('jsonwebtoken')

async function registerUser(req, res) {
    const {username, email, password, bio, avatarUrl} = req.body
    
    const ifUserExists = await User.findOne({
        $or: [{ username }, { email }]
    })
    

    if(ifUserExists) {
        return res.status(422).json({
            message: 'User already exists!',
            status: 'Failed!'
        })
    }

    const newUser = User.create({
        email,
        username,
        password,
        bio,
        avatarUrl
    })

    const token = jwt.sign({userId: newUser._id}, process.env.JWT_SECRET_KEY, { expiresIn: '7d'})
    
    res.cookie('token', token)

    res.status(201).json({
        newUser: {
            _id: newUser._id,
            email: newUser.email,
            username: newUser.email,
            avatarUrl: newUser.avatarUrl
        }
    })
}

module.exports = { registerUser }