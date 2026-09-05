import { useState, useEffect } from 'react'
import { getCurrentRoomId } from '../../services/roomContext'
import { getMyPendingInviteCode, getRoomMemberCount, createInviteForRoom } from '../../services/inviteService'

export default function InvitePartnerModal({ onClose }) {
  const [loading, setLoading] = useState(true)
  const [full, setFull] = useState(false)
  const [inviteCode, setInviteCode] = useState(null)
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    const load = async () => {
      const roomId = getCurrentRoomId()
      const count = await getRoomMemberCount(roomId)
      if (count >= 2) {
        setFull(true)
        setLoading(false)
        return
      }
      let code = await getMyPendingInviteCode()
      if (!code) {
        code = await createInviteForRoom(roomId)
      }
      setInviteCode(code)
      setLoading(false)
    }
    load()
  }, [])

  const inviteLink = inviteCode
    ? `${window.location.origin}${window.location.pathname}?invite=${inviteCode}`
    : null

  const handleCopy = () => {
    if (!inviteLink) return
    navigator.clipboard?.writeText(inviteLink)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center px-6"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="bg-surface rounded-2xl p-6 w-full max-w-xs text-center"
      >
        {loading ? (
          <div className="w-6 h-6 border-2 border-accent border-t-transparent rounded-full animate-spin mx-auto" />
        ) : full ? (
          <>
            <span className="text-3xl block mb-2">♥</span>
            <p className="text-white text-sm font-semibold mb-1">You're already connected</p>
            <p className="text-subtext text-xs">Your space already has two people in it.</p>
          </>
        ) : (
          <>
            <span className="text-3xl block mb-2">💌</span>
            <p className="text-white text-sm font-semibold mb-3">Invite your partner</p>
            <div className="bg-background rounded-xl p-3 text-subtext text-xs break-all mb-3">
              {inviteLink}
            </div>
            <button
              onClick={handleCopy}
              className="w-full px-4 py-2 rounded-full bg-accent text-white text-sm"
            >
              {copied ? 'Copied!' : 'Copy link'}
            </button>
          </>
        )}
        <button onClick={onClose} className="mt-4 text-subtext text-xs underline">
          Close
        </button>
      </div>
    </div>
  )
}