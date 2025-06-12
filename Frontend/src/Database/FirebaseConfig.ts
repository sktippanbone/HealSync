import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";
import { getStorage } from "firebase/storage";


const firebaseConfig = {
  apiKey: "AIzaSyCBEfRtEiUtj1Vk5k52g7aC9vEUalqsyDs",
  authDomain: "cavista-hackethon.firebaseapp.com",
  projectId: "cavista-hackethon",
  storageBucket: "cavista-hackethon.firebasestorage.app",
  messagingSenderId: "628027127143",
  appId: "1:628027127143:web:8ec8c2bcca60369740ebc2",
  measurementId: "G-RPL4TEXLGZ"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
// const app = initializeApp(firebaseConfig);

// Export Firestore instance
export const db = getFirestore(app);

// Initialize Firebase Authentication and export it
export const auth = getAuth(app);

// Export the Google Auth provider
// export const googleProvider = new GoogleAuthProvider();

export const imgDB = getStorage(app);

// export const resDB = getStorage(app);