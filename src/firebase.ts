import {initializeApp, getApp, getApps} from 'firebase/app';
import {getAuth} from 'firebase/auth';
import {getFirestore} from 'firebase/firestore';
import {getStorage} from 'firebase/storage';

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || 'AIzaSyCuVbg7rKDNVld2esQN802_E-nNaDFCkKs',
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || 'estore-54368.firebaseapp.com',
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || 'estore-54368',
  storageBucket:
    import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || 'estore-54368.firebasestorage.app',
  messagingSenderId:
    import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || '288440749378',
  appId: import.meta.env.VITE_FIREBASE_APP_ID || '1:288440749378:web:ee7efefa57433f9c884cdb',
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID || 'G-E0L35J2JE9',
};

export const firebaseApp = getApps().length ? getApp() : initializeApp(firebaseConfig);
export const firebaseAuth = getAuth(firebaseApp);
export const firebaseDb = getFirestore(firebaseApp);
export const firebaseStorage = getStorage(firebaseApp);

if (typeof window !== 'undefined') {
  console.info('Firebase connected:', firebaseConfig.projectId);
}
