const express = require('express')
const cookieParser = require('cookie-parser')
const app = express()

app.use(express.json())
app.use(express.urlencoded({ extended: true }))
app.use(express.text({ type: ['text/plain', 'application/xml'] }))
app.use(cookieParser())

// Routes import
const authRoutes = require('../src/routes/auth.route')
const postRoutes = require('./routes/post.routes')
const adminRoutes = require('./routes/admin.routes')
const commentRoutes = require('./routes/comment.routes')
const likeRoutes = require('./routes/like.routes')
const followRoutes = require('./routes/follow.routes')
const feedRoutes = require('./routes/feed.routes')

//Auth Routes
app.use('/api/auth', authRoutes)

//Post Routes
app.use('/api/posts', postRoutes)

//Admin Routes
app.use('/api/user', adminRoutes)

//Comments Routes
app.use('/api/comment', commentRoutes)

//Like Routes
app.use('/api/like', likeRoutes)

//Follow Routes
app.use('/api/follow', followRoutes)

//Feed Routes
app.use('/api', feedRoutes)

module.exports = app