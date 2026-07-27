const mongoose = require('mongoose')
const Post = require('../models/post.model')

async function feedUser(req, res) {
    try {
        const posts = await Post.find()

        if (!posts.length) return res.status(401).json({ message: 'Posts not found!' })

        return res.status(200).json({
            message: 'All posts fetched successfully!',
            posts
        })

    } catch (error) {
        return res.status(500).json({
            message: 'Error fetching posts!',
            error
        })
    }
}

module.exports = { feedUser }