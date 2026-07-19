const express = require('express')
const cookieParser = require('cookie-parser')
const app = express()

app.use(express.json())
app.use(cookieParser())

// Routes import
const authRoutes = require('../src/routes/auth.route')

//auth routes
app.use('/api/auth', authRoutes)

module.exports = app