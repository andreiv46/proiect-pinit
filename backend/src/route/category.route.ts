import {Router} from "express"
import {getCategories} from "../controller/category.controller";

const router = Router()

router
    .get("/", getCategories)

export default router