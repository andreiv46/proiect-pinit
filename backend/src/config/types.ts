import { Request } from "express";
import {DecodedIdToken} from "firebase-admin/lib/auth";

export interface ExtendedRequest<
    P = {},
    ResBody = any,
    ReqBody = any,
    ReqQuery = qs.ParsedQs
> extends Request<P, ResBody, ReqBody, ReqQuery> {
    userToken?: DecodedIdToken
}