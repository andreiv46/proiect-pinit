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
import {blobServiceClient} from "../config/azure/blob-storage.config";
import {ContainerClient} from "@azure/storage-blob";

const postsCollection = db.collection('posts')

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
            res.status(403).json({message: "Unauthorized"})
            return
        }

        const upload = uploadPostsFiles(userId, postId)
        upload(req, res, async function (err) {
            if (err) {
                return next(err);
            }

            const uploadedFiles = req.files as Express.Multer.File[];

            const postFilesContainer = blobServiceClient.getContainerClient("postfiles")
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