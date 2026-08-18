import { db } from '../config/firebase'
import { ref, set, onValue } from 'firebase/database'
import { getCurrentUser } from './authService'

export const broadcastPlayback = (songId, isPlaying, currentTime) => {
  const user = getCurrentUser()
  return set(ref(db, 'playbackState'), {
    songId,
    isPlaying,
    currentTime,
    updatedAt: Date.now(),
    updatedBy: user?.uid ?? ''
  })
}

export const observePlayback = (callback) =>
  onValue(ref(db, 'playbackState'), (snapshot) => {
    const data = snapshot.val()
    if (data) callback(data)
  })