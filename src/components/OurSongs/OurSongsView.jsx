import { useState, useEffect } from 'react'
import { observeOurSongs, removeFromOurSongs } from '../../services/queueService'

export default function OurSongsView({ currentSong, onPlaySong, onAddToQueue }) {
  const [songs, setSongs] = useState([])

  useEffect(() => {
    const unsub = observeOurSongs(setSongs)
    return unsub
  }, [])

  return (
    <div className="flex flex-col min-h-screen bg-background pt-12">
      <div className="flex items-center gap-2 px-5 mb-5">
        <h1 className="text-white text-2xl font-bold">Our Songs</h1>
        <span className="text-accent text-xl">♥</span>
      </div>

      {songs.length === 0 ? (
        <div className="flex flex-col items-center justify-center flex-1 gap-3 text-subtext px-8">
          <span className="text-5xl">🎵</span>
          <p className="text-center">No saved songs yet</p>
          <p className="text-sm opacity-70 text-center">
            Tap ⋮ on any song in the queue and save it here
          </p>
        </div>
      ) : (
        <div className="flex-1 overflow-y-auto px-4 space-y-2">
          {songs.map(song => (
            <div
              key={song.id}
              className={`flex items-center gap-3 p-3 rounded-xl ${
                currentSong?.id === song.id ? 'bg-accent/20' : 'bg-surface/50'
              }`}
            >
              <img
                src={song.thumbnail}
                alt={song.title}
                className="w-14 h-14 rounded-lg object-cover flex-shrink-0"
                onClick={() => onPlaySong(song)}
              />
              <div className="flex-1 min-w-0" onClick={() => onPlaySong(song)}>
                <p className={`text-sm font-semibold truncate ${
                  currentSong?.id === song.id ? 'text-accent' : 'text-white'
                }`}>
                  {song.title}
                </p>
                <p className="text-subtext text-xs truncate">{song.artist}</p>
              </div>
              <div className="flex gap-3">
                <button
                  onClick={() => onAddToQueue(song)}
                  className="text-accent text-xl"
                  title="Add to queue"
                >
                  +
                </button>
                <button
                  onClick={() => removeFromOurSongs(song.id)}
                  className="text-subtext text-xl"
                  title="Remove"
                >
                  ✕
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}