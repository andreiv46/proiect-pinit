import db from "../config/firebase/database.config";
import {NextFunction, Response} from "express";
import {documentWithId} from "../config/firebase/database.helper";
import {Post} from "../model/post.model";
import {ExtendedRequest} from "../config/types";

const postsCollection = db.collection('posts')

export async function getPosts(_req: ExtendedRequest, res: Response, next: NextFunction) {
    try {
        const postsSnapshot = await postsCollection.get()
        const posts: Post[] = postsSnapshot.docs.map(
            doc => documentWithId<Post>(doc))
        res.status(200).json(posts)
    } catch (error: unknown) {
        next(error)
    }
}

export async function createPost(_req: ExtendedRequest, res: Response, next: NextFunction) {
    try {
        res.status(200).json({message: "da ma daa"})
    } catch (error: unknown) {
        next(error)
    }
}
