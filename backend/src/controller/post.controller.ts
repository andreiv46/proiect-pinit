import db from "../config/firebase/database.config"
import {NextFunction, Response} from "express"
import {documentWithId} from "../config/firebase/database.helper"
import {Post} from "../model/post.model"
import {ExtendedRequest} from "../config/types"
import {CreatePostInput} from "../schema/post.schema"
import {Timestamp} from 'firebase-admin/firestore'
import {createPostDirectory} from "../config/multer/multer.config";
import {PostNotFoundError} from "../error/post.error";
import {uploadPostsFiles} from "../middleware/file.middleware";

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

export async function uploadFilesToPostController(
    req: ExtendedRequest<{userId: string, postId: string}, {}, {}, {}>,
    res: Response,
    next: NextFunction) {
    try {
        const {userId, postId} = req.params
        const userToken = req.userToken

        if (userToken?.uid !== userId){
            res.status(403).json({message: "Unauthorized"})
            return
        }

        const postSnapshot = await postsCollection.doc(postId).get();

        if (!postSnapshot.exists) {
            throw new PostNotFoundError()
        }

        const postData = postSnapshot.data();
        if (postData?.userID !== userId){
            res.status(403).json({message: "Unauthorized"})
            return
        }

        const upload = uploadPostsFiles(userId, postId)
        upload(req, res, async function (err) {
            if (err) {
                return next(err);
            }

            const uploadedFiles = req.files as Express.Multer.File[];
            const fileUrls = uploadedFiles.map(file => ({
                url: `./posts/${userId}/${postId}/${file.filename}`,
                type: file.mimetype,
            }));

            const updatedFiles = [...(postData.files || []), ...fileUrls];

            await postsCollection.doc(postId).update({
                files: updatedFiles,
                updatedAt: Timestamp.now(),
            });

            res.status(200).json({ message: "Files uploaded and post updated successfully" });
        })

    } catch (error: unknown) {
        next(error)
    }
}