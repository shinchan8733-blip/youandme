import { useState, useEffect, useRef } from 'react'
import { addTextNote, addVoiceNote, observeNotes } from '../../services/notesService'

const MAX_RECORD_SECONDS = 30

export default function NotesView() {
  const [notes, setNotes] = useState([])
  const [text, setText] = useState('')
  const [recording, setRecording] = useState(false)
  const [seconds, setSeconds] = useState(0)
  const [uploading, setUploading] = useState(false)
  const mediaRecorderRef = useRef(null)
  const chunksRef = useRef([])
  const timerRef = useRef(null)
  const bottomRef = useRef(null)

  useEffect(() => {
    const unsub = observeNotes(setNotes)
    return unsub
  }, [])

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [notes])

  const handleSendText = async () => {
    if (!text.trim()) return
    const value = text
    setText('')
    await addTextNote(value)
  }

  const blobToBase64 = (blob) => new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onloadend = () => resolve(reader.result)
    reader.onerror = reject
    reader.readAsDataURL(blob)
  })

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      const mimeType = MediaRecorder.isTypeSupported('audio/webm;codecs=opus')
        ? 'audio/webm;codecs=opus'
        : 'audio/webm'
      const recorder = new MediaRecorder(stream, { mimeType, audioBitsPerSecond: 24000 })
      chunksRef.current = []
      recorder.ondataavailable = (e) => chunksRef.current.push(e.data)
      recorder.onstop = async () => {
        clearInterval(timerRef.current)
        stream.getTracks().forEach(t => t.stop())
        const blob = new Blob(chunksRef.current, { type: mimeType })
        setUploading(true)
        try {
          const base64 = await blobToBase64(blob)
          await addVoiceNote(base64, mimeType)
        } catch (err) {
          alert('Could not save the voice note. Try a shorter recording.')
        } finally {
          setUploading(false)
          setSeconds(0)
        }
      }
      recorder.start()
      mediaRecorderRef.current = recorder
      setRecording(true)
      setSeconds(0)

      let elapsed = 0
      timerRef.current = setInterval(() => {
        elapsed += 1
        setSeconds(elapsed)
        if (elapsed >= MAX_RECORD_SECONDS) {
          recorder.stop()
          setRecording(false)
        }
      }, 1000)
    } catch (err) {
      alert('Microphone access is needed to record a voice note.')
    }
  }

  const stopRecording = () => {
    mediaRecorderRef.current?.stop()
    setRecording(false)
  }

  return (
    <div className="flex flex-col h-full bg-background px-4 pt-6">
      <h2 className="text-white text-xl font-bold mb-4">Notes</h2>

      <div className="flex-1 overflow-y-auto space-y-3 pb-4">
        {notes.length === 0 && (
          <p className="text-subtext text-sm text-center mt-10">No notes yet. Say something sweet 💌</p>
        )}
        {notes.map(note => (
          <div key={note.id} className="bg-surface rounded-2xl p-3">
            <p className="text-accent text-xs mb-1">{note.addedBy}</p>
            {note.type === 'text' ? (
              <p className="text-white text-sm whitespace-pre-wrap">{note.content}</p>
            ) : (
              <audio controls src={note.audioData} className="w-full h-10" />
            )}
            <p className="text-subtext text-[10px] mt-1">
              {new Date(note.createdAt).toLocaleString()}
            </p>
          </div>
        ))}
        <div ref={bottomRef} />
      </div>

      {recording && (
        <p className="text-center text-xs text-red-400 mb-1">
          Recording... {seconds}s / {MAX_RECORD_SECONDS}s
        </p>
      )}

      <div className="flex items-center gap-2 pb-6 pt-2 border-t border-white/10">
        <input
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSendText()}
          placeholder="Write a note..."
          className="flex-1 bg-surface rounded-full px-4 py-2 text-white text-sm outline-none"
        />
        <button
          onClick={handleSendText}
          className="w-10 h-10 bg-accent rounded-full flex items-center justify-center text-white shrink-0"
        >
          ➤
        </button>
        <button
          onClick={recording ? stopRecording : startRecording}
          disabled={uploading}
          className={`w-10 h-10 rounded-full flex items-center justify-center text-white shrink-0 ${
            recording ? 'bg-red-500 animate-pulse' : 'bg-surface border border-white/10'
          }`}
        >
          {uploading ? '⏳' : recording ? '⏹' : '🎤'}
        </button>
      </div>
    </div>
  )
}