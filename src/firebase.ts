import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider, signInWithPopup, signOut } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import firebaseConfig from '@/firebase-applet-config.json';

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app, firebaseConfig.firestoreDatabaseId);
export const googleProvider = new GoogleAuthProvider();

export const loginWithGoogle = async () => {
  try {
    return await signInWithPopup(auth, googleProvider);
  } catch (error: any) {
    console.error("Login Error:", error.code, error.message);
    if (error.code === 'auth/unauthorized-domain') {
      alert(`Domain not authorized. Please add this domain to your Firebase Console: ${window.location.hostname}`);
    }
    throw error;
  }
};
export const logout = () => signOut(auth);
