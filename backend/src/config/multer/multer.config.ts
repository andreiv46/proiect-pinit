import multer from "multer"
import fs from 'fs'
import path from "path";
import {FileFormatNotSupportedError} from "../../error/file.error";

export const createStorageForUserAndPost = (userId: string, postId: string) => {
    return multer.diskStorage({
        destination: function (_req, _file, cb) {
            const uploadPath = `./posts/${userId}/${postId}`
            cb(null, uploadPath)
        },
        filename: function (_req, file, cb) {
            cb(
                null,
                `${Date.now()}-${file.originalname}`
            )
        },
    })
}

export function fileToBase64(filePath: string): string {
    const file = fs.readFileSync(filePath)
    return file.toString('base64')
}

export function createUserPostsDirectory(uid: string) {
    const directoryPath = `./posts/${uid}`
    if (!fs.existsSync(directoryPath)) {
        fs.mkdirSync(directoryPath, {recursive: true})
    }
}

export function createPostDirectory(uid: string, postId: string) {
    const directoryPath = `./posts/${uid}/${postId}`
    if (!fs.existsSync(directoryPath)) {
        return fs.mkdirSync(directoryPath, {recursive: true})
    }
    return directoryPath
}