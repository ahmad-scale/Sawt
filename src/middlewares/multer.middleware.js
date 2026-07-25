const multer = require('multer')
const fs = require('fs')
const path = require('path')

const tempDir = path.resolve(__dirname, '../../public/temp')

if (!fs.existsSync(tempDir)) {
    fs.mkdirSync(tempDir, { recursive: true })
}

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, tempDir)
    },
    filename: function (req, file, cb) {
        const ext = path.extname(file.originalname || '')
        const baseName = path.basename(file.originalname, ext).replace(/\s+/g, '-') || 'upload'
        const uniqueName = `${Date.now()}-${baseName}${ext}`
        cb(null, uniqueName)
    }
})

const upload = multer({ storage })

module.exports = upload