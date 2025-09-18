
import { initializeApp, getApp, getApps } from 'firebase/app';
import { getAuth, GoogleAuthProvider, sendSignInLinkToEmail, isSignInWithEmailLink, signInWithEmailLink, signOut as firebaseSignOut } from 'firebase/auth';

const firebaseConfig = {
  projectId: "studio-6736140775-2ec69",
  appId: "1:941814599781:web:81f3a24ed534538a0bb68c",
  storageBucket: "studio-6736140775-2ec69.firebasestorage.app",
  apiKey: "AIzaSyAgFgZR1Ol1y6yiul-XsgxPx-0o3eGkz_k",
  authDomain: "studio-6736140775-2ec69.firebaseapp.com",
  measurementId: "G-EM53T3C2XD",
  messagingSenderId: "941814599781"
};

// Initialize Firebase
const app = getApps().length ? getApp() : initializeApp(firebaseConfig);
const auth = getAuth(app);
const provider = new GoogleAuthProvider();

const actionCodeSettings = {
  url: typeof window !== 'undefined' ? `${window.location.origin}` : 'http://localhost:9002',
  handleCodeInApp: true,
};

export { auth, provider, sendSignInLinkToEmail, isSignInWithEmailLink, signInWithEmailLink, firebaseSignOut, actionCodeSettings };
