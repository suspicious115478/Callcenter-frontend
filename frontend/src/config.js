// src/config.js
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getDatabase } from "firebase/database";
export const BACKEND_URL = "https://callcenter-baclend.onrender.com";

// ⚠️ IMPORTANT: Replace these with your actual Firebase Project Configuration
const firebaseConfig = {
  apiKey: "YOUR_FIREBASE_API_KEY", // <-- REPLACE THIS
  authDomain: "YOUR_PROJECT_ID.firebaseapp.com", // <-- REPLACE THIS
  projectId: "YOUR_PROJECT_ID", // <-- REPLACE THIS
  storageBucket: "YOUR_PROJECT_ID.appspot.com",
  messagingSenderId: "YOUR_SENDER_ID",
  appId: "YOUR_APP_ID"
};

// Initialize Firebase App
export const app = initializeApp(firebaseConfig);

// Initialize Firebase Authentication and get a reference to the service
export const auth = getAuth(app);

export const database = getDatabase(app);

