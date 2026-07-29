'use client'

import { useEffect, useState } from 'react'

interface ServiceWorkerStatus {
  isSupported: boolean
  isRegistered: boolean
  isActivated: boolean
  registration: ServiceWorkerRegistration | null
  error: Error | null
}

export function useServiceWorker(): ServiceWorkerStatus {
  const [status, setStatus] = useState<ServiceWorkerStatus>({
    isSupported: false,
    isRegistered: false,
    isActivated: false,
    registration: null,
    error: null,
  })

  useEffect(() => {
    if (typeof window === 'undefined') return

    // Check if service workers are supported
    if (!('serviceWorker' in navigator)) {
      setStatus(prev => ({
        ...prev,
        isSupported: false,
        error: new Error('Service workers not supported'),
      }))
      return
    }

    setStatus(prev => ({ ...prev, isSupported: true }))

    // Register service worker
    const registerSW = async () => {
      try {
        const registration = await navigator.serviceWorker.register('/sw.js', {
          scope: '/',
        })

        setStatus(prev => ({
          ...prev,
          registration,
          isRegistered: true,
        }))

        // Check if already activated
        if (registration.active) {
          setStatus(prev => ({ ...prev, isActivated: true }))
        }

        // Listen for updates
        registration.addEventListener('updatefound', () => {
          const newWorker = registration.installing
          
          if (newWorker) {
            newWorker.addEventListener('statechange', () => {
              if (newWorker.state === 'activated') {
                setStatus(prev => ({ ...prev, isActivated: true }))
              }
            })
          }
        })
      } catch (error) {
        setStatus(prev => ({
          ...prev,
          error: error as Error,
        }))
      }
    }

    registerSW()
  }, [])

  return status
}

export function useOnlineStatus(): boolean {
  const [isOnline, setIsOnline] = useState(
    typeof navigator !== 'undefined' ? navigator.onLine : true
  )

  useEffect(() => {
    const handleOnline = () => setIsOnline(true)
    const handleOffline = () => setIsOnline(false)

    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)

    return () => {
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
    }
  }, [])

  return isOnline
}

export function usePrefersDarkMode(): boolean {
  const [isDark, setIsDark] = useState(false)

  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')
    
    setIsDark(mediaQuery.matches)

    const handler = (e: MediaQueryListEvent) => setIsDark(e.matches)
    
    mediaQuery.addEventListener('change', handler)
    return () => mediaQuery.removeEventListener('change', handler)
  }, [])

  return isDark
}

export function useMediaQuery(query: string): boolean {
  const [matches, setMatches] = useState(false)

  useEffect(() => {
    const mediaQuery = window.matchMedia(query)
    setMatches(mediaQuery.matches)

    const handler = (e: MediaQueryListEvent) => setMatches(e.matches)
    
    mediaQuery.addEventListener('change', handler)
    return () => mediaQuery.removeEventListener('change', handler)
  }, [query])

  return matches
}
