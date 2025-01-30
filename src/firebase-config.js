import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';

const firebaseConfig = {
  apiKey: "AIzaSyBce1IfKRpTyETapTyI8_ZEOKtznPPNnPo",
  authDomain: "minedpro-ee38f.firebaseapp.com",
  projectId: "minedpro-ee38f",
  storageBucket: "minedpro-ee38f.firebasestorage.app",
  messagingSenderId: "313557515214",
  appId: "1:313557515214:web:331f46f680756a5002499f",
  measurementId: "G-JRJPT5Q8JM"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);