import { useEffect, useRef, useState } from 'react'

export default function NowPlaying({ currentSong, isPlaying, onTogglePlay, onNext, onPrev, queue }) {
  const [playerReady, setPlayerReady] = useState(false)
  const [videoVisible, setVideoVisible] = useState(true)
  const playerInstanceRef = useRef(null)
  const currentSongIdRef = useRef(null)
  const pendingVideoIdRef = useRef(null)

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

  return (
    <div className="flex flex-col min-h-screen bg-background px-4 pt-12">
      {currentSong ? (
        <>
          {/* YouTube Player - stays mounted so audio keeps playing even when hidden */}
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

          {/* Song Info */}
          <div className="text-center mb-4">
            <h2 className="text-white text-xl font-bold leading-tight mb-1 line-clamp-2">
              {currentSong.title}
            </h2>
            <p className="text-subtext text-sm">{currentSong.artist}</p>
            {currentSong.addedBy && (
              <p className="text-accent text-xs mt-1">Added by {currentSong.addedBy}</p>
            )}
          </div>

          {/* Sync badge + audio/video toggle */}
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

          {/* Controls */}
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