import { db } from '../config/firebase'
import { ref, onValue, off, onDisconnect, set, serverTimestamp } from 'firebase/database'
import { getCurrentUser } from './authService'
import { roomPath } from './roomContext'

export const setupPresence = () => {
  const user = getCurrentUser()
  if (!user) return () => {}

  const myPresenceRef = ref(db, `${roomPath('presence')}/${user.uid}`)
  const connectedRef = ref(db, '.info/connected')

  const listener = onValue(connectedRef, (snap) => {
    if (snap.val() === true) {
      onDisconnect(myPresenceRef).set({ online: false, lastSeen: serverTimestamp() }).then(() => {
        set(myPresenceRef, { online: true, lastSeen: serverTimestamp() })
      })
    }
  })

  return () => off(connectedRef, 'value', listener)
}

export const observePresence = (callback) => {
  const presenceRef = ref(db, roomPath('presence'))
  const listener = onValue(presenceRef, (snapshot) => {
    const data = snapshot.val() || {}
    callback(data)
  })
  return () => off(presenceRef, 'value', listener)
}