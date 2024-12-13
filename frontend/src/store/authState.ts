import {Module} from "vuex";

interface User {
    id: string,
    name: string,
    email: string
}

interface AuthState {
    user: User | null,
    isLoading: boolean
}

export const authModule: Module<AuthState, any> = {
    namespaced: true,
    state: (): AuthState => ({user: null, isLoading: false}),
    mutations: {
        setUser(state: AuthState, user: User): void {
            state.user = user
        },
        setLoading(state: AuthState, isLoading: boolean): void {
            state.isLoading = isLoading
        }
    },
    actions: {
    },
    getters: {
        user(state: AuthState): User | null {
            return state.user
        },
        isLoading(state: AuthState): boolean {
            return state.isLoading
        }
    }
}