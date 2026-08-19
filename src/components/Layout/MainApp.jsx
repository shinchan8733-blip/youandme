import { useState, useEffect, useRef } from 'react'
import NowPlaying from '../Player/NowPlaying'
import QueueView from '../Queue/QueueView'
import DiscoveryView from '../Discovery/DiscoveryView'
import OurSongsView from '../OurSongs/OurSongsView'
import NotesView from '../Notes/NotesView'
import HistoryView from '../History/HistoryView'
import BottomNav from './BottomNav'
import { observeQueue, addToQueue } from '../../services/queueService'
import { observePlayback, broadcastPlayback } from '../../services/syncService'
import { getCurrentUser } from '../../services/authService'
import { logPlay } from '../../services/historyService'

export default function MainApp({ user }) {
  const [tab, setTab] = useState('player')
  const [queue, setQueue] = useState([])
  const [currentSong, setCurrentSong] = useState(null)
  const [isPlaying, setIsPlaying] = useState(false)
  const [toast, setToast] = useState(null)
  const [remoteSeek, setRemoteSeek] = useState(null)

  const knownIdsRef = useRef(new Set())
  const isFirstLoadRef = useRef(true)

  useEffect(() => {
    const unsub = observeQueue((songs) => {
      const myName = getCurrentUser()?.email?.split('@')[0]

      if (isFirstLoadRef.current) {
        songs.forEach(s => knownIdsRef.current.add(s.id))
        isFirstLoadRef.current = false
      } else {
        const newSongs = songs.filter(s => !knownIdsRef.current.has(s.id))
        const partnerSong = newSongs.find(s => s.addedBy && s.addedBy !== myName)
        if (partnerSong) {
          setToast(`${partnerSong.addedBy} added "${partnerSong.title}"`)
        }
        songs.forEach(s => knownIdsRef.current.add(s.id))
      }

      setQueue(songs)
      if (!currentSong && songs.length > 0) {
        setCurrentSong(songs[0])
      }
    })
    return unsub
  }, [currentSong])

  useEffect(() => {
    if (!toast) return
    const timer = setTimeout(() => setToast(null), 4000)
    return () => clearTimeout(timer)
  }, [toast])

  useEffect(() => {
    const unsub = observePlayback((state) => {
      if (state.updatedBy !== getCurrentUser()?.uid) {
        setIsPlaying(state.isPlaying)
        if (state.songId !== currentSong?.id) {
          const song = queue.find(s => s.id === state.songId)
          if (song) setCurrentSong(song)
        }
        if (typeof state.time === 'number') {
          setRemoteSeek({ time: state.time, nonce: Date.now() })
        }
      }
    })
    return unsub
  }, [queue, currentSong])

  const playSong = (song) => {
    setCurrentSong(song)
    setIsPlaying(true)
    broadcastPlayback(song.id, true, 0)
    logPlay(song)
  }

  const togglePlay = () => {
    const next = !isPlaying
    setIsPlaying(next)
    if (currentSong) broadcastPlayback(currentSong.id, next, 0)
  }

  const nextSong = () => {
    const idx = queue.findIndex(s => s.id === currentSong?.id)
    if (idx < queue.length - 1) playSong(queue[idx + 1])
  }

  const prevSong = () => {
    const idx = queue.findIndex(s => s.id === currentSong?.id)
    if (idx > 0) playSong(queue[idx - 1])
  }

  const seekTo = (time) => {
    if (!currentSong) return
    broadcastPlayback(currentSong.id, isPlaying, time)
  }

  return (
    <div className="flex flex-col h-screen bg-background overflow-hidden relative">
      {toast && (
        <div className="absolute top-4 left-1/2 -translate-x-1/2 z-50 bg-surface border border-accent/40 text-white text-sm px-4 py-3 rounded-xl shadow-lg shadow-black/40 flex items-center gap-2 max-w-[90%]">
          <span className="text-accent">♥</span>
          <span className="truncate">{toast}</span>
        </div>
      )}

      <div className="flex-1 overflow-y-auto pb-20">
        {tab === 'player' && (
          <NowPlaying
            currentSong={currentSong}
            isPlaying={isPlaying}
            onTogglePlay={togglePlay}
            onNext={nextSong}
            onPrev={prevSong}
            queue={queue}
            onSeek={seekTo}
            remoteSeek={remoteSeek}
          />
        )}
        {tab === 'queue' && (
          <QueueView
            queue={queue}
            currentSong={currentSong}
            onPlaySong={playSong}
          />
        )}
        {tab === 'discover' && (
          <DiscoveryView onAddToQueue={addToQueue} />
        )}
        {tab === 'ourSongs' && (
          <OurSongsView
            currentSong={currentSong}
            onPlaySong={playSong}
            onAddToQueue={addToQueue}
          />
        )}
        {tab === 'notes' && <NotesView />}
        {tab === 'history' && <HistoryView onPlaySong={playSong} />}
      </div>
      <BottomNav tab={tab} setTab={setTab} />
    </div>
  )
}