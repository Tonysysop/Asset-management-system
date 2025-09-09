// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyB0BFmP0zRYEUDEKa8Rh9HmcEsVrvqSRVg",
  authDomain: "assetmanagementsystem-7357c.firebaseapp.com",
  projectId: "assetmanagementsystem-7357c",
  storageBucket: "assetmanagementsystem-7357c.firebasestorage.app",
  messagingSenderId: "293684718523",
  appId: "1:293684718523:web:95a86ff1406fffca25f29e",
  measurementId: "G-4NL9YF28N4",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firestore
export const db = getFirestore(app);

// Initialize Firebase Auth
export const auth = getAuth(app);
