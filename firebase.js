// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getFirestore } from "firebase/firestore";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyAmwQQCmqg7EpUv7tL0LAtHGV5yCmS5Ji4",
  authDomain: "inventory-management-da458.firebaseapp.com",
  projectId: "inventory-management-da458",
  storageBucket: "inventory-management-da458.appspot.com",
  messagingSenderId: "62493658692",
  appId: "1:62493658692:web:bdca51199bd84fbc03b611",
  measurementId: "G-WBSW8C99KX"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
const firestore = getFirestore(app);

export { firestore };