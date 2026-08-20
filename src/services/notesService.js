import { db } from '../config/firebase'
import { ref as dbRef, push, onValue, off } from 'firebase/database'
import { getCurrentUser } from './authService'
import { roomPath } from './roomContext'

export const addTextNote = async (text) => {
  const user = getCurrentUser()
  const notesRef = dbRef(db, roomPath('notes'))
  await push(notesRef, {
    type: 'text',
    content: text,
    addedBy: user?.email?.split('@')[0] || 'unknown',
    createdAt: Date.now()
  })
}

export const addVoiceNote = async (base64Audio, mimeType) => {
  const user = getCurrentUser()
  const notesRef = dbRef(db, roomPath('notes'))
  await push(notesRef, {
    type: 'voice',
    audioData: base64Audio,
    mimeType,
    addedBy: user?.email?.split('@')[0] || 'unknown',
    createdAt: Date.now()
  })
}

export const observeNotes = (callback) => {
  const notesRef = dbRef(db, roomPath('notes'))
  const listener = onValue(notesRef, (snapshot) => {
    const data = snapshot.val() || {}
    const notes = Object.entries(data).map(([id, note]) => ({ id, ...note }))
    notes.sort((a, b) => a.createdAt - b.createdAt)
    callback(notes)
  })
  return () => off(notesRef, 'value', listener)
}