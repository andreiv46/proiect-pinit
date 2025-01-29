import express from 'express'
import cors from 'cors'
import 'dotenv/config'
import {errorHandler} from './config/error/error-handler'
import postRoute from "./route/post.route";
import log from "./config/logger/logger";
import userRoute from "./route/user.route";

const app = express()

app.use(express.json())
app.use(cors())

app.use('/post', postRoute)
app.use('/user', userRoute)

app.use(errorHandler)
app.listen(process.env.PORT, () => {
    log.info(`Server is running on http://localhost:${process.env.PORT}`)
})
