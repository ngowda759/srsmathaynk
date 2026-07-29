/**
 * AriaLive Component
 * Announces dynamic content changes to screen readers
 */
import { useEffect, useState } from 'react'

interface AriaLiveProps {
  children: React.ReactNode
  politeness?: 'polite' | 'assertive'
  className?: string
}

export function AriaLive({ 
  children, 
  politeness = 'polite',
  className = '' 
}: AriaLiveProps) {
  const [message, setMessage] = useState<React.ReactNode>(null)

  useEffect(() => {
    setMessage(children)
  }, [children])

  return (
    <div
      aria-live={politeness}
      aria-atomic="true"
      className={className}
    >
      {message}
    </div>
  )
}
