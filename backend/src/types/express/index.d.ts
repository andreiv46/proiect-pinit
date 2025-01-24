// src/types/express/index.d.ts
import {DecodedIdToken} from "firebase-admin/auth";
import {ExtendedIdToken} from "../../config/types";

declare global {
    namespace Express {
        interface Request {
            userToken?: ExtendedIdToken;
        }
    }
}