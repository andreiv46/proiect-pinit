import db from "../config/firebase/database.config"
import {NextFunction, Response} from "express"
import {ExtendedRequest} from "../config/types"
import {Timestamp} from 'firebase-admin/firestore'
import {createUserPostsDirectory} from "../config/multer/multer.config";

const usersCollection = db.collection('users')

export async function createUser(req: ExtendedRequest, res: Response, next: NextFunction) {
    try {
        const userToken = req.userToken
        const existingUserSnapshot = await usersCollection
            .where("displayName", "==", userToken?.name)
            .get()

        if (!existingUserSnapshot.empty){
            res.status(400).json({message: "User already exists"})
            return
        }

        await usersCollection.add({
            uid: userToken?.uid,
            displayName: userToken?.name,
            createdAt: Timestamp.now(),
            updatedAt: Timestamp.now()
        })

        createUserPostsDirectory(userToken?.uid!)

        res.status(201).json({message: "User created successfully"})
    } catch (error: unknown) {
        next(error)
    }
}

export async function existingUsername(
    req: ExtendedRequest<{ username: string }, {}, {}, {}>,
    res: Response,
    next: NextFunction) {
    try {
        const username = req.params.username
        const existingUserSnapshot = await usersCollection
            .where("displayName", "==", username)
            .get()
        if (!existingUserSnapshot.empty) {
            res.status(200).json({message: "Username already exists"})
            return
        }
        res.status(404).json({message: "Username does not exist"})
    } catch (error: unknown) {
        next(error)
    }
}