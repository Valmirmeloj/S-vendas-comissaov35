// Fix: Use named export for initializeApp from firebase/app to comply with Firebase v9+ modular SDK
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: 'AIzaSyAZ6Zp-XRhmJaqyrA806YxGAYo3TyFttpQ',
  authDomain: 'b-dados-sistema.firebaseapp.com',
  projectId: 'b-dados-sistema',
  storageBucket: 'b-dados-sistema.firebasestorage.app',
  messagingSenderId: '725143488446',
  appId: '1:725143488446:web:ab7178929e9c9b8dcf9bef'
};

// Initialize Firebase with the modular SDK initializeApp function
const app = initializeApp(firebaseConfig);

// Initialize Cloud Firestore and export the database reference
export const db = getFirestore(app);