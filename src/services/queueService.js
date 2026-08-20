import { db } from '../config/firebase'
import {
  ref,
  remove,
  onValue,
  set
} from 'firebase/database'
import { getCurrentUser } from './authService'
import { roomPath } from './roomContext'

export const addToQueue = (song) => {
  const user = getCurrentUser()
  return set(ref(db, `${roomPath('queue')}/${song.id}`), {
    ...song,
    addedBy: user?.email?.split('@')[0] ?? 'unknown',
    addedAt: Date.now()
  })
}

export const removeFromQueue = (songId) =>
  remove(ref(db, `${roomPath('queue')}/${songId}`))

export const observeQueue = (callback) =>
  onValue(ref(db, roomPath('queue')), (snapshot) => {
    const data = snapshot.val()
    if (!data) return callback([])
    const songs = Object.values(data).sort((a, b) => a.addedAt - b.addedAt)
    callback(songs)
  })

export const addToOurSongs = (song) =>
  set(ref(db, `${roomPath('ourSongs')}/${song.id}`), { ...song, isFavorite: true })

export const removeFromOurSongs = (songId) =>
  remove(ref(db, `${roomPath('ourSongs')}/${songId}`))

export const observeOurSongs = (callback) =>
  onValue(ref(db, roomPath('ourSongs')), (snapshot) => {
    const data = snapshot.val()
    if (!data) return callback([])
    const songs = Object.values(data).sort((a, b) => b.addedAt - a.addedAt)
    callback(songs)
  })