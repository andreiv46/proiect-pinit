import axios from "axios"
import {setAxiosAuthHeader} from "./axios.config.ts";
import {useAuthStore} from "../store/auth.store.ts";

const userRoute = "/user"

export async function checkUsername(username: string) {
    return (await axios.get(`${userRoute}/${username}`)).data
}

export async function createUser() {
    const authStore = useAuthStore()
    setAxiosAuthHeader(await authStore.getCurrentUser?.getIdToken() ?? "")
    return (await axios.post(userRoute)).data
}