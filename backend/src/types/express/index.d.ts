// src/types/express/index.d.ts
import { DecodedIdToken } from "firebase-admin/auth";

declare global {
    namespace Express {
        interface Request {
            userToken?: DecodedIdToken;
        }
    }
}