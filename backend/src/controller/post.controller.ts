import db from "../config/firebase/database.config"
import {NextFunction, Response} from "express"
import {documentWithId} from "../config/firebase/database.helper"
import {Post} from "../model/post.model"
import {ExtendedRequest} from "../config/types"
import {CreatePostInput} from "../schema/post.schema"
import {Timestamp} from 'firebase-admin/firestore'
import {PostNotFoundError} from "../error/post.error";
import {uploadPostsFiles} from "../middleware/file.middleware";
import {blobServiceClient} from "../config/azure/blob-storage.config";
import {ContainerClient} from "@azure/storage-blob";
import {UnauthorizedError} from "../error/auth.error";

const postsCollection = db.collection('posts')
const postFilesContainer = blobServiceClient.getContainerClient("postfiles")

export async function getPublicPosts(_req: ExtendedRequest, res: Response, next: NextFunction) {
    try {
        const postsSnapshot = await postsCollection
            .where("visibility", "==", "public")
            .get()
        const posts: Post[] = postsSnapshot.docs.map(
            doc => documentWithId<Post>(doc))
        res.status(200).json(posts)
    } catch (error: unknown) {
        next(error)
    }
}

export async function getUserPosts(
    req: ExtendedRequest<{ userId: string }, {}, {}, {}>,
    res: Response,
    next: NextFunction) {
    try {
        const userToken = req.userToken
        const userId = req.params.userId
        if (userToken?.uid !== userId) {
            throw new UnauthorizedError()
        }

        const postsSnapshot = await postsCollection
            .where("userID", "==", userId)
            .orderBy("createdAt", "desc")
            .get()
        const posts: Post[] = postsSnapshot.docs.map(
            doc => documentWithId<Post>(doc))
        res.status(200).json(posts)
    } catch (error: unknown) {
        next(error)
    }
}

export async function getUserPostById(
    req: ExtendedRequest<{ postId: string }, {}, {}, {}>,
    res: Response,
    next: NextFunction
){
    try {
        const userToken = req.userToken
        const {postId} = req.params

        const postSnapshot = await postsCollection.doc(postId).get()

        if (!postSnapshot.exists) {
            throw new PostNotFoundError()
        }

        const postData = postSnapshot.data()
        if (postData?.userID !== userToken?.uid) {
            throw new UnauthorizedError()
        }

        res.status(200).json(documentWithId<Post>(postSnapshot))
    } catch (error: unknown) {
        next(error)
    }
}

export async function deletePost(
    req: ExtendedRequest<{ postId: string }, {}, {}, {}>,
    res: Response,
    next: NextFunction) {
    try {
        const userToken = req.userToken
        const {postId} = req.params

        const postSnapshot = await postsCollection.doc(postId).get();

        if (!postSnapshot.exists) {
            throw new PostNotFoundError()
        }

        const postData = postSnapshot.data();
        if (postData?.userID !== userToken?.uid) {
            throw new UnauthorizedError()
        }

        await deletePostFromAzureBlob(userToken?.uid!, postId, postFilesContainer)

        await postsCollection.doc(postId).delete()

        res.status(200).json({message: "Post deleted successfully"})

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
    req: ExtendedRequest<{ userId: string, postId: string }, {}, {}, {}>,
    res: Response,
    next: NextFunction) {
    try {
        const {userId, postId} = req.params
        const userToken = req.userToken

        if (userToken?.uid !== userId) {
            res.status(403).json({message: "Unauthorized"})
            return
        }

        const postSnapshot = await postsCollection.doc(postId).get();

        if (!postSnapshot.exists) {
            throw new PostNotFoundError()
        }

        const postData = postSnapshot.data();
        if (postData?.userID !== userId) {
            throw new UnauthorizedError()
        }

        const upload = uploadPostsFiles(userId, postId)
        upload(req, res, async function (err) {
            if (err) {
                return next(err);
            }

            const uploadedFiles = req.files as Express.Multer.File[];

            const fileUrls = await Promise.all(
                uploadedFiles.map((file) => uploadToAzureBlob(file, userId, postId, postFilesContainer))
            )

            const updatedFiles = [...(postData.files || []), ...fileUrls.map((url, index) => ({
                url,
                type: uploadedFiles[index].mimetype,
            }))]

            await postsCollection.doc(postId).update({
                files: updatedFiles,
                updatedAt: Timestamp.now(),
            });

            res.status(200).json({message: "Files uploaded and post updated successfully"});
        })

    } catch (error: unknown) {
        next(error)
    }
}

async function uploadToAzureBlob(file: Express.Multer.File, userId: string, postId: string, blobContainer: ContainerClient): Promise<string> {

    await blobContainer.createIfNotExists();

    const blobName = `${userId}/${postId}/${file.originalname}`;
    const blockBlobClient = blobContainer.getBlockBlobClient(blobName);

    await blockBlobClient.uploadData(file.buffer, {
        blobHTTPHeaders: {blobContentType: file.mimetype},
    });

    return blockBlobClient.url;
}

async function deletePostFromAzureBlob(userId: string, postId: string, blobContainer: ContainerClient){
    const prefix = `${userId}/${postId}`
    const blobs = blobContainer.listBlobsFlat({ prefix })

    for await (const blob of blobs) {
        const blobClient = blobContainer.getBlobClient(blob.name)
        await blobClient.deleteIfExists()
        console.log(`Deleted: ${blob.name}`)
    }
}