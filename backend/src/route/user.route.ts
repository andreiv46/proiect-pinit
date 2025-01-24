import {Router} from "express"
import {verifyJWTToken} from "../middleware/auth.middleware"
import {createUser, existingUsername} from "../controller/user.controller"

const router = Router()

router
    .post("/", verifyJWTToken, createUser)
    .get("/:username", existingUsername)

export default router