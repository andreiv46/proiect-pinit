import admin, {ServiceAccount} from "firebase-admin";
import serviceAccount from "../../../proiect-tic-credentials.json"

// @ts-ignore
admin.initializeApp({
    credential: admin.credential.cert(serviceAccount as ServiceAccount)
})

const db = admin.firestore()

export default db