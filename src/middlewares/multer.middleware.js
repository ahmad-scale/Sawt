const multer = require('multer')
const fs = require('fs')
const path = require('path')

const tempDir = path.resolve(__dirname, '../../public/temp')
const MAX_TEMP_FILE_AGE_MS = 1000 * 60 * 60 // 1 hour

if (!fs.existsSync(tempDir)) {
    fs.mkdirSync(tempDir, { recursive: true })
}

const cleanupStaleTempFiles = () => {
    if (!fs.existsSync(tempDir)) {
        fs.mkdirSync(tempDir, { recursive: true })
        return
    }

    const now = Date.now()

    for (const entry of fs.readdirSync(tempDir)) {
        const entryPath = path.join(tempDir, entry)

        try {
            const stats = fs.statSync(entryPath)

            if (!stats.isFile()) continue

            if (now - stats.mtimeMs > MAX_TEMP_FILE_AGE_MS) {
                fs.unlinkSync(entryPath)
            }
        } catch (error) {
            console.error('Failed to clean temp upload file:', error)
        }
    }
}

cleanupStaleTempFiles()

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