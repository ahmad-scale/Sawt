const mongoose = require('mongoose')

async function connectDB() {
    if (!process.env.MONGO_URI) {
        console.error('MONGO_URI is not defined')
        process.exit(1)
    }

    try {
        await mongoose.connect(process.env.MONGO_URI, {
            serverSelectionTimeoutMS: 5000
        })
        console.log('Server Connected to DB')
    } catch (err) {
        console.error('Error connecting to DB:', err.message)
        process.exit(1)
    }
}

module.exports = connectDB