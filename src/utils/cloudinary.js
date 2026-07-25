const cloudinary = require('cloudinary').v2;
const fs = require('fs');
require('dotenv').config()

const cloudName = process.env.CLOUDINARY_CLOUD_NAME
const apiKey = process.env.CLOUDINARY_API_KEY
const apiSecret = process.env.CLOUDINARY_API_SECRET

const hasCloudinaryConfig = Boolean(cloudName && apiKey && apiSecret)

if (hasCloudinaryConfig) {
    cloudinary.config({
        cloud_name: cloudName,
        api_key: apiKey,
        api_secret: apiSecret
    });
}

const uploadOnCloudinary = async (localFilePath) => {
    try {
        if (!localFilePath) return null

        if (!hasCloudinaryConfig) {
            console.error('Cloudinary upload failed: missing configuration. Set CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, and CLOUDINARY_API_SECRET.')
            return null
        }

        if (!fs.existsSync(localFilePath)) {
            console.error('Cloudinary upload failed: local file not found', localFilePath)
            return null
        }

        const response = await cloudinary.uploader.upload(
            localFilePath,
            {
                resource_type: 'auto',
            }
        )

        console.log('File uploaded on cloudinary', response.url);

        fs.unlinkSync(localFilePath)

        return response
    } catch (error) {
        if (localFilePath && fs.existsSync(localFilePath)) {
            fs.unlinkSync(localFilePath)
        }

        console.error('Cloudinary upload failed', error);
        return null
    }
}

module.exports = uploadOnCloudinary