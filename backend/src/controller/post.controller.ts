import db from "../config/firebase/database.config"
import {NextFunction, Response} from "express"
import {documentWithId} from "../config/firebase/database.helper"
import {Post} from "../model/post.model"
import {ExtendedRequest} from "../config/types"
import {CreatePostInput} from "../schema/post.schema"
import {Timestamp} from 'firebase-admin/firestore'
import {createPostDirectory} from "../config/multer/multer.config";

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

export async function createPost(
    req: ExtendedRequest<{}, {}, CreatePostInput["body"]>,
    res: Response,
    next: NextFunction) {
    try {
        const createPostDTO = req.body
        const userToken = req.userToken

        const newPost: Post = {
            title: createPostDTO.title,
            description: createPostDTO.description,
            categories: createPostDTO.categories,
            location: createPostDTO.location,
            files: [],
            likes: 0,
            dislikes: 0,
            userVotes: {},
            user: userToken?.name!,
            userID: userToken?.uid!,
            visibility: createPostDTO.isPublic ? "public" : "private",
            createdAt: Timestamp.now(),
            updatedAt: Timestamp.now(),
        }

        const postRef = await postsCollection.add(newPost)

        createPostDirectory(userToken?.uid!, postRef.id)

        res.status(201).json({
            message: "Post created successfully",
            post: {
                id: postRef.id,
                ...newPost
            }
        })
    } catch (error: unknown) {
        next(error)
    }
}
