import { useState, useEffect } from 'react'
import { observeHistory } from '../../services/historyService'

function formatDateLabel(ts) {
  const date = new Date(ts)
  const today = new Date()
  const yesterday = new Date()
  yesterday.setDate(today.getDate() - 1)
  const isSameDay = (a, b) => a.toDateString() === b.toDateString()
  if (isSameDay(date, today)) return 'Today'
  if (isSameDay(date, yesterday)) return 'Yesterday'
  return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })
}

export default function HistoryView({ onPlaySong }) {
  const [history, setHistory] = useState([])

  useEffect(() => {
    const unsub = observeHistory(setHistory)
    return unsub
  }, [])

  const groups = history.reduce((acc, item) => {
    const label = formatDateLabel(item.playedAt)
    if (!acc[label]) acc[label] = []
    acc[label].push(item)
    return acc
  }, {})

  return (
    <div className="flex flex-col h-full bg-background px-4 pt-6 pb-4 overflow-y-auto">
      <h2 className="text-white text-xl font-bold mb-4">History</h2>
      {history.length === 0 && (
        <p className="text-subtext text-sm text-center mt-10">Nothing played yet</p>
      )}
      {Object.entries(groups).map(([label, items]) => (
        <div key={label} className="mb-6">
          <p className="text-accent text-xs font-semibold mb-2 uppercase tracking-wide">{label}</p>
          <div className="space-y-2">
            {items.map(item => (
              <button
                key={item.id}
                onClick={() => onPlaySong && onPlaySong({ id: item.songId, title: item.title, artist: item.artist, thumbnail: item.thumbnail })}
                className="w-full flex items-center gap-3 bg-surface rounded-xl p-2 text-left"
              >
                {item.thumbnail ? (
                  <img src={item.thumbnail} alt="" className="w-10 h-10 rounded-lg object-cover shrink-0" />
                ) : (
                  <div className="w-10 h-10 rounded-lg bg-white/10 flex items-center justify-center shrink-0">🎵</div>
                )}
                <div className="min-w-0 flex-1">
                  <p className="text-white text-sm truncate">{item.title}</p>
                  <p className="text-subtext text-xs truncate">{item.artist}</p>
                </div>
                <div className="text-right shrink-0">
                  <p className="text-subtext text-[10px]">
                    {new Date(item.playedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </p>
                  <p className="text-accent text-[10px]">{item.playedBy}</p>
                </div>
              </button>
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}