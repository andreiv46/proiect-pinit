import {
    createUserWithEmailAndPassword,
    isSignInWithEmailLink,
    onAuthStateChanged,
    sendSignInLinkToEmail,
    signInWithEmailAndPassword,
    signInWithEmailLink,
    User
} from 'firebase/auth/cordova'
import {auth} from '../config/firebase.config.ts'
import {BroadcastMessage, signInChannel} from '../config/broadcast.config.ts'
import {computed, ref} from 'vue'
import {defineStore} from 'pinia'
import {signOut} from 'firebase/auth'

export interface RegisterInput {
    name: string
    email: string
    password: string
}

export interface LoginInput {
    email: string
    password: string
}

export interface Result {
    success: boolean
    errorMessage?: string
}

const actionCodeSettings = {
    url: 'http://localhost:5173/signInResult',
    handleCodeInApp: true,
}

export const useAuthStore = defineStore('auth', () => {
    const currentUser = ref<User | null>(null)
    const isAuthInitialized = ref<boolean>(false)

    async function waitForAuthInitialization(): Promise<void> {
        return new Promise((resolve) => {
            if (isAuthInitialized.value) {
                resolve()
                return
            }
            onAuthStateChanged(auth, (user) => {
                isAuthInitialized.value = true
                currentUser.value = user
                resolve()
            })
        })
    }

    async function register(input: RegisterInput): Promise<Result> {
        try {
            const credentials = await createUserWithEmailAndPassword(auth, input.email, input.password)
            console.log(credentials.user)
            currentUser.value = credentials.user
            return {success: true}
        } catch (error: any) {
            console.error('Registration failed', error.message)
            return {success: false, errorMessage: error.message}
        }
    }

    async function logInWithEmailAndPassword(input: LoginInput): Promise<Result> {
        try {
            const credentials = await signInWithEmailAndPassword(auth, input.email, input.password)
            console.log(credentials.user)
            currentUser.value = credentials.user
            return {success: true}
        } catch (error: any) {
            console.error('Sign-in failed', error.message)
            return {success: false, errorMessage: error.message}
        }
    }

    async function logInWithEmailLink(email: string): Promise<Result> {
        try {
            await sendSignInLinkToEmail(auth, email, actionCodeSettings)
            window.localStorage.setItem('emailForSignIn', email)
            return {success: true}
        } catch (error: any) {
            console.error('Sign-in link sending failed', error.message)
            return {success: false, errorMessage: error.message}
        }
    }

    async function onLogInWithEmailLinkRedirect(): Promise<Result> {
        if (isSignInWithEmailLink(auth, window.location.href)) {
            let email = window.localStorage.getItem('emailForSignIn')
            if (!email) {
                email = window.prompt('Please provide your email for confirmation')!
            }
            try {
                const result = await signInWithEmailLink(auth, email, window.location.href)
                window.localStorage.removeItem('emailForSignIn')
                signInChannel.postMessage({type: 'SIGNIN_SUCCESSFUL'} as BroadcastMessage)
                console.log(result.user)
                currentUser.value = result.user
                return {success: true}
            } catch (error: any) {
                console.error('Sign-in failed', error.message)
                return {success: false, errorMessage: error.message}
            }
        }
        return {success: false, errorMessage: 'Not a valid sign-in link'}
    }

    async function logOut(): Promise<Result> {
        try {
            await signOut(auth)
            currentUser.value = null
            return {success: true}
        } catch (error: any) {
            console.error('Sign-out failed', error.message)
            return {success: false, errorMessage: error.message}
        }
    }

    const getCurrentUser = computed(() => currentUser.value)
    const getIsAuthInitialized = computed(() => isAuthInitialized.value)
    const getIsAuthenticated = computed(() => currentUser.value !== null)


    return {
        currentUser,
        isAuthInitialized,
        getIsAuthenticated,
        waitForAuthInitialization,
        register,
        logInWithEmailAndPassword,
        logInWithEmailLink,
        onLogInWithEmailLinkRedirect,
        logOut,
        getCurrentUser,
        getIsAuthInitialized
    }
})