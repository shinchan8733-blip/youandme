import { useState, useEffect } from 'react'
import { observeGenres, createGenre, deleteGenre, addSongToGenre, removeSongFromGenre } from '../../services/genreService'
import { searchSongs } from '../../services/youtubeService'

export default function GenresView({ onPlaySong }) {
  const [genres, setGenres] = useState([])
  const [newGenreName, setNewGenreName] = useState('')
  const [selectedId, setSelectedId] = useState(null)
  const [query, setQuery] = useState('')
  const [results, setResults] = useState([])
  const [searching, setSearching] = useState(false)

  useEffect(() => {
    const unsub = observeGenres(setGenres)
    return unsub
  }, [])

  const selectedGenre = genres.find(g => g.id === selectedId)

  const handleCreateGenre = async () => {
    if (!newGenreName.trim()) return
    const name = newGenreName.trim()
    setNewGenreName('')
    await createGenre(name)
  }

  const handleSearch = async () => {
    if (!query.trim()) return
    setSearching(true)
    try {
      const songs = await searchSongs(query)
      setResults(songs)
    } finally {
      setSearching(false)
    }
  }

  const handleAddSong = async (song) => {
    await addSongToGenre(selectedId, song)
  }

  const handleDeleteGenre = async (genreId) => {
    if (!window.confirm('Delete this genre folder and all songs in it?')) return
    await deleteGenre(genreId)
    if (selectedId === genreId) setSelectedId(null)
  }

  if (selectedGenre) {
    return (
      <div className="flex flex-col h-full bg-background px-4 pt-6 pb-4 overflow-y-auto">
        <div className="flex items-center gap-2 mb-4">
          <button onClick={() => setSelectedId(null)} className="text-white text-xl">←</button>
          <h2 className="text-white text-xl font-bold">{selectedGenre.name}</h2>
        </div>

        <div className="flex gap-2 mb-4">
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
            placeholder="Search to add a song..."
            className="flex-1 bg-surface rounded-full px-4 py-2 text-white text-sm outline-none"
          />
          <button onClick={handleSearch} className="px-4 py-2 bg-accent rounded-full text-white text-sm shrink-0">
            {searching ? '...' : 'Go'}
          </button>
        </div>

        {results.length > 0 && (
          <div className="space-y-2 mb-6">
            {results.map(song => (
              <div key={song.id} className="flex items-center gap-3 bg-surface rounded-xl p-2">
                {song.thumbnail && <img src={song.thumbnail} alt="" className="w-10 h-10 rounded-lg object-cover" />}
                <div className="min-w-0 flex-1">
                  <p className="text-white text-sm truncate">{song.title}</p>
                  <p className="text-subtext text-xs truncate">{song.artist}</p>
                </div>
                <button
                  onClick={() => handleAddSong(song)}
                  className="w-8 h-8 bg-accent rounded-full flex items-center justify-center text-white shrink-0"
                >
                  +
                </button>
              </div>
            ))}
          </div>
        )}

        <p className="text-accent text-xs font-semibold uppercase tracking-wide mb-2">
          {selectedGenre.songs.length} song{selectedGenre.songs.length !== 1 ? 's' : ''}
        </p>
        <div className="space-y-2">
          {selectedGenre.songs.length === 0 && (
            <p className="text-subtext text-sm text-center mt-6">No songs yet - search above to add some</p>
          )}
          {selectedGenre.songs.map(song => (
            <div key={song.key} className="flex items-center gap-3 bg-surface rounded-xl p-2">
              <button
                onClick={() => onPlaySong && onPlaySong({ id: song.songId, title: song.title, artist: song.artist, thumbnail: song.thumbnail })}
                className="flex items-center gap-3 flex-1 min-w-0 text-left"
              >
                {song.thumbnail ? (
                  <img src={song.thumbnail} alt="" className="w-10 h-10 rounded-lg object-cover shrink-0" />
                ) : (
                  <div className="w-10 h-10 rounded-lg bg-white/10 flex items-center justify-center shrink-0">🎵</div>
                )}
                <div className="min-w-0">
                  <p className="text-white text-sm truncate">{song.title}</p>
                  <p className="text-subtext text-xs truncate">{song.artist}</p>
                </div>
              </button>
              <button
                onClick={() => removeSongFromGenre(selectedId, song.key)}
                className="text-subtext text-xs shrink-0 px-2"
              >
                ✕
              </button>
            </div>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col h-full bg-background px-4 pt-6 pb-4 overflow-y-auto">
      <h2 className="text-white text-xl font-bold mb-4">Genres</h2>

      <div className="flex gap-2 mb-6">
        <input
          value={newGenreName}
          onChange={(e) => setNewGenreName(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleCreateGenre()}
          placeholder="New genre name (e.g. Chill, Party)"
          className="flex-1 bg-surface rounded-full px-4 py-2 text-white text-sm outline-none"
        />
        <button onClick={handleCreateGenre} className="px-4 py-2 bg-accent rounded-full text-white text-sm shrink-0">
          + Add
        </button>
      </div>

      {genres.length === 0 && (
        <p className="text-subtext text-sm text-center mt-10">No genre folders yet - create one above</p>
      )}

      <div className="grid grid-cols-2 gap-3">
        {genres.map(genre => (
          <div key={genre.id} className="relative">
            <button
              onClick={() => setSelectedId(genre.id)}
              className="w-full bg-surface rounded-2xl p-4 flex flex-col items-center gap-2 text-center"
            >
              <span className="text-3xl">📁</span>
              <p className="text-white text-sm font-medium truncate w-full">{genre.name}</p>
              <p className="text-subtext text-xs">{genre.songs.length} song{genre.songs.length !== 1 ? 's' : ''}</p>
            </button>
            <button
              onClick={() => handleDeleteGenre(genre.id)}
              className="absolute top-1 right-1 w-6 h-6 bg-black/40 rounded-full text-white text-xs flex items-center justify-center"
            >
              ✕
            </button>
          </div>
        ))}
      </div>
    </div>
  )
}