import axios from "axios"
import {setAxiosAuthHeader} from "./axios.config.ts"
import {useAuthStore} from "../store/auth.store.ts"
import {CreatePostDTO} from "../components/AddPost.vue";
import {Timestamp} from "firebase/firestore"

const postRoute = "/post"

export async function uploadPostFiles(data: FormData, postId: string) {
    const authStore = useAuthStore()
    const userId = authStore.getCurrentUser?.uid
    setAxiosAuthHeader(await authStore.getCurrentUser?.getIdToken() ?? "")
    return await axios.patch(`${postRoute}/${userId}/${postId}/upload`, data, {
        headers: {
            'Content-Type': 'multipart/form-data',
        },
    })
}

export async function createPost(data: CreatePostDTO) {
    const authStore = useAuthStore()
    setAxiosAuthHeader(await authStore.getCurrentUser?.getIdToken() ?? "")
    return await axios.post(`${postRoute}`, data)
}

export async function getPublicPosts(){
    const authStore = useAuthStore()
    setAxiosAuthHeader(await authStore.getCurrentUser?.getIdToken() ?? "")
    return await axios.get(`${postRoute}`)
}

export interface Coordinate {
    latitude: number,
    longitude: number
}

export interface Post {
    id: string,
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