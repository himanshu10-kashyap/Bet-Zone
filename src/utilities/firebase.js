import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";


const firebaseConfig = {
    apiKey: "AIzaSyBZQJrXdThPqxxdZonU7nq3obWA6OXM9Ig",
    authDomain: "color-game-6ee12.firebaseapp.com",
    projectId: "color-game-6ee12",
    storageBucket: "color-game-6ee12.firebasestorage.app",
    messagingSenderId: "942283542981",
    appId: "1:942283542981:web:85040e024b8d73351ffbac"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

export { db };


