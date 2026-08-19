import { db } from '../config/firebase'
import { ref as dbRef, push, set, remove, onValue, off } from 'firebase/database'
import { getCurrentUser } from './authService'

export const createGenre = async (name) => {
  const genresRef = dbRef(db, 'genres')
  const newRef = push(genresRef)
  await set(newRef, {
    name,
    createdAt: Date.now(),
    createdBy: getCurrentUser()?.email?.split('@')[0] || 'unknown'
  })
  return newRef.key
}

export const deleteGenre = async (genreId) => {
  await remove(dbRef(db, `genres/${genreId}`))
}

export const addSongToGenre = async (genreId, song) => {
  const songsRef = dbRef(db, `genres/${genreId}/songs`)
  const newRef = push(songsRef)
  await set(newRef, {
    songId: song.id,
    title: song.title,
    artist: song.artist,
    thumbnail: song.thumbnail || '',
    addedAt: Date.now()
  })
}

export const removeSongFromGenre = async (genreId, songKey) => {
  await remove(dbRef(db, `genres/${genreId}/songs/${songKey}`))
}

export const observeGenres = (callback) => {
  const genresRef = dbRef(db, 'genres')
  const listener = onValue(genresRef, (snapshot) => {
    const data = snapshot.val() || {}
    const genres = Object.entries(data).map(([id, g]) => ({
      id,
      name: g.name,
      createdAt: g.createdAt,
      songs: g.songs ? Object.entries(g.songs).map(([key, s]) => ({ key, ...s })) : []
    }))
    genres.sort((a, b) => a.name.localeCompare(b.name))
    callback(genres)
  })
  return () => off(genresRef, 'value', listener)
}