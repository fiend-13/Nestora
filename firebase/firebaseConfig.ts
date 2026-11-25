
import { initializeApp, getApp, getApps } from 'firebase/app';

import {
  initializeAuth,
  getAuth,
  getReactNativePersistence,
  type Auth,
} from 'firebase/auth';

import AsyncStorage from '@react-native-async-storage/async-storage';

import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: 'AIzaSyCy8rqBmkYAJmw9dRATH5vePQHBfR2zV5w',
  authDomain: 'neeraj-ac3d7.firebaseapp.com',
  projectId: 'neeraj-ac3d7',
  storageBucket: 'neeraj-ac3d7.firebasestorage.app',
  messagingSenderId: '176458507472',
  appId: '1:176458507472:web:d7423323f8ccf4620fead5',
  measurementId: 'G-VPDZKXEP8V',
};

const app = getApps().length === 0
  ? initializeApp(firebaseConfig)
  : getApp();

let auth: Auth;

try {
  auth = initializeAuth(app, {
    persistence: getReactNativePersistence(AsyncStorage),
  });
} catch {
  auth = getAuth(app);
}

const db = getFirestore(app);

export { app, auth, db };
