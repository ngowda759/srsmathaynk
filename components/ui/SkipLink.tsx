/**
 * Skip Link Component
 * Accessibility: Allows keyboard users to skip to main content
 */
interface SkipLinkProps {
  targetId?: string
  children?: React.ReactNode
}

export function SkipLink({ 
  targetId = 'main-content', 
  children = 'Skip to main content' 
}: SkipLinkProps) {
  return (
    <a
      href={`#${targetId}`}
      className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 focus:px-4 focus:py-2 focus:bg-primary-600 focus:text-white focus:font-medium focus:rounded-lg focus:shadow-lg focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
    >
      {children}
    </a>
  )
}
