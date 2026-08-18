import { useState } from 'react'
import { searchSongs } from '../../services/youtubeService'
import { addToQueue } from '../../services/queueService'

export default function SearchView({ onClose }) {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState([])
  const [loading, setLoading] = useState(false)
  const [added, setAdded] = useState(new Set())

  const handleSearch = async () => {
    if (!query.trim()) return
    setLoading(true)
    try {
      const songs = await searchSongs(query)
      setResults(songs)
    } catch (e) {
      console.error(e)
    }
    setLoading(false)
  }

  const handleAdd = async (song) => {
    await addToQueue(song)
    setAdded(prev => new Set(prev).add(song.id))
  }

  return (
    <div className="fixed inset-0 bg-background z-50 flex flex-col pt-12">
      <div className="flex items-center gap-3 px-4 mb-4">
        <button onClick={onClose} className="text-subtext text-2xl">✕</button>
        <h2 className="text-white text-xl font-bold">Add Songs</h2>
      </div>

      <div className="px-4 mb-4">
        <div className="flex gap-2">
          <input
            type="text"
            placeholder="Search songs..."
            value={query}
            onChange={e => setQuery(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleSearch()}
            className="flex-1 px-4 py-3 bg-surface rounded-xl text-white placeholder-subtext outline-none focus:ring-2 focus:ring-accent"
            autoFocus
          />
          <button
            onClick={handleSearch}
            className="px-5 py-3 bg-accent rounded-xl text-white font-semibold"
          >
            Go
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-4 space-y-2">
        {loading ? (
          <div className="flex justify-center pt-12">
            <div className="w-8 h-8 border-2 border-accent border-t-transparent rounded-full animate-spin" />
          </div>
        ) : (
          results.map(song => (
            <div key={song.id} className="flex items-center gap-3 bg-surface rounded-xl p-3">
              <img
                src={song.thumbnail}
                alt={song.title}
                className="w-14 h-14 rounded-lg object-cover flex-shrink-0"
              />
              <div className="flex-1 min-w-0">
                <p className="text-white text-sm font-semibold truncate">{song.title}</p>
                <p className="text-subtext text-xs truncate">{song.artist}</p>
              </div>
              <button
                onClick={() => handleAdd(song)}
                disabled={added.has(song.id)}
                className={`px-4 py-2 rounded-lg text-sm font-semibold transition-colors ${
                  added.has(song.id)
                    ? 'bg-green-500/20 text-green-400'
                    : 'bg-accent text-white'
                }`}
              >
                {added.has(song.id) ? '✓' : '+'}
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  )
}