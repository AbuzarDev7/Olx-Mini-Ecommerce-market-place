import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth, GoogleAuthProvider } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyDSlLQfHEyAUoTXe25DVgQzvg--5LR2CGI",
  authDomain: "authentication-twitter-x.firebaseapp.com",
  projectId: "authentication-twitter-x",
  storageBucket: "authentication-twitter-x.firebasestorage.app",
  messagingSenderId: "254252389671",
  appId: "1:254252389671:web:9735eab6cc1c0c1a488502",
  measurementId: "G-1C7B5F6N6W"
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const auth = getAuth(app);
export const provider = new GoogleAuthProvider();
