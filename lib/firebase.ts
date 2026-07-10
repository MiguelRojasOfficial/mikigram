import { initializeApp, getApps, getApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
    apiKey: "AIzaSyCkyTY2fXl52X5eQsOLGk-YtUadzMUE8lQ",
    authDomain: "mikigram-1.firebaseapp.com",
    projectId: "mikigram-1",
    storageBucket: "mikigram-1.firebasestorage.app",
    messagingSenderId: "968812438114",
    appId: "1:968812438114:web:5aacfdb8c4fe8ff4c2673b"
};

const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);
const auth = getAuth(app)
const db = getFirestore(app)
const storage = getStorage(app)

export { app, auth, db, storage };