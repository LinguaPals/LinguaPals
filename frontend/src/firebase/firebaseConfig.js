import { initializeApp } from "firebase/app";
import { getAuth } from 'firebase/auth'
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyDrWVOdFuqGEtZZft6fRk-DCsQjcIoT1Pk",
  authDomain: "linguapals-auth.firebaseapp.com",
  projectId: "linguapals-auth",
  storageBucket: "linguapals-auth.firebasestorage.app",
  messagingSenderId: "965244105207",
  appId: "1:965244105207:web:6ca778e2f55a9abedcbef2",
  measurementId: "G-4P4FCWE674"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);