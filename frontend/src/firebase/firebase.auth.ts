import {
    createUserWithEmailAndPassword,
    isSignInWithEmailLink,
    sendSignInLinkToEmail,
    signInWithEmailLink,
    User
} from "firebase/auth/cordova"
import {auth} from "./firebase.config.ts"
import {BroadcastMessage, signInChannel} from "../config/broadcast.config.ts"

export interface RegisterInput {
    name: string,
    email: string,
    password: string
}

export interface Result {
    success: boolean,
    errorMessage?: string
}

const actionCodeSettings = {
    url: 'http://localhost:5173/signInResult',
    handleCodeInApp: true,
};

export const authService = {
    async register(input: RegisterInput): Promise<Result> {
        createUserWithEmailAndPassword(auth, input.email, input.password)
            .then((credentials) => {
                console.log(credentials.user)
            })
            .catch((error) => {
                return {success: false, errorMessage: error.message} as Result
            })
        return {success: true} as Result
    },
    async signInWithEmailLink(email: string): Promise<Result> {
        sendSignInLinkToEmail(auth, email, actionCodeSettings)
            .then(() => {
                window.localStorage.setItem('emailForSignIn', email)
            })
            .catch((error) => {
                console.error(error.code, error.message)
                return {success: false, errorMessage: error.message} as Result
            });
        return {success: true} as Result
    },
    async onSignInWithEmailLinkRedirect(): Promise<Result> {
        if (isSignInWithEmailLink(auth, window.location.href)) {
            let email = window.localStorage.getItem('emailForSignIn')
            if (!email) {
                email = window.prompt('Please provide your email for confirmation')
            }
            signInWithEmailLink(auth, email!, window.location.href)
                .then((result) => {
                    window.localStorage.removeItem('emailForSignIn')
                    signInChannel.postMessage({type: "SIGNIN_SUCCESSFUL"} as BroadcastMessage)
                    console.log(result.user)
                })
                .catch((error) => {
                    console.error(error.message)
                    return {success: false, errorMessage: error.message} as Result
                });
        }
        return {success: true} as Result
    },
    isAuthenticated(): boolean {
        return auth.currentUser !== null
    },
    getCurrentUser(): User | null {
        return auth.currentUser
    }
}