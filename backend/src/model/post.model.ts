import {Timestamp} from 'firebase/firestore'

export interface Coordinate {
    latitude: number,
    longitude: number
}

export interface Post {
    id: string,
    title: string,
    coordinates: Coordinate,
    categories: string[]
    description: string,
    mediaFilePath: string,
    likes: number,
    dislikes: number,
    userVotes: { [userId: string]: "like" | "dislike" },
    user: string,
    userID: string,
    visibility: "public" | "private",
    createdAt: Timestamp,
    updatedAt: Timestamp,
}