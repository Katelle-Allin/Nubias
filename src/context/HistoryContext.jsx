import React, { createContext, useContext, useState, useEffect } from 'react'

const HistoryContext = createContext(null)

export function HistoryProvider({ children }) {
  const [history, setHistory] = useState([])

  useEffect(() => {
    const saved = localStorage.getItem('nubias_history')
    if (saved) {
      try { setHistory(JSON.parse(saved)) } catch { /* ignore */ }
    }
  }, [])

  function addEntry(entry) {
    const newEntry = {
      id: Date.now().toString(),
      date: new Date().toISOString(),
      ...entry,
    }
    setHistory(prev => {
      const next = [newEntry, ...prev]
      localStorage.setItem('nubias_history', JSON.stringify(next))
      return next
    })
    return newEntry
  }

  function clearHistory() {
    setHistory([])
    localStorage.removeItem('nubias_history')
  }

  return (
    <HistoryContext.Provider value={{ history, addEntry, clearHistory }}>
      {children}
    </HistoryContext.Provider>
  )
}

export function useHistory() {
  const ctx = useContext(HistoryContext)
  if (!ctx) throw new Error('useHistory must be used inside HistoryProvider')
  return ctx
}
