import {firestore} from "firebase-admin";
import QueryDocumentSnapshot = firestore.QueryDocumentSnapshot;

export function documentWithId<Type>(doc: QueryDocumentSnapshot) : Type {
    return {
        id: doc.id,
        ...doc.data()
    } as Type
}