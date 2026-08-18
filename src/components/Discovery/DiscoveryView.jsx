import { useState, useEffect } from 'react'
import { getRecommendations } from '../../services/youtubeService'
import { observeOurSongs } from '../../services/queueService'

export default function DiscoveryView({ onAddToQueue }) {
  const [recommendations, setRecommendations] = useState([])
  const [loading, setLoading] = useState(false)
  const [added, setAdded] = useState(new Set())
  const [songIds, setSongIds] = useState([])

  useEffect(() => {
    const unsub = observeOurSongs((songs) => {
      const ids = songs.map(s => s.id)
      setSongIds(ids)
      if (ids.length > 0) loadRecs(ids)
    })
    return unsub
  }, [])

  const loadRecs = async (ids) => {
    setLoading(true)
    try {
      const recs = await getRecommendations(ids)
      setRecommendations(recs)
    } catch (e) {
      console.error(e)
    }
    setLoading(false)
  }

  const handleAdd = (song) => {
    onAddToQueue(song)
    setAdded(prev => new Set(prev).add(song.id))
  }

  return (
    <div className="flex flex-col min-h-screen bg-background pt-12">
      <div className="flex items-center justify-between px-5 mb-1">
        <h1 className="text-white text-2xl font-bold">Discover</h1>
        <button
          onClick={() => loadRecs(songIds)}
          className="text-accent text-sm"
        >
          Refresh
        </button>
      </div>
      <p className="text-subtext text-sm px-5 mb-5">Based on your shared songs</p>

      {loading ? (
        <div className="flex justify-center pt-20">
          <div className="w-8 h-8 border-2 border-accent border-t-transparent rounded-full animate-spin" />
        </div>
      ) : recommendations.length === 0 ? (
        <div className="flex flex-col items-center justify-center flex-1 gap-3 text-subtext px-8">
          <span className="text-5xl">✨</span>
          <p className="text-center">Save songs to Our Songs to get recommendations here</p>
        </div>
      ) : (
        <div className="flex-1 overflow-y-auto px-4 space-y-2">
          {recommendations.map(song => (
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
                className={`px-4 py-2 rounded-lg text-sm font-semibold ${
                  added.has(song.id) ? 'bg-green-500/20 text-green-400' : 'bg-accent text-white'
                }`}
              >
                {added.has(song.id) ? '✓' : '+'}
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}