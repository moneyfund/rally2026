import { getApp, getApps, initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

const envOr = (value: string | undefined, fallback: string) => value?.trim() || fallback;

const firebaseConfig = {
  apiKey: envOr(process.env.NEXT_PUBLIC_FIREBASE_API_KEY, "AIzaSyBkUe2BDWkTqrawmqtXQzeWFs2ZWcxrM4c"),
  authDomain: envOr(process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN, "germina-5ffb4.firebaseapp.com"),
  projectId: envOr(process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID, "germina-5ffb4"),
  storageBucket: envOr(process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET, "germina-5ffb4.firebasestorage.app"),
  messagingSenderId: envOr(process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID, "552914022343"),
  appId: envOr(process.env.NEXT_PUBLIC_FIREBASE_APP_ID, "1:552914022343:web:27126d9df596ea6ba7f3e2"),
  measurementId: envOr(process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID, "G-59YBEKYW4C"),
};

export const firebaseApp = getApps().length ? getApp() : initializeApp(firebaseConfig);
export const auth = getAuth(firebaseApp);
export const db = getFirestore(firebaseApp);
export const storage = getStorage(firebaseApp);
