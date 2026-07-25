const mongoose = require('mongoose')
const bcrypt = require('bcryptjs')

const userSchema = new mongoose.Schema(
    {
        username: {
            type: String,
            required: [true, 'Username is required'],
            unique: [true, 'This username is already taken'],
            trim: true,
            minLength: [4, 'Username cannot be shorter than 4 characters'],
            maxLength: [15, 'Username cannot be longer than 15 characters'],
            lowercase: true
        },
        email: {
            type: String,
            required: [true, 'Email is required'],
            lowercase: true,
            trim: true,
            match: [/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/, "Use correct email format only!"]
        },
        password: {
            type: String,
            required: [true, 'Password field cannot be empty'],
            trim : true,
            minLength: [4, 'Password cannot be shorter than 4 characters'],
            maxLength: [128, 'Password cannot be longer than 128 characters'],
            select: false
        },
        bio: {
            type: String,
            required: false,
            maxLength: [500, 'User Bio cannot be longer than 500 characters']
        },
        avatar: {
            type: String,
            trim: true
        },
        role: {
            type: String,
            enum: ['User', 'Owner', 'Admin'],
            required: true,
            default: 'User',
            select: false
        }

    },{
        timestamps: true
    }
)

userSchema.pre('save', async function () {
    if (!this.isModified('password')) {
        return
    }

    try {
        const salt = await bcrypt.genSalt(10)
        this.password = await bcrypt.hash(this.password, salt)
    } catch (err) {
        throw err
    }
})

userSchema.methods.comparePassword = async function (candidatePassword) {
    if (!this.password) return false
    return bcrypt.compare(candidatePassword, this.password)
}

const User = mongoose.model('User', userSchema)

module.exports = User