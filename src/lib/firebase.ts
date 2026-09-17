import { initializeApp } from 'firebase/app';
import { getFirestore, initializeFirestore, persistentLocalCache } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';

const firebaseConfig = {
  apiKey: "AIzaSyC3TYrwd2XGvn_UN6C1aWfYfwNQg9F3lws",
  authDomain: "extreme-ally-2pp0d.firebaseapp.com",
  projectId: "extreme-ally-2pp0d",
  storageBucket: "extreme-ally-2pp0d.firebasestorage.app",
  messagingSenderId: "676483330783",
  appId: "1:676483330783:web:856f0a80142f5c0306ef6a",
};

export const app = initializeApp(firebaseConfig);
// Using custom database ID created by AI Studio
export const db = initializeFirestore(app, {
  localCache: persistentLocalCache(),
  experimentalForceLongPolling: true
}, "ai-studio-buildviewer-1b939f2b-63e9-4cbb-bc4b-da7f21b40f68");
export const auth = getAuth(app);
