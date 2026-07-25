const express = require('express')
const cookieParser = require('cookie-parser')
const app = express()

app.use(express.json())
app.use(cookieParser())

// Routes import
const authRoutes = require('../src/routes/auth.route')
const postRoutes = require('./routes/post.routes')

//Auth Routes
app.use('/api/auth', authRoutes)

//Post Routes
app.use('/api/posts', postRoutes)

module.exports = app