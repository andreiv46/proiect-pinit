import {getAuth, createUserWithEmailAndPassword} from "firebase/auth/cordova"
import {app} from "./firebase.config.ts";

export interface User {
    id: string,
    name: string,
    email: string
}

const auth = getAuth(app)

export const authService = {
    async register(input: RegisterInput): Promise<void> {
        try {
            const user = await createUserWithEmailAndPassword(auth, input.email, input.password)
            const token = await user.user.getIdToken()
            console.log(user.user)
            localStorage.setItem("token", token)
        } catch (e) {
            console.error(e)
        }
    },
    getCurrentUser() {
        return auth.currentUser
    }
}


export interface RegisterInput {
    name: string,
    email: string,
    password: string
}
