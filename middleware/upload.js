const multer = require("multer");
const path = require("path");
const fs = require("fs/promises");

const filter = (req, file, cb) => {
    const allowedMimeType = ['image/jpg', 'image/gif', 'image/jpeg', 'image/png'];

    if (!allowedMimeType.includes(file.mimetype)) {
        cb(new Error('This image type is not sported. Please select a different image.'), false);
    } else {
        cb(null, true);
    }
}

const storage = multer.diskStorage({
    destination: async(req, file, cb) => {
        try {
            const rootDir = path.dirname(__dirname);
            const uploadsDir = path.join(rootDir, 'public/uploads/');

            await fs.mkdir(uploadsDir, {recursive: true});
        } catch (error) {
            cb(error);
        }
    },
    filename: (req, file, cb) => {
        if (!req.savedImage) req.savedImage = [];
        
        const url = file.originalName;

        req.savedImage = [...req.savedImage, path.join(url)];
        console.log('url: ' + url);
        cb(null, url);
    },
});

const rootDir = path.dirname(__dirname);
const uploadsDir = path.join(rootDir, 'public/uploads/');

const upload = multer({ storage, fileFilter }).single('image');

module.exports = {upload, uploadsDir};