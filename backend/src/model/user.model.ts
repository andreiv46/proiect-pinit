import {Timestamp} from 'firebase/firestore'

export interface User {
    uid: string,
    displayName: string,
    createdAt: Timestamp,
    updatedAt: Timestamp,
}