const User = require('../models/user.model')
const Post = require('../models/post.model')
const uploadOnCloudinary = require('../utils/cloudinary.js')
const fs = require('fs').promises

async function createPost(req, res) {
    const userId = req.user?._id
    const { content } = req.body || {}
    const imageLocalPath = req.files?.image?.[0]?.path

    if (!userId) {
        return res.status(400).json({ message: 'User Id not provided!' })
    }

    // if (!imageLocalPath) {
    //     return res.status(400).json({ message: 'Image is required' })
    // }

    try {
        const author = await User.findById(userId)
        if (!author) {
            return res.status(404).json({ message: 'User not found!' })
        }

        let imageUrl = null

        if (imageLocalPath) {
            const image = await uploadOnCloudinary(imageLocalPath)

            try {
                await fs.unlink(imageLocalPath)
            } catch (e) {
                // ignore cleanup errors
            }

            if (!image?.url) {
                return res.status(502).json({ message: 'Image upload failed' })
            }

            imageUrl = image.url
        }

        const postData = {
            authorId: userId,
            content
        }

        if (imageUrl) {
            postData.image = imageUrl
        }

        const newPost = await Post.create(postData)

        if (!newPost) {
            return res.status(500).json({ message: 'Failed to create a post' })
        }

        return res.status(201).json({
            message: 'Post created successfully!',
            newPost
        })
    } catch (error) {
        return res.status(500).json({
            message: 'Error while creating a post!',
            error
        })
    }
}

async function viewUsersPosts(req, res){
    const {userId} = req.params

    if (!userId) {
        return res.status(400).json({ message: 'User id not provided' })
    }

    try {
        
        const posts = await Post.find({authorId: userId})

        if(!posts.length) {
            return res.status(401).json({
                message: 'Posts not found!'
            })
        }

        return res.status(200).json({
            message: 'Post fetched successfully',
            posts
        })

    } catch (error) {
        return res.status(500).json({
            message: 'Error occured while fetching posts'
        })
    }
}

async function viewMyPosts(req, res){
    const user = req.user
    const userId = user._id

    if(!user || !userId) return res.status(401).json({message: 'User ID not provided'})

    try {
        const posts = await Post.find({
            authorId: userId
        })

        if(!posts.length) {
            return res.status(401).json({
                message: 'Could not find posts!'
            })
        }

        return res.status(200).json({
            message: 'Posts fetched successfully!',
            posts
        })

    } catch (error) {
        return res.status(500).json({

            message: 'Error occured while fetching user posts',
            error
        })
    }
}

async function viewAllPosts(req, res) {
    try {
        const posts = await Post.find()

        if(!posts.length) return res.status(401).json({message: 'Posts not found!'})

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

async function editPost(req, res){
    const postId = req.params.postId
    const user = req.user
    const userId = user._id
    const { content } = req.body

    if(!user || !userId) return res.status(401).json({message: 'User ID not provided!'})
    
    try {
        
        const post = await Post.findOneAndUpdate(
            {
                _id: postId,
                authorId: userId
            },

            {
                content: content
            },

            {
                new: true,
                runValidators: true
            }
        )

        if(!post) return res.status(404).json({message: 'Post not found!'})

        return res.status(200).json({
            message: 'Post content updated successfully!',
            post
        })

    } catch (error) {
        return res.status(500).json({
            message: 'Error occured while updating the post!',
            error
        })
    }
}

async function deletePost(req, res){
    const postId = req.params.postId
    const user = req.user
    const userId = user._id

    if(!user || !userId) return res.status(401).json({message: 'User ID not provided!'})
    
    try {
        
        const deletedPost = await Post.findByIdAndDelete(
            {
                _id: postId,
                authorId: userId
            }
        )

        if(!deletedPost) return res.status(404).json({message: 'Post not found!'})

        return res.status(200).json({
            message: 'Post deleted successfully!',
            deletedPost
        })

    } catch (error) {
        return res.status(500).json({
            message: 'Error occured while deleting the post!',
            error
        })
    }
}

async function deleteAllPosts(req, res){
    try {
        const result = await Post.deleteMany({})

        if (result.deletedCount === 0) {
            return res.status(404).json({ message: 'No posts found to delete' })
        }

        return res.status(200).json({
            message: 'All posts deleted successfully!',
            deletedCount: result.deletedCount
        })
    } catch (error) {
        return res.status(500).json({
            message: 'Error occurred while deleting all posts!',
            error
        })
    }
}

module.exports = { createPost, viewUsersPosts, viewMyPosts, viewAllPosts, editPost, deletePost, deleteAllPosts }