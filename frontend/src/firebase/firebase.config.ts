import {initializeApp} from "firebase/app"
import { getAnalytics } from "firebase/analytics"
import firebaseConfig from "../../firebase-config.json"
import {getAuth} from "firebase/auth/cordova";

const firebaseApp = initializeApp(firebaseConfig)
const analytics = getAnalytics(firebaseApp)
const auth = getAuth(firebaseApp)

export {auth, analytics}