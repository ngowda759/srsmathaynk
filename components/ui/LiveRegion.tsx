/**
 * LiveRegion Component
 * Announces messages to screen readers
 */
'use client'

import { createContext, useContext, useState, useCallback, ReactNode } from 'react'

interface LiveRegionContextType {
  announce: (message: string, priority?: 'polite' | 'assertive') => void
}

const LiveRegionContext = createContext<LiveRegionContextType | null>(null)

export function useLiveRegion() {
  const context = useContext(LiveRegionContext)
  if (!context) {
    throw new Error('useLiveRegion must be used within a LiveRegionProvider')
  }
  return context
}

interface LiveRegionProviderProps {
  children: ReactNode
}

export function LiveRegionProvider({ children }: LiveRegionProviderProps) {
  const [politeMessage, setPoliteMessage] = useState<string>('')
  const [assertiveMessage, setAssertiveMessage] = useState<string>('')

  const announce = useCallback((message: string, priority: 'polite' | 'assertive' = 'polite') => {
    if (priority === 'assertive') {
      setAssertiveMessage(message)
      setTimeout(() => setAssertiveMessage(''), 1000)
    } else {
      setPoliteMessage(message)
      setTimeout(() => setPoliteMessage(''), 1000)
    }
  }, [])

  return (
    <LiveRegionContext.Provider value={{ announce }}>
      {children}
      
      {/* Polite announcements */}
      <div
        role="status"
        aria-live="polite"
        aria-atomic="true"
        className="sr-only"
      >
        {politeMessage}
      </div>
      
      {/* Assertive announcements */}
      <div
        role="alert"
        aria-live="assertive"
        aria-atomic="true"
        className="sr-only"
      >
        {assertiveMessage}
      </div>
    </LiveRegionContext.Provider>
  )
}
