import { initializeApp } from 'firebase/app'
import { getAuth } from 'firebase/auth'
import { getDatabase } from 'firebase/database'

const firebaseConfig = {
  apiKey: "AIzaSyB8M46YZwx37Z2d_Bs_uU6vX-9vpmW9IyQ",
  authDomain: "you-and-me-acd13.firebaseapp.com",
  databaseURL: "https://you-and-me-acd13-default-rtdb.asia-southeast1.firebasedatabase.appp",
  projectId: "you-and-me-acd13",
  storageBucket: "you-and-me-acd13.firebasestorage.app",
  messagingSenderId: "639146623095",
  appId: "1:639146623095:web:1756f0bb619729da1b8672"
}

const app = initializeApp(firebaseConfig)
export const auth = getAuth(app)
export const db = getDatabase(app)