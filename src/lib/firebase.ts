
import { initializeApp, getApp, getApps } from 'firebase/app';
import { getAuth, GoogleAuthProvider, signInWithPopup, signOut } from 'firebase/auth';

const firebaseConfig = {
  projectId: "studio-6736140775-2ec69",
  appId: "1:941814599781:web:08eb765484fc95490bb68c",
  storageBucket: "studio-6736140775-2ec69.firebasestorage.app",
  apiKey: "AIzaSyAgFgZR1Ol1y6yiul-XsgxPx-0o3eGkz_k",
  authDomain: "studio-6736140775-2ec69.firebaseapp.com",
  measurementId: "",
  messagingSenderId: "941814599781"
};

// Initialize Firebase
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
const auth = getAuth(app);
const provider = new GoogleAuthProvider();

export { auth, provider, signInWithPopup, signOut };
