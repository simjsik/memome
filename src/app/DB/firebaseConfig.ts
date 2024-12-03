// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics, isSupported } from "firebase/analytics";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";
import { getStorage } from "firebase/storage";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
    apiKey: "AIzaSyAYjWcc0HEYai3JdwG-Ejia9l4S4z2I9DM",
    authDomain: "meloudy-96af8.firebaseapp.com",
    projectId: "meloudy-96af8",
    storageBucket: "meloudy-96af8.appspot.com",
    messagingSenderId: "640370611193",
    appId: "1:640370611193:web:22065b149e9141cbd8e328",
    measurementId: "G-1XV8606GP6"
};

let analytics;
if (typeof window !== "undefined") {
    isSupported().then((supported) => {
        if (supported) {
            analytics = getAnalytics(app);
        }
    });
} // Firebase Analytics는 브라우저 환경에서만 사용할 수 있기때문에 설정

const app = initializeApp(firebaseConfig); // Firebase 초기화
export const storage = getStorage(app);
export const auth = getAuth(app);          // Firebase Auth 인스턴스
export const db = getFirestore(app);       // Firestore 인스턴스

