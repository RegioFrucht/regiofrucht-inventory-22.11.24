import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyBGjLW1fvhBGAUGCXljrY6R14twWRQsvks",
  authDomain: "inventory-management-app-bd249.firebaseapp.com",
  projectId: "inventory-management-app-bd249",
  storageBucket: "inventory-management-app-bd249.appspot.com",
  messagingSenderId: "575003243277",
  appId: "1:575003243277:web:e93b764808fe7324713644"
};

// Firebase initialisieren
const app = initializeApp(firebaseConfig);

// Firestore initialisieren und exportieren
export const db = getFirestore(app);