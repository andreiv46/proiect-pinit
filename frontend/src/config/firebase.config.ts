import {initializeApp} from 'firebase/app'
import firebaseConfig from '../../firebase-config.json'
import {getAuth} from 'firebase/auth/cordova'

const firebaseApp = initializeApp(firebaseConfig)
const auth = getAuth(firebaseApp)

export {auth}