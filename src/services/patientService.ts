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
import { ADMIN_EMAILS } from '@/src/constants';

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

function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null): Error {
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
  const fullError = new Error(JSON.stringify(errInfo));
  console.error('Firestore Error: ', fullError.message);
  return fullError;
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

  subscribeToRecords(callback: (records: PatientRecord[]) => void, onError?: (error: Error) => void) {
    if (!auth.currentUser) return () => {};
    
    const path = COLLECTION_NAME;
    const isAdmin = auth.currentUser.email ? ADMIN_EMAILS.includes(auth.currentUser.email) : false;
    
    // If admin, show all records. Otherwise show only their own.
    const q = isAdmin 
      ? query(collection(db, path), orderBy('createdAt', 'desc'))
      : query(
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
      const err = handleFirestoreError(error, OperationType.LIST, path);
      if (onError) onError(err);
    });
  },

  async deleteRecord(id: string) {
    const path = `${COLLECTION_NAME}/${id}`;
    try {
      await deleteDoc(doc(db, COLLECTION_NAME, id));
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, path);
    }
  },

  async updateRecord(id: string, input: PatientRecordInput) {
    if (!auth.currentUser) throw new Error('User not authenticated');
    
    const path = `${COLLECTION_NAME}/${id}`;
    try {
      await updateDoc(doc(db, COLLECTION_NAME, id), {
        ...input,
        updatedAt: Date.now(),
      });
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, path);
    }
  }
};
