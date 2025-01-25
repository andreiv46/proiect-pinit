import {Router} from "express";
import {createPost, getPosts} from "../controller/post.controller"
import {verifyJWTToken} from "../middleware/auth.middleware"
import {validateSchema} from "../middleware/schema.middleware";
import {createPostSchema} from "../schema/post.schema";

const router = Router()

router
    .get("/", getPosts)
    .post("/", verifyJWTToken, validateSchema(createPostSchema), createPost)

export default router