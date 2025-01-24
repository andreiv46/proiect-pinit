import {Router} from "express";
import {createPost, getPosts} from "../controller/post.controller"
import {verifyJWTToken} from "../middleware/auth.middleware"

const router = Router()

router
    .get("/", getPosts)
    .post("/", verifyJWTToken, createPost)

export default router