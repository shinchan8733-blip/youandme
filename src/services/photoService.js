import { db } from '../config/firebase'
import { ref as dbRef, push, onValue, off } from 'firebase/database'
import { getCurrentUser } from './authService'
import { roomPath } from './roomContext'

export const addPhoto = async (base64Image) => {
  const user = getCurrentUser()
  const photosRef = dbRef(db, roomPath('photos'))
  await push(photosRef, {
    imageData: base64Image,
    addedBy: user?.email?.split('@')[0] || 'unknown',
    createdAt: Date.now()
  })
}

export const observePhotos = (callback) => {
  const photosRef = dbRef(db, roomPath('photos'))
  const listener = onValue(photosRef, (snapshot) => {
    const data = snapshot.val() || {}
    const photos = Object.entries(data).map(([id, p]) => ({ id, ...p }))
    photos.sort((a, b) => b.createdAt - a.createdAt)
    callback(photos)
  })
  return () => off(photosRef, 'value', listener)
}