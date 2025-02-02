import "dotenv/config"
import fs from "fs"
import multer, {memoryStorage} from "multer"
import path from "path"
import {FileFormatNotSupportedError} from "../error/file.error"

export const ALLOWED_MIME_TYPES = [
    "image/jpeg",
    "image/png",
    "image/jpg",
    "video/mp4",
]
export const ALLOWED_FILE_TYPES = /jpeg|png|jpg|mp4/
export const MAX_FILE_SIZE = 1024 * 1024 * 2 //2mb maxim

export const uploadPostsFiles = (userId: string, postId: string) => {
    return multer({
        storage: memoryStorage(),
        limits: {
            fileSize: MAX_FILE_SIZE,
        },
        fileFilter: function (_req, file, cb) {
            const fileTypes = ALLOWED_FILE_TYPES.test(
                path.extname(file.originalname).toLowerCase()
            )
            const mimeTypes = ALLOWED_MIME_TYPES.includes(file.mimetype)
            if (fileTypes && mimeTypes) {
                return cb(null, true)
            }
            cb(null, false)
            return cb(new FileFormatNotSupportedError())
        },
    }).array('files', 5)
}