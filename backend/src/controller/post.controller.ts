import db from "../config/firebase/database.config";
import {NextFunction, Request, Response} from "express";
import {documentWithId} from "../config/firebase/database.helper";
import {Post} from "../model/post.model";

const postsCollection = db.collection('posts')


export async function getPosts(_req: Request, res: Response, next: NextFunction) {
    try {
        const recycleCentersSnapshot = await postsCollection.get()
        const recycleCenters: Post[] = recycleCentersSnapshot.docs.map(
            doc => documentWithId<Post>(doc))
        res.status(200).json(recycleCenters)
    } catch (error: unknown) {
        next(error)
    }
}
