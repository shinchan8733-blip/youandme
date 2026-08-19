import { db } from '../config/firebase'
import { ref as dbRef, push, query, orderByChild, limitToLast, onValue, off } from 'firebase/database'
import { getCurrentUser } from './authService'

export const logPlay = async (song) => {
  const user = getCurrentUser()
  const historyRef = dbRef(db, 'history')
  await push(historyRef, {
    songId: song.id,
    title: song.title,
    artist: song.artist,
    thumbnail: song.thumbnail || '',
    playedBy: user?.email?.split('@')[0] || 'unknown',
    playedAt: Date.now()
  })
}

export const observeHistory = (callback) => {
  const historyRef = query(dbRef(db, 'history'), orderByChild('playedAt'), limitToLast(200))
  const listener = onValue(historyRef, (snapshot) => {
    const data = snapshot.val() || {}
    const items = Object.entries(data).map(([id, item]) => ({ id, ...item }))
    items.sort((a, b) => b.playedAt - a.playedAt)
    callback(items)
  })
  return () => off(historyRef, 'value', listener)
}