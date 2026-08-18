import { useState, useEffect } from 'react'
import NowPlaying from '../Player/NowPlaying'
import QueueView from '../Queue/QueueView'
import DiscoveryView from '../Discovery/DiscoveryView'
import OurSongsView from '../OurSongs/OurSongsView'
import BottomNav from './BottomNav'
import { observeQueue, addToQueue } from '../../services/queueService'
import { observePlayback, broadcastPlayback } from '../../services/syncService'
import { getCurrentUser } from '../../services/authService'

export default function MainApp({ user }) {
  const [tab, setTab] = useState('player')
  const [queue, setQueue] = useState([])
  const [currentSong, setCurrentSong] = useState(null)
  const [isPlaying, setIsPlaying] = useState(false)

  useEffect(() => {
    const unsub = observeQueue((songs) => {
      setQueue(songs)
      if (!currentSong && songs.length > 0) {
        setCurrentSong(songs[0])
      }
    })
    return unsub
  }, [currentSong])

  useEffect(() => {
    const unsub = observePlayback((state) => {
      if (state.updatedBy !== getCurrentUser()?.uid) {
        setIsPlaying(state.isPlaying)
        if (state.songId !== currentSong?.id) {
          const song = queue.find(s => s.id === state.songId)
          if (song) setCurrentSong(song)
        }
      }
    })
    return unsub
  }, [queue, currentSong])

  const playSong = (song) => {
    setCurrentSong(song)
    setIsPlaying(true)
    broadcastPlayback(song.id, true, 0)
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

  return (
    <div className="flex flex-col h-screen bg-background overflow-hidden">
      <div className="flex-1 overflow-y-auto pb-20">
        {tab === 'player' && (
          <NowPlaying
            currentSong={currentSong}
            isPlaying={isPlaying}
            onTogglePlay={togglePlay}
            onNext={nextSong}
            onPrev={prevSong}
            queue={queue}
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
      </div>
      <BottomNav tab={tab} setTab={setTab} />
    </div>
  )
}