import { db, storage } from '../config/firebase'
import { ref as dbRef, push, onValue, off } from 'firebase/database'
import { ref as storageRef, uploadBytes, getDownloadURL } from 'firebase/storage'
import { getCurrentUser } from './authService'

export const addTextNote = async (text) => {
  const user = getCurrentUser()
  const notesRef = dbRef(db, 'notes')
  await push(notesRef, {
    type: 'text',
    content: text,
    addedBy: user?.email?.split('@')[0] || 'unknown',
    createdAt: Date.now()
  })
}

export const addVoiceNote = async (audioBlob) => {
  const user = getCurrentUser()
  const fileName = `voice-notes/${Date.now()}-${user?.uid || 'anon'}.webm`
  const fileRef = storageRef(storage, fileName)
  await uploadBytes(fileRef, audioBlob)
  const url = await getDownloadURL(fileRef)

  const notesRef = dbRef(db, 'notes')
  await push(notesRef, {
    type: 'voice',
    url,
    addedBy: user?.email?.split('@')[0] || 'unknown',
    createdAt: Date.now()
  })
}

export const observeNotes = (callback) => {
  const notesRef = dbRef(db, 'notes')
  const listener = onValue(notesRef, (snapshot) => {
    const data = snapshot.val() || {}
    const notes = Object.entries(data).map(([id, note]) => ({ id, ...note }))
    notes.sort((a, b) => a.createdAt - b.createdAt)
    callback(notes)
  })
  return () => off(notesRef, 'value', listener)
}