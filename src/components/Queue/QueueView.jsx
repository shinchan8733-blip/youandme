import { useState } from 'react'
import { removeFromQueue, addToOurSongs } from '../../services/queueService'
import SearchView from './SearchView'

export default function QueueView({ queue, currentSong, onPlaySong }) {
  const [showSearch, setShowSearch] = useState(false)
  const [openMenuId, setOpenMenuId] = useState(null)

  return (
    <div className="flex flex-col min-h-screen bg-background pt-12">
      <div className="flex items-center justify-between px-5 mb-4">
        <h1 className="text-white text-2xl font-bold">Queue</h1>
        <button
          onClick={() => setShowSearch(true)}
          className="text-accent text-4xl leading-none"
        >
          +
        </button>
      </div>

      {queue.length === 0 ? (
        <div className="flex flex-col items-center justify-center flex-1 gap-3 text-subtext">
          <span className="text-5xl">🎶</span>
          <p>Your queue is empty</p>
          <p className="text-sm opacity-70">Tap + to add songs</p>
        </div>
      ) : (
        <div className="flex-1 overflow-y-auto px-4 space-y-2">
          {queue.map((song) => (
            <div
              key={song.id}
              className={`flex items-center gap-3 p-3 rounded-xl relative ${
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
                <p className={`font-semibold text-sm truncate ${
                  currentSong?.id === song.id ? 'text-accent' : 'text-white'
                }`}>
                  {song.title}
                </p>
                <p className="text-subtext text-xs truncate">{song.artist}</p>
                <p className="text-subtext text-xs">by {song.addedBy}</p>
              </div>
              {currentSong?.id === song.id && (
                <span className="text-accent text-xs">♫</span>
              )}
              <button
                onClick={() => setOpenMenuId(openMenuId === song.id ? null : song.id)}
                className="text-subtext text-xl px-1"
              >
                ⋮
              </button>
              {openMenuId === song.id && (
                <div className="absolute right-4 top-12 bg-surface border border-white/10 rounded-xl overflow-hidden z-10 shadow-xl">
                  <button
                    onClick={() => { addToOurSongs(song); setOpenMenuId(null) }}
                    className="block w-full text-left px-4 py-3 text-white text-sm"
                  >
                    ♥ Save to Our Songs
                  </button>
                  <button
                    onClick={() => { removeFromQueue(song.id); setOpenMenuId(null) }}
                    className="block w-full text-left px-4 py-3 text-red-400 text-sm"
                  >
                    Remove
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {showSearch && <SearchView onClose={() => setShowSearch(false)} />}
    </div>
  )
}