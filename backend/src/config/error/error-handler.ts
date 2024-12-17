import { Request, Response, NextFunction, ErrorRequestHandler } from 'express'
import {CustomError} from './CustomError'

export const errorHandler: ErrorRequestHandler = (err, _req, res, next) => {
    if (res.headersSent) {
        return next(err)
    }

    if (err instanceof CustomError) {
        res.status(err.statusCode).json({ message: err.message })
        return
    }

    if (err instanceof Error) {
        res.status(500).json({ message: err.message })
        return
    }

    res.status(500).json({ message: 'Internal server error' })
}
