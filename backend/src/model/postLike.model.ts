import {Timestamp} from "firebase/firestore";

export interface PostLike {
    userId: string;
    postId: string;
    createdAt: Timestamp;
}