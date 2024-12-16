import {Module} from "vuex"
import {User} from "firebase/auth"

interface AuthState {
    user: User | null,
    isAuthenticated: boolean
}

export const authModule: Module<AuthState, any> = {}