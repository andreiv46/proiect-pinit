import "dotenv/config"
import fs from "fs"
import multer from "multer"
import path from "path"
import {FileFormatNotSupportedError} from "../error/file.error"
import {createStorageForUserAndPost} from "../config/multer/multer.config"

export const ALLOWED_MIME_TYPES = [
    "image/jpeg",
    "image/png",
    "image/jpg",
    "video/mp4",
]
export const ALLOWED_FILE_TYPES = /jpeg|png|jpg|mp4/
export const MAX_FILE_SIZE = 1024 * 1024 * 0.5

export const uploadPostsFiles = (userId: string, postId: string) => {
    const directoryPath = `./posts/${userId}/${postId}`
    if (!fs.existsSync(directoryPath)) {
        throw new Error(`Directory for user ${userId} and post ${postId} does not exist`)
    }

    return multer({
        storage: createStorageForUserAndPost(userId, postId),
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