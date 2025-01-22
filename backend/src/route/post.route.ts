import {Router} from "express";
import {getPosts} from "../controller/post.controller";

const router = Router()

router
    .get("/", getPosts)

export default router