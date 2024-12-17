import { Router } from 'express'
import { getRecycleCenters } from '../controller/recycle-center.controller'

const router = Router()

router
    .get('/', getRecycleCenters)

export default router