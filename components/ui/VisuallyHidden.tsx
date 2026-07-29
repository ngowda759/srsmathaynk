/**
 * Visually Hidden Component
 * Alternative to sr-only with better screen reader support
 */
interface VisuallyHiddenProps {
  children: React.ReactNode
  className?: string
}

export function VisuallyHidden({ children, className = '' }: VisuallyHiddenProps) {
  return (
    <div
      className={`absolute w-1 h-1 p-0 -m-1 overflow-hidden whitespace-nowrap border-0 ${className}`}
      style={{ clip: 'rect(0, 0, 0, 0)' }}
    >
      {children}
    </div>
  )
}
