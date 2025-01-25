import {CustomError} from "../config/error/CustomError";

export class PostNotFoundError extends CustomError {
    constructor(message = "Post not found") {
        super(message, 404);
    }
}