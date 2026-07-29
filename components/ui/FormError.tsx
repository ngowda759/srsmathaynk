/**
 * FormError Component
 * Accessible error message for form fields
 */
interface FormErrorProps {
  id: string
  error?: string
  className?: string
}

export function FormError({ id, error, className = '' }: FormErrorProps) {
  if (!error) return null

  return (
    <div 
      id={id} 
      role="alert" 
      className={`flex items-center gap-1 mt-1 text-sm text-red-600 ${className}`}
    >
      <svg 
        className="w-4 h-4" 
        fill="currentColor" 
        viewBox="0 0 20 20"
        aria-hidden="true"
      >
        <path 
          fillRule="evenodd" 
          d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" 
          clipRule="evenodd" 
        />
      </svg>
      <span>{error}</span>
    </div>
  )
}
