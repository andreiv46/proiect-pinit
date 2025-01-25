import {Request, Response, NextFunction} from "express"
import {AnyZodObject} from "zod"
import log from "../config/logger/logger";

export const validateSchema =
    (schema: AnyZodObject) =>
        (req: Request, res: Response, next: NextFunction) => {
            try {
                const parsedData = schema.parse({
                    body: req.body,
                    query: req.query,
                    params: req.params,
                })
                req.body = parsedData.body
                req.query = parsedData.query
                req.params = parsedData.params
                next()
                return
            } catch (e: any) {
                log.error(e.errors)
                res.status(400).json({message: e.errors})
                return
            }
        };