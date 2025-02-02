import {firestore} from 'firebase-admin'
import QueryDocumentSnapshot = firestore.QueryDocumentSnapshot
import DocumentSnapshot = firestore.DocumentSnapshot;

export function documentWithId<Type>(doc: QueryDocumentSnapshot | DocumentSnapshot) : Type {
    return {
        id: doc.id,
        ...doc.data()
    } as Type
}