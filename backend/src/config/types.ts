import { Request } from "express";
import {DecodedIdToken} from "firebase-admin/lib/auth";

export interface ExtendedIdToken extends DecodedIdToken {
    name: string
}

export interface ExtendedRequest<
    P = {},
    ResBody = any,
    ReqBody = any,
    ReqQuery = qs.ParsedQs
> extends Request<P, ResBody, ReqBody, ReqQuery> {
    userToken?: ExtendedIdToken
}