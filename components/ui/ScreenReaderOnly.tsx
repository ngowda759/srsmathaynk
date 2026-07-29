/**
 * Screen Reader Only Component
 * Hides content visually but keeps it accessible to screen readers
 */
interface ScreenReaderOnlyProps {
  children: React.ReactNode
  as?: 'span' | 'div' | 'p' | 'label'
  className?: string
}

export function ScreenReaderOnly({ 
  children, 
  as: Component = 'span',
  className = '' 
}: ScreenReaderOnlyProps) {
  return (
    <Component className={`sr-only ${className}`}>
      {children}
    </Component>
  )
}
