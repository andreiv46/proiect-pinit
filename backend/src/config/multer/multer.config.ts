import multer from "multer"
import path from "path"
import fs from 'fs'

export const createStorage = (storageName: string) => {
    return multer.diskStorage({
        destination: function (_req, _file, cb) {
            cb(null, `./posts/${storageName}`)
        },
        filename: function (_req, file, cb) {
            cb(
                null,
                `${storageName}-${Date.now()}${path.extname(file.originalname)}`
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