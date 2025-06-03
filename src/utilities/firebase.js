import { initializeApp, getApps } from "firebase/app";
import { getFirestore } from "firebase/firestore";

const firebase_Config = {
  apiKey: "AIzaSyBZQJrXdThPqxxdZonU7nq3obWA6OXM9Ig",
  authDomain: "color-game-6ee12.firebaseapp.com",
  projectId: "color-game-6ee12",
  storageBucket: "color-game-6ee12.firebasestorage.app",
  messagingSenderId: "942283542981",
  appId: "1:942283542981:web:cf0ef9b7b05f9f621ffbac"
};

const app = getApps().length === 0 ? initializeApp(firebase_Config) : getApps()[0];

const db = getFirestore(app);

export { db };
