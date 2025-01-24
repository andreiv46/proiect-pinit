import {Request, Response, NextFunction} from 'express'
import {CustomError} from './CustomError'
import log from "../logger/logger";

export function errorHandler(
    err: unknown,
    _req: Request,
    res: Response,
    next: NextFunction
): void {
    if (res.headersSent) {
        return next(err);
    }

    if (err instanceof CustomError) {
        res.status(err.statusCode).json({ message: err.message })
        return
    }

    if (err instanceof Error) {
        log.error(err.message, { stack: err.stack });
    }

    res.status(500).json({ message: "Internal server error" })
    return
}
