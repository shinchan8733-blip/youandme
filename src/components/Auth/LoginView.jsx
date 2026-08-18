import { useState } from 'react'
import { signIn, signUp } from '../../services/authService'

export default function LoginView() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [isSignUp, setIsSignUp] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      if (isSignUp) {
        await signUp(email, password)
      } else {
        await signIn(email, password)
      }
    } catch (err) {
      setError(err.message.replace('Firebase: ', '').replace(/\(.*\)/, '').trim())
    }
    setLoading(false)
  }

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center px-8">
      <div className="mb-10 text-center">
        <div className="text-6xl mb-3">♥</div>
        <h1 className="text-4xl font-bold text-white">You & Me</h1>
        <p className="text-subtext mt-2">Your music, together</p>
      </div>

      <form onSubmit={handleSubmit} className="w-full max-w-sm space-y-4">
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={e => setEmail(e.target.value)}
          className="w-full px-4 py-4 bg-surface rounded-2xl text-white placeholder-subtext outline-none focus:ring-2 focus:ring-accent"
          autoCapitalize="none"
          required
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={e => setPassword(e.target.value)}
          className="w-full px-4 py-4 bg-surface rounded-2xl text-white placeholder-subtext outline-none focus:ring-2 focus:ring-accent"
          required
        />

        {error && (
          <p className="text-red-400 text-sm text-center">{error}</p>
        )}

        <button
          type="submit"
          disabled={loading}
          className="w-full py-4 bg-accent rounded-2xl text-white font-semibold text-lg disabled:opacity-50"
        >
          {loading ? (
            <span className="flex items-center justify-center gap-2">
              <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              Loading...
            </span>
          ) : isSignUp ? 'Create Account' : 'Sign In'}
        </button>

        <button
          type="button"
          onClick={() => { setIsSignUp(!isSignUp); setError('') }}
          className="w-full text-subtext text-sm py-2"
        >
          {isSignUp ? 'Already have an account? Sign in' : 'New here? Create account'}
        </button>
      </form>
    </div>
  )
}