import {Request, Response, NextFunction} from 'express'
import db from '../config/database/database'
import {RecycleCenter} from '../model/recycle-center.model'
import {documentWithId} from '../config/database/database.helper'

const recycleCentersCollection = db.collection('recycling_centers')

export async function getRecycleCenters(_req: Request, res: Response, next: NextFunction) {
    try {
        const recycleCentersSnapshot = await recycleCentersCollection.get()
        const recycleCenters: RecycleCenter[] = recycleCentersSnapshot.docs.map(
            doc => documentWithId<RecycleCenter>(doc))
        res.status(200).json(recycleCenters)
    } catch (error: unknown) {
        next(error)
    }
}