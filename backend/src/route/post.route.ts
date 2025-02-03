import {Router} from "express";
import {
    createPost,
    getPublicPosts,
    uploadFilesToPostController,
    getUserPosts,
    deletePost,
    getUserPostById,
    deleteFileFromPost,
    updatePost,
    likePost,
    dislikePost, removeVoteFromPost,
} from "../controller/post.controller"
import {verifyJWTToken} from "../middleware/auth.middleware"
import {validateSchema} from "../middleware/schema.middleware";
import {createPostSchema, updatePostSchema} from "../schema/post.schema";

const router = Router()

router
    .get("/", verifyJWTToken, getPublicPosts)
    .get("/:postId", verifyJWTToken, getUserPostById)
    .get("/:userId/posts", verifyJWTToken, getUserPosts)
    .post("/", verifyJWTToken, validateSchema(createPostSchema), createPost)
    .put("/:postId", verifyJWTToken, validateSchema(updatePostSchema), updatePost)
    .patch("/:userId/:postId/upload", verifyJWTToken, uploadFilesToPostController)
    .delete("/:postId", verifyJWTToken, deletePost)
    .delete("/:postId/file", verifyJWTToken, deleteFileFromPost)
    .post("/:postId/like", verifyJWTToken, likePost)
    .post("/:postId/dislike", verifyJWTToken, dislikePost)
    .post("/:postId/remove-vote", verifyJWTToken, removeVoteFromPost)

export default router