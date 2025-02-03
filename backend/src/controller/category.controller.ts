import db from "../config/firebase/database.config";
import {ExtendedRequest} from "../config/types";
import {NextFunction, Response} from "express";
import {Post} from "../model/post.model";
import {documentWithId} from "../config/firebase/database.helper";

const categoryCollection = db.collection('categories')

export async function getCategories(_req: ExtendedRequest, res: Response, next: NextFunction) {
    try {
        const postsSnapshot = await categoryCollection.get()
        const posts: Post[] = postsSnapshot.docs.map(
            doc => documentWithId<Post>(doc))
        res.status(200).json(posts)
    } catch (error: unknown) {
        next(error)
    }
}