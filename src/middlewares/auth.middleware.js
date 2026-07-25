const User = require('../models/user.model')
const jwt = require('jsonwebtoken')

async function authMiddleware(req, res, next) {
    const token = req.cookies.token || req.headers.authorization?.split(' ')[1]

    if (!token) {
        return res.status(401).json({
            message: 'Unauthorized access, Invalid Token'
        })
    }

    try {

        const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY)

        const user = await User.findById(decoded.userId)

        if (!user) {
            return res.status(401).json({
                message: 'Unauthorized access, Invalid Token'
            })
        }

        req.user = user

        return next()

    } catch (error) {
        return res.status(401).json({
            message: 'Unauthorized access, Invalid Token'
        })
    }
}

async function adminMiddleware(req, res, next) {
    const token = req.cookies.token || req.headers.authorization?.split(' ')[1]

    if (!token) {
        return res.status(401).json({
            message: 'Unauthorized access, Invalid Token'
        })
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY)
        const user = await User.findById(decoded.userId).select('+role')

        if (!user || user.role !== 'Admin') {
            return res.status(403).json({
                message: 'Forbidden: Admin access required'
            })
        }

        req.user = user
        return next()
    } catch (error) {
        return res.status(401).json({
            message: 'Unauthorized access, Invalid Token'
        })
    }
}

module.exports = { authMiddleware, adminMiddleware }