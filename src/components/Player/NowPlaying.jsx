import { useEffect, useRef, useState } from 'react'

function formatTime(sec) {
  if (!isFinite(sec) || sec < 0) return '0:00'
  const m = Math.floor(sec / 60)
  const s = Math.floor(sec % 60).toString().padStart(2, '0')
  return `${m}:${s}`
}

export default function NowPlaying({ currentSong, isPlaying, onTogglePlay, onNext, onPrev, queue, onSeek, remoteSeek }) {
  const [playerReady, setPlayerReady] = useState(false)
  const [videoVisible, setVideoVisible] = useState(true)
  const [currentTime, setCurrentTime] = useState(0)
  const [duration, setDuration] = useState(0)
  const [seeking, setSeeking] = useState(false)
  const [seekValue, setSeekValue] = useState(0)

  const playerInstanceRef = useRef(null)
  const currentSongIdRef = useRef(null)
  const pendingVideoIdRef = useRef(null)
  const wakeLockRef = useRef(null)
  const isPlayingRef = useRef(isPlaying)

  useEffect(() => { isPlayingRef.current = isPlaying }, [isPlaying])

  useEffect(() => {
    setCurrentTime(0)
    setDuration(0)
  }, [currentSong?.id])

  useEffect(() => {
    if (!currentSong) return
    if (currentSongIdRef.current === currentSong.id) return
    currentSongIdRef.current = currentSong.id

    const loadOrQueue = (videoId) => {
      const player = playerInstanceRef.current
      if (player && typeof player.loadVideoById === 'function') {
        player.loadVideoById(videoId)
      } else {
        pendingVideoIdRef.current = videoId
      }
    }

    const initPlayer = () => {
      if (playerInstanceRef.current) {
        loadOrQueue(currentSong.id)
        return
      }
      playerInstanceRef.current = new window.YT.Player('yt-player', {
        videoId: currentSong.id,
        playerVars: {
          autoplay: 1,
          playsinline: 1,
          controls: 0,
          modestbranding: 1,
          rel: 0,
        },
        events: {
          onReady: () => {
            setPlayerReady(true)
            if (pendingVideoIdRef.current && pendingVideoIdRef.current !== currentSong.id) {
              playerInstanceRef.current.loadVideoById(pendingVideoIdRef.current)
              pendingVideoIdRef.current = null
            }
          },
          onStateChange: (e) => {
            if (e.data === 0) onNext()
          }
        }
      })
    }

    if (window.YT && window.YT.Player) {
      initPlayer()
    } else {
      window.onYouTubeIframeAPIReady = initPlayer
    }
  }, [currentSong?.id])

  useEffect(() => {
    if (!playerInstanceRef.current || !playerReady) return
    if (typeof playerInstanceRef.current.playVideo !== 'function') return
    if (isPlaying) {
      playerInstanceRef.current.playVideo()
    } else {
      playerInstanceRef.current.pauseVideo()
    }
  }, [isPlaying, playerReady])

  useEffect(() => {
    if (!playerReady) return
    const interval = setInterval(() => {
      const player = playerInstanceRef.current
      if (!player || typeof player.getCurrentTime !== 'function') return
      if (!seeking) {
        setCurrentTime(player.getCurrentTime() || 0)
      }
      setDuration(player.getDuration() || 0)
    }, 500)
    return () => clearInterval(interval)
  }, [playerReady, seeking])

  useEffect(() => {
    if (!remoteSeek || !playerInstanceRef.current) return
    if (typeof playerInstanceRef.current.seekTo === 'function') {
      playerInstanceRef.current.seekTo(remoteSeek.time, true)
      setCurrentTime(remoteSeek.time)
    }
  }, [remoteSeek?.nonce])

  useEffect(() => {
    let cancelled = false
    const requestWakeLock = async () => {
      try {
        if ('wakeLock' in navigator && isPlaying && document.visibilityState === 'visible') {
          const lock = await navigator.wakeLock.request('screen')
          if (!cancelled) {
            wakeLockRef.current = lock
          } else {
            lock.release().catch(() => {})
          }
        }
      } catch (err) {}
    }
    requestWakeLock()
    return () => {
      cancelled = true
      wakeLockRef.current?.release?.().catch(() => {})
      wakeLockRef.current = null
    }
  }, [isPlaying])

  useEffect(() => {
    const handleVisibility = async () => {
      if (document.visibilityState !== 'visible') return

      if (isPlayingRef.current && 'wakeLock' in navigator && !wakeLockRef.current) {
        try {
          wakeLockRef.current = await navigator.wakeLock.request('screen')
        } catch (err) {}
      }

      const player = playerInstanceRef.current
      if (player && isPlayingRef.current && typeof player.getPlayerState === 'function') {
        const state = player.getPlayerState()
        if (state !== 1 && typeof player.playVideo === 'function') {
          player.playVideo()
        }
      }
    }
    document.addEventListener('visibilitychange', handleVisibility)
    return () => document.removeEventListener('visibilitychange', handleVisibility)
  }, [])

  const handleSeekInput = (e) => {
    setSeeking(true)
    setSeekValue(Number(e.target.value))
  }

  const handleSeekCommit = (e) => {
    const time = Number(e.target.value)
    setSeeking(false)
    setCurrentTime(time)
    if (playerInstanceRef.current?.seekTo) {
      playerInstanceRef.current.seekTo(time, true)
    }
    onSeek && onSeek(time)
  }

  useEffect(() => {
    if (!currentSong || !('mediaSession' in navigator)) return
    navigator.mediaSession.metadata = new MediaMetadata({
      title: currentSong.title || 'Unknown',
      artist: currentSong.artist || '',
      album: 'You & Me',
      artwork: currentSong.thumbnail
        ? [{ src: currentSong.thumbnail, sizes: '512x512', type: 'image/jpeg' }]
        : []
    })
    navigator.mediaSession.setActionHandler('play', () => onTogglePlay())
    navigator.mediaSession.setActionHandler('pause', () => onTogglePlay())
    navigator.mediaSession.setActionHandler('previoustrack', () => onPrev())
    navigator.mediaSession.setActionHandler('nexttrack', () => onNext())
  }, [currentSong?.id, onTogglePlay, onNext, onPrev])

  useEffect(() => {
    if ('mediaSession' in navigator) {
      navigator.mediaSession.playbackState = isPlaying ? 'playing' : 'paused'
    }
  }, [isPlaying])

  return (
    <div className="flex flex-col min-h-screen bg-background px-4 pt-12">
      {currentSong ? (
        <>
          <div
            className={`rounded-2xl overflow-hidden bg-black mb-6 transition-all ${
              videoVisible ? 'block' : 'sr-only'
            }`}
          >
            <div id="yt-player" className="w-full aspect-video" />
          </div>

          {!videoVisible && (
            <div className="flex flex-col items-center justify-center mb-6 py-10 bg-surface/50 rounded-2xl">
              <span className="text-6xl mb-2">🎧</span>
              <span className="text-subtext text-xs">Audio only</span>
            </div>
          )}

          <div className="text-center mb-4">
            <h2 className="text-white text-xl font-bold leading-tight mb-1 line-clamp-2">
              {currentSong.title}
            </h2>
            <p className="text-subtext text-sm">{currentSong.artist}</p>
            {currentSong.addedBy && (
              <p className="text-accent text-xs mt-1">Added by {currentSong.addedBy}</p>
            )}
          </div>

          <div className="mb-6">
            <input
              type="range"
              min={0}
              max={duration || 0}
              step={1}
              value={seeking ? seekValue : currentTime}
              onInput={handleSeekInput}
              onChange={handleSeekCommit}
              className="w-full h-1.5 rounded-full accent-accent cursor-pointer"
            />
            <div className="flex justify-between text-subtext text-xs mt-1">
              <span>{formatTime(seeking ? seekValue : currentTime)}</span>
              <span>{formatTime(duration)}</span>
            </div>
          </div>

          <div className="flex items-center justify-center gap-3 mb-8">
            <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
            <span className="text-subtext text-xs">Synced with your partner</span>
            <button
              onClick={() => setVideoVisible(v => !v)}
              className="ml-2 px-3 py-1 rounded-full bg-surface border border-white/10 text-subtext text-xs"
            >
              {videoVisible ? '🎧 Audio only' : '📺 Show video'}
            </button>
          </div>

          <div className="flex items-center justify-center gap-12">
            <button
              onClick={onPrev}
              disabled={queue.findIndex(s => s.id === currentSong.id) === 0}
              className="text-white text-3xl disabled:opacity-30"
            >
              ⏮
            </button>

            <button
              onClick={onTogglePlay}
              className="w-20 h-20 bg-accent rounded-full flex items-center justify-center text-white text-3xl shadow-lg shadow-accent/30"
            >
              {isPlaying ? '⏸' : '▶️'}
            </button>

            <button
              onClick={onNext}
              disabled={queue.findIndex(s => s.id === currentSong.id) === queue.length - 1}
              className="text-white text-3xl disabled:opacity-30"
            >
              ⏭
            </button>
          </div>
        </>
      ) : (
        <div className="flex flex-col items-center justify-center flex-1 gap-4 text-subtext">
          <span className="text-6xl">🎵</span>
          <p className="text-lg">No song playing</p>
          <p className="text-sm opacity-70">Add songs to the queue to get started</p>
        </div>
      )}
    </div>
  )
}