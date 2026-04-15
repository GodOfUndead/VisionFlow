import { 
  collection, 
  addDoc, 
  query, 
  where, 
  onSnapshot, 
  orderBy,
  doc,
  deleteDoc,
  updateDoc
} from 'firebase/firestore';
import { db, auth } from '@/src/firebase';
import { PatientRecord, PatientRecordInput } from '@/src/types';

export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId: string | undefined;
    email: string | null | undefined;
    emailVerified: boolean | undefined;
    isAnonymous: boolean | undefined;
    tenantId: string | null | undefined;
    providerInfo: any[];
  }
}

function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null) {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
      isAnonymous: auth.currentUser?.isAnonymous,
      tenantId: auth.currentUser?.tenantId,
      providerInfo: auth.currentUser?.providerData.map(provider => ({
        providerId: provider.providerId,
        displayName: provider.displayName,
        email: provider.email,
        photoUrl: provider.photoURL
      })) || []
    },
    operationType,
    path
  }
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

const COLLECTION_NAME = 'patients';

export const patientService = {
  async addRecord(input: PatientRecordInput) {
    if (!auth.currentUser) throw new Error('User not authenticated');
    
    const path = COLLECTION_NAME;
    try {
      const docRef = await addDoc(collection(db, path), {
        ...input,
        uid: auth.currentUser.uid,
        createdAt: Date.now(),
      });
      return docRef.id;
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, path);
    }
  },

  subscribeToRecords(callback: (records: PatientRecord[]) => void) {
    if (!auth.currentUser) return () => {};
    
    const path = COLLECTION_NAME;
    const q = query(
      collection(db, path),
      where('uid', '==', auth.currentUser.uid),
      orderBy('createdAt', 'desc')
    );

    return onSnapshot(q, (snapshot) => {
      const records = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as PatientRecord[];
      callback(records);
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, path);
    });
  },

  async deleteRecord(id: string) {
    const path = `${COLLECTION_NAME}/${id}`;
    try {
      await deleteDoc(doc(db, COLLECTION_NAME, id));
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, path);
    }
  }
};
