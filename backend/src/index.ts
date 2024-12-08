import express from "express"
import cors from "cors"
import "dotenv/config"

const app = express()

app.use(express.json())
app.use(cors())

app.get("/", (_req, res) => {
    res.status(200).json({"msg": "da ma daaa"})
})

app.listen(process.env.PORT, () => {
    console.log(`Server is running on localhost:${process.env.PORT}`)
})