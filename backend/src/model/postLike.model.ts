import {Timestamp} from "firebase/firestore";

export interface UserVote {
    userId: string
    postId: string
    vote: "like" | "dislike"
}