import { useState, useEffect } from 'react'
import { onAuthChange } from './services/authService'
import LoginView from './components/Auth/LoginView'
import MainApp from './components/Layout/MainApp'

export default function App() {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const unsub = onAuthChange((u) => {
      setUser(u)
      setLoading(false)
    })
    return unsub
  }, [])

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-background">
        <div className="w-8 h-8 border-2 border-accent border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  return user ? <MainApp user={user} /> : <LoginView />
}