import {CustomError} from "../config/error/CustomError";

export class AuthorizationHeaderRequiredError extends CustomError {
    constructor(message = "Authorization header is required") {
        super(message, 401);
    }
}

export class InvalidTokenError extends CustomError {
    constructor(message = "Invalid token") {
        super(message, 403);
    }
}

export class TokenRequiredError extends CustomError {
    constructor(message = "Token is required") {
        super(message, 401);
    }
}