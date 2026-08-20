import { db } from '../config/firebase'
import { ref as dbRef, push, set, get, update } from 'firebase/database'
import { getCurrentUser } from './authService'

export const getUserRoomId = async () => {
  const user = getCurrentUser()
  if (!user) return null
  const snap = await get(dbRef(db, `users/${user.uid}/roomId`))
  return snap.exists() ? snap.val() : null
}

export const getMyPendingInviteCode = async () => {
  const user = getCurrentUser()
  if (!user) return null
  const snap = await get(dbRef(db, `users/${user.uid}/pendingInviteCode`))
  return snap.exists() ? snap.val() : null
}

export const createRoomAndInvite = async () => {
  const user = getCurrentUser()
  if (!user) throw new Error('Not logged in')

  const roomsRef = dbRef(db, 'rooms')
  const newRoomRef = push(roomsRef)
  const roomId = newRoomRef.key

  await set(newRoomRef, {
    members: { [user.uid]: true },
    createdAt: Date.now()
  })
  await set(dbRef(db, `users/${user.uid}/roomId`), roomId)

  const invitesRef = dbRef(db, 'invites')
  const newInviteRef = push(invitesRef)
  const inviteCode = newInviteRef.key

  await set(newInviteRef, {
    roomId,
    createdBy: user.uid,
    status: 'pending',
    createdAt: Date.now()
  })
  await set(dbRef(db, `users/${user.uid}/pendingInviteCode`), inviteCode)

  return { roomId, inviteCode }
}

export const getInvite = async (inviteCode) => {
  const snap = await get(dbRef(db, `invites/${inviteCode}`))
  return snap.exists() ? { code: inviteCode, ...snap.val() } : null
}

export const acceptInvite = async (inviteCode) => {
  const user = getCurrentUser()
  if (!user) throw new Error('Not logged in')

  const invite = await getInvite(inviteCode)
  if (!invite) throw new Error('This invite does not exist.')
  if (invite.status !== 'pending') throw new Error('This invite is no longer available.')
  if (invite.createdBy === user.uid) throw new Error('You cannot accept your own invite.')

  const roomSnap = await get(dbRef(db, `rooms/${invite.roomId}/members`))
  const members = roomSnap.exists() ? roomSnap.val() : {}
  const memberCount = Object.keys(members).length
  if (memberCount >= 2) throw new Error('This space is already full.')

  await update(dbRef(db, `rooms/${invite.roomId}/members`), { [user.uid]: true })
  await set(dbRef(db, `users/${user.uid}/roomId`), invite.roomId)
  await update(dbRef(db, `invites/${inviteCode}`), { status: 'accepted', acceptedBy: user.uid })

  return invite.roomId
}

export const rejectInvite = async (inviteCode) => {
  await update(dbRef(db, `invites/${inviteCode}`), { status: 'rejected' })
}