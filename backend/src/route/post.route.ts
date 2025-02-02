import {Router} from "express";
import {
    createPost,
    getPublicPosts,
    uploadFilesToPostController,
    getUserPosts,
    deletePost, getUserPostById
} from "../controller/post.controller"
import {verifyJWTToken} from "../middleware/auth.middleware"
import {validateSchema} from "../middleware/schema.middleware";
import {createPostSchema} from "../schema/post.schema";

const router = Router()

router
    .get("/", verifyJWTToken, getPublicPosts)
    .get("/:postId", verifyJWTToken, getUserPostById)
    .get("/:userId/posts", verifyJWTToken, getUserPosts)
    .post("/", verifyJWTToken, validateSchema(createPostSchema), createPost)
    .patch("/:userId/:postId/upload", verifyJWTToken, uploadFilesToPostController)
    .delete("/:postId", verifyJWTToken, deletePost)

export default router