// Multer adds a body object and a file or files object to the request object. The body object contains the values of the text fields of the form, the file or files object contains the files uploaded via the form.

import multer from 'multer'

const MAX_FILE_SIZE = 25 * 1024 * 1024

export const upload = multer({
    storage: multer.memoryStorage(),
    limits: { fileSize: MAX_FILE_SIZE },
    fileFilter: (req, file, cb) => {
        const isImage = file.mimetype.startsWith("image/")
        const isVideo = file.mimetype.startsWith("video/")

        if(!isImage && !isVideo){
            cb(new Error("Only image and video uploads are allowed"))
            return  
        }

        cb(null, true)   // no error and success: true
    }
})