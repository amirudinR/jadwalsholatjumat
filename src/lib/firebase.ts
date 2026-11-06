import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

// analytics sengaja tidak dipakai (tidak ada gunanya di sini & menambah beban).
const firebaseConfig = {
  apiKey: 'AIzaSyBLtxHYnIG0E1nivcWGa3LNX1RXewsUpSE',
  authDomain: 'jadwalsholatjumat.firebaseapp.com',
  projectId: 'jadwalsholatjumat',
  storageBucket: 'jadwalsholatjumat.firebasestorage.app',
  messagingSenderId: '690305264968',
  appId: '1:690305264968:web:64fb51e3287146739ad77d',
  measurementId: 'G-XN2HXCPDW5',
};

export const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export const googleProvider = new GoogleAuthProvider();
