import React, { createContext, useContext, useState, useEffect } from 'react'

const AuthContext = createContext(null)

// Demo organisation — automatically assigned on sign-up
const DEMO_ORG = {
  name: 'KEDGE Business School',
  shortName: 'KEDGE',
  email: 'hr@kedge.edu',
  plan: 'Pro',
  memberSince: '2026',
  avatar: 'K',
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  // Restore session from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem('nubias_session')
    if (saved) {
      try {
        setUser(JSON.parse(saved))
      } catch {
        localStorage.removeItem('nubias_session')
      }
    }
    setLoading(false)
  }, [])

  // Demo sign-up / sign-in — always connects as KEDGE
  function signIn(email, password) {
    const session = { ...DEMO_ORG, email: email || DEMO_ORG.email }
    localStorage.setItem('nubias_session', JSON.stringify(session))
    setUser(session)
    return session
  }

  function signOut() {
    localStorage.removeItem('nubias_session')
    setUser(null)
  }

  return (
    <AuthContext.Provider value={{ user, loading, signIn, signOut }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider')
  return ctx
}
