import { useState, useEffect } from 'react'
import LoginView from './components/Auth/LoginView'
import MainApp from './components/Layout/MainApp'
import InviteGate from './components/Invite/InviteGate'
import { onAuthChange } from './services/authService'

export default function App() {
  const [user, setUser] = useState(null)
  const [checkingAuth, setCheckingAuth] = useState(true)

  useEffect(() => {
    const unsub = onAuthChange((firebaseUser) => {
      setUser(firebaseUser)
      setCheckingAuth(false)
    })
    return unsub
  }, [])

  if (checkingAuth) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-accent border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  if (!user) return <LoginView />

  return (
    <InviteGate>
      <MainApp user={user} />
    </InviteGate>
  )
}