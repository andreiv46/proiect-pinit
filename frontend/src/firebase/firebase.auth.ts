import {
    createUserWithEmailAndPassword,
    isSignInWithEmailLink,
    sendSignInLinkToEmail,
    signInWithEmailLink,
    onAuthStateChanged,
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

let currentUser: User | null = null
let authInitialized = false;

export function waitForAuthInitialization(): Promise<void> {
    return new Promise((resolve) => {
        if (authInitialized) {
            resolve();
            return;
        }
        onAuthStateChanged(auth, (user) => {
            authInitialized = true;
            currentUser = user
            resolve();
        });
    });
}

export const authService = {
    async register(input: RegisterInput): Promise<Result> {
        try {
            const credentials = await createUserWithEmailAndPassword(auth, input.email, input.password);
            console.log(credentials.user);
            return { success: true };
        } catch (error: any) {
            console.error("Registration failed", error.message);
            return { success: false, errorMessage: error.message };
        }
    },
    async signInWithEmailLink(email: string): Promise<Result> {
        try {
            await sendSignInLinkToEmail(auth, email, actionCodeSettings);
            window.localStorage.setItem("emailForSignIn", email);
            return { success: true };
        } catch (error: any) {
            console.error("Sign-in link sending failed", error.message);
            return { success: false, errorMessage: error.message };
        }
    },
    async onSignInWithEmailLinkRedirect(): Promise<Result> {
        if (isSignInWithEmailLink(auth, window.location.href)) {
            let email = window.localStorage.getItem("emailForSignIn");
            if (!email) {
                email = window.prompt("Please provide your email for confirmation");
            }
            try {
                const result = await signInWithEmailLink(auth, email!, window.location.href);
                window.localStorage.removeItem("emailForSignIn");
                signInChannel.postMessage({ type: "SIGNIN_SUCCESSFUL" } as BroadcastMessage);
                console.log(result.user);
                return { success: true };
            } catch (error: any) {
                console.error("Sign-in failed", error.message);
                return { success: false, errorMessage: error.message };
            }
        }
        return { success: false, errorMessage: "Not a valid sign-in link" };
    },
    isAuthenticated(): boolean {
        return currentUser !== null
    },
    getCurrentUser(): User | null {
        return currentUser
    }
}