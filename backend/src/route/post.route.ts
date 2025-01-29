import {Router} from "express";
import {createPost, getPublicPosts, uploadFilesToPostController} from "../controller/post.controller"
import {verifyJWTToken} from "../middleware/auth.middleware"
import {validateSchema} from "../middleware/schema.middleware";
import {createPostSchema} from "../schema/post.schema";

const router = Router()

router
    .get("/", verifyJWTToken, getPublicPosts)
    .post("/", verifyJWTToken, validateSchema(createPostSchema), createPost)
    .patch("/:userId/:postId/upload", verifyJWTToken, uploadFilesToPostController)

export default router