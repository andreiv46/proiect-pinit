import {NextFunction, Response} from "express";
import {AuthorizationHeaderRequiredError, InvalidTokenError, TokenRequiredError} from "../error/auth.error";
import firebaseAuth from "../config/firebase/auth.config";
import {ExtendedRequest} from "../config/types";
import log from "../config/logger/logger";
import {DecodedIdToken} from "firebase-admin/lib/auth";

export function verifyJWTToken(req: ExtendedRequest, _res: Response, next: NextFunction): void {
    const authHeader = req.headers["authorization"]

    if (!authHeader) {
        throw new AuthorizationHeaderRequiredError()
    }

    const token = authHeader && authHeader.split(" ")[1]
    if (!token) {
        throw new TokenRequiredError()
    }

    firebaseAuth.verifyIdToken(token)
        .then((decodedToken: DecodedIdToken) => {
            req.userToken = decodedToken
            next()
        })
        .catch((error: any) => {
            log.error(error)
            throw new InvalidTokenError()
        })
}