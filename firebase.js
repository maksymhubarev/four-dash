// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyCFukT2fpEboR-0KknlGwi6jfRw0KpXMWo",
  authDomain: "four-app-e3366.firebaseapp.com",
  databaseURL: "https://four-app-e3366-default-rtdb.firebaseio.com",
  projectId: "four-app-e3366",
  storageBucket: "four-app-e3366.appspot.com",
  messagingSenderId: "1077692484840",
  appId: "1:1077692484840:web:fd432fcfe23d3dbd14cd5d",
  measurementId: "G-JKK4QE8Y9X",
};

// Initialize Firebase

const app = initializeApp(firebaseConfig);
// const analytics = getAnalytics(app);

const Auth = getAuth(app);
const firestore = getFirestore(app);

export { app, Auth, firestore };
