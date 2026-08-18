import { auth } from '../config/firebase'
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut as firebaseSignOut,
  onAuthStateChanged
} from 'firebase/auth'

export const signIn = (email, password) =>
  signInWithEmailAndPassword(auth, email, password)

export const signUp = (email, password) =>
  createUserWithEmailAndPassword(auth, email, password)

export const signOut = () => firebaseSignOut(auth)

export const onAuthChange = (callback) =>
  onAuthStateChanged(auth, callback)

export const getCurrentUser = () => auth.currentUser