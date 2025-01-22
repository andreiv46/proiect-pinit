import admin, {ServiceAccount} from 'firebase-admin'
import serviceAccount from '../../../proiect-tic-credentials.json'

// @ts-ignore
const app = admin.initializeApp({
    credential: admin.credential.cert(serviceAccount as ServiceAccount)
})

export default app