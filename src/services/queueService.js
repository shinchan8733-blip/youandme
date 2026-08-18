import { db } from '../config/firebase'
import {
  ref,
  remove,
  onValue,
  set
} from 'firebase/database'
import { getCurrentUser } from './authService'

export const addToQueue = (song) => {
  const user = getCurrentUser()
  return set(ref(db, `queue/${song.id}`), {
    ...song,
    addedBy: user?.email?.split('@')[0] ?? 'unknown',
    addedAt: Date.now()
  })
}

export const removeFromQueue = (songId) =>
  remove(ref(db, `queue/${songId}`))

export const observeQueue = (callback) =>
  onValue(ref(db, 'queue'), (snapshot) => {
    const data = snapshot.val()
    if (!data) return callback([])
    const songs = Object.values(data).sort((a, b) => a.addedAt - b.addedAt)
    callback(songs)
  })

export const addToOurSongs = (song) =>
  set(ref(db, `ourSongs/${song.id}`), { ...song, isFavorite: true })

export const removeFromOurSongs = (songId) =>
  remove(ref(db, `ourSongs/${songId}`))

export const observeOurSongs = (callback) =>
  onValue(ref(db, 'ourSongs'), (snapshot) => {
    const data = snapshot.val()
    if (!data) return callback([])
    const songs = Object.values(data).sort((a, b) => b.addedAt - a.addedAt)
    callback(songs)
  })