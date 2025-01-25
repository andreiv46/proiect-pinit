import {CustomError} from "../config/error/CustomError";

export class FileFormatNotSupportedError extends CustomError {
    constructor() {
        super("File format not supported", 400);
    }
}