import {Timestamp} from 'firebase-admin/firestore'

export interface Coordinate {
    latitude: number,
    longitude: number
}

export interface Post {
    title: string,
    location: Coordinate,
    categories: string[]
    description: string,
    files: Array<{
        url: string;
        type: string;
    }>,
    likes: number,
    dislikes: number,
    userVotes: { [userId: string]: "like" | "dislike" },
    user: string,
    userID: string,
    visibility: "public" | "private",
    createdAt: Timestamp,
    updatedAt: Timestamp,
}