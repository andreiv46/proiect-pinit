import express from "express"
import cors from "cors"
import "dotenv/config"
import recycleCenterRoute from "./route/recycle-center.route";
import {errorHandler} from "./config/error/error-handler";

const app = express()

app.use(express.json())
app.use(cors())

app.get("/", async (_req, res) => {
    res.status(200).json({msg: "da ma daa"})
})

app.use("/recycle-center", recycleCenterRoute)

app.use(errorHandler)

app.listen(process.env.PORT, () => {
    console.log(`Server is running on localhost:${process.env.PORT}`)
})
