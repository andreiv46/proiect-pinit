import {Module} from "vuex"
import {User} from "firebase/auth"
import {authService, RegisterInput} from "../firebase/firebase.auth.ts"

interface AuthState {
    user: User | null,
    isAuthenticated: boolean
}

export const authModule: Module<AuthState, any> = {
    namespaced: true,
    state: {
        user: null,
        isAuthenticated: false,
    },
    mutations: {
        setUser(state, user: User | null) {
            state.user = user
            state.isAuthenticated = user !== null
        },
        clearUser(state) {
            state.user = null
            state.isAuthenticated = false;
        },
    },
    actions: {
        async register({ commit }, input: RegisterInput) {
            const result = await authService.register(input)
            if (result.success) {
                commit('setUser', authService.getCurrentUser());
            }
            return result;
        },
        async signInWithEmailLink({ commit }, email: string) {
            const result = await authService.signInWithEmailLink(email)
            if (result.success) {
                commit('setUser', authService.getCurrentUser())
            }
            return result;
        },
        async onSignInWithEmailLinkRedirect({ commit }) {
            const result = await authService.onSignInWithEmailLinkRedirect()
            if (result.success) {
                commit('setUser', authService.getCurrentUser())
            }
            return result;
        },
        async logout({ commit }) {
            await authService.logout()
            commit('clearUser')
        },
        async initializeAuthState({ commit }) {
            await authService.waitForAuthInitialization()
            commit('setUser', authService.getCurrentUser())
        },
    },
    getters: {
        isAuthenticated(state) {
            return state.isAuthenticated
        },
        currentUser(state) {
            return state.user
        },
    },
}