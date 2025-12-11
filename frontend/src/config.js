// src/config.js
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getDatabase } from "firebase/database";

export const BACKEND_URL = "https://callcenter-baclend.onrender.com";

// ⚠️ IMPORTANT: You MUST fill in the API Key, App ID, and Sender ID yourself!
// These values are public but required for the client-side SDKs to function.
const PROJECT_ID = "project-881213603547772658"; // Extracted from your key

const firebaseConfig = {
    // 🛑 REQUIRED: Replace this with your actual Web API Key from Firebase Console
    apiKey: "AIzaSyBhgsT6lEgV_5ap1L7--HNSrnb3qlyjTyg", 
    
    // Auto-filled based on Project ID
    authDomain: `${PROJECT_ID}.firebaseapp.com`, 
    projectId: PROJECT_ID, 
    storageBucket: `${PROJECT_ID}.appspot.com`,
    
    // 🛑 REQUIRED: Replace this with your actual Messaging Sender ID
    messagingSenderId: "521384541472",
    
    // 🛑 REQUIRED: Replace this with your actual App ID
    appId: "1:521384541472:web:248d25b4ff8af47e672b45",
    
    // Auto-filled for Realtime Database access
    databaseURL: `https://project-8812136035477954307-default-rtdb.firebaseio.com` 
};

// Initialize Firebase App
export const app = initializeApp(firebaseConfig);

// Initialize Firebase Authentication and get a reference to the service
export const auth = getAuth(app);

// Initialize and export Firebase Realtime Database
export const database = getDatabase(app);

