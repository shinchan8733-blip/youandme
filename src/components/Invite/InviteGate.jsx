import { useState, useEffect } from 'react'
import { getUserRoomId, getMyPendingInviteCode, createRoomAndInvite, getInvite, acceptInvite, rejectInvite } from '../../services/inviteService'
import { setCurrentRoomId } from '../../services/roomContext'

export default function InviteGate({ children }) {
  const [loading, setLoading] = useState(true)
  const [roomId, setRoomId] = useState(null)
  const [myInviteCode, setMyInviteCode] = useState(null)
  const [incomingInvite, setIncomingInvite] = useState(null)
  const [error, setError] = useState('')
  const [processing, setProcessing] = useState(false)

  useEffect(() => {
    const init = async () => {
      const existingRoom = await getUserRoomId()
      if (existingRoom) {
        setCurrentRoomId(existingRoom)
        setRoomId(existingRoom)
        setLoading(false)
        return
      }

      const params = new URLSearchParams(window.location.search)
      const inviteParam = params.get('invite')
      if (inviteParam) {
        const invite = await getInvite(inviteParam)
        setIncomingInvite(invite ? { ...invite, code: inviteParam } : null)
        setLoading(false)
        return
      }

      const pending = await getMyPendingInviteCode()
      setMyInviteCode(pending)
      setLoading(false)
    }
    init()
  }, [])

  const handleCreateInvite = async () => {
    setProcessing(true)
    setError('')
    try {
      const { roomId: newRoomId, inviteCode } = await createRoomAndInvite()
      setCurrentRoomId(newRoomId)
      setRoomId(newRoomId)
      setMyInviteCode(inviteCode)
    } catch (err) {
      setError('Could not create your space. Try again.')
    } finally {
      setProcessing(false)
    }
  }

  const handleAccept = async () => {
    setProcessing(true)
    setError('')
    try {
      const joinedRoomId = await acceptInvite(incomingInvite.code)
      setCurrentRoomId(joinedRoomId)
      setRoomId(joinedRoomId)
      window.history.replaceState({}, '', window.location.pathname)
    } catch (err) {
      setError(err.message || 'Could not accept this invite.')
    } finally {
      setProcessing(false)
    }
  }

  const handleReject = async () => {
    setProcessing(true)
    try {
      await rejectInvite(incomingInvite.code)
      window.history.replaceState({}, '', window.location.pathname)
      setIncomingInvite({ ...incomingInvite, status: 'rejected' })
    } finally {
      setProcessing(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-accent border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  if (roomId) {
    return children
  }

  if (incomingInvite) {
    if (!incomingInvite || incomingInvite.status !== 'pending') {
      return (
        <div className="min-h-screen bg-background flex flex-col items-center justify-center px-6 text-center gap-3">
          <span className="text-4xl">💔</span>
          <p className="text-white text-lg font-semibold">This invite isn't available anymore</p>
          <p className="text-subtext text-sm">It may have already been used, declined, or the space is full.</p>
        </div>
      )
    }

    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center px-6 text-center gap-4">
        <span className="text-5xl">💌</span>
        <p className="text-white text-lg font-semibold">You've been invited to a shared space</p>
        <p className="text-subtext text-sm">Accept to join and start sharing music together.</p>
        {error && <p className="text-red-400 text-xs">{error}</p>}
        <div className="flex gap-3 mt-2">
          <button
            onClick={handleReject}
            disabled={processing}
            className="px-6 py-2 rounded-full bg-surface border border-white/10 text-white text-sm"
          >
            Decline
          </button>
          <button
            onClick={handleAccept}
            disabled={processing}
            className="px-6 py-2 rounded-full bg-accent text-white text-sm"
          >
            {processing ? 'Joining...' : 'Accept'}
          </button>
        </div>
      </div>
    )
  }

  const inviteLink = myInviteCode
    ? `${window.location.origin}${window.location.pathname}?invite=${myInviteCode}`
    : null

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center px-6 text-center gap-4">
      <span className="text-5xl">♥</span>
      <p className="text-white text-lg font-semibold">Create your shared space</p>
      <p className="text-subtext text-sm max-w-xs">
        Invite one person to join you. Once they accept, no one else can join.
      </p>
      {error && <p className="text-red-400 text-xs">{error}</p>}
      {!inviteLink ? (
        <button
          onClick={handleCreateInvite}
          disabled={processing}
          className="px-6 py-3 rounded-full bg-accent text-white text-sm"
        >
          {processing ? 'Creating...' : 'Create invite link'}
        </button>
      ) : (
        <div className="w-full max-w-xs">
          <div className="bg-surface rounded-xl p-3 text-subtext text-xs break-all mb-3">
            {inviteLink}
          </div>
          <button
            onClick={() => navigator.clipboard?.writeText(inviteLink)}
            className="w-full px-4 py-2 rounded-full bg-accent text-white text-sm"
          >
            Copy link
          </button>
          <p className="text-subtext text-xs mt-3">You're all set — share this link if you haven't already.</p>
        </div>
      )}
    </div>
  )
}