import {Router} from "express";
import {createPost, getPosts, uploadFilesToPostController} from "../controller/post.controller"
import {verifyJWTToken} from "../middleware/auth.middleware"
import {validateSchema} from "../middleware/schema.middleware";
import {createPostSchema} from "../schema/post.schema";

const router = Router()

router
    .get("/", getPosts)
    .post("/", verifyJWTToken, validateSchema(createPostSchema), createPost)
    .post("/:userId/:postId/upload", verifyJWTToken, uploadFilesToPostController)

export default router