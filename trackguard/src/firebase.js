// firebase.js
import { initializeApp } from 'firebase/app';
import { getDatabase } from 'firebase/database';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore'; // Import Firestore

const firebaseConfig = {
  apiKey: "AIzaSyBn9m8VH43GFrlIHN1dgBmlY-3BgdwjCDs",
  authDomain: "track-guard.firebaseapp.com",
  databaseURL: "https://track-guard-default-rtdb.firebaseio.com",
  projectId: "track-guard",
  storageBucket: "track-guard.appspot.com",
  messagingSenderId: "1024269638309",
  appId: "1:1024269638309:web:6aea15e6899d7ea5388b4c"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getDatabase(app); // Get the Realtime Database
const auth = getAuth(app); // Get the authentication
const firestoreDb = getFirestore(app); // Get Firestore

export { db, auth, firestoreDb }; // Export Firestore db as well
