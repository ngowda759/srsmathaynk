/**
 * Accessible Input Component
 * Form input with built-in accessibility features
 */
import { forwardRef, InputHTMLAttributes, useId } from 'react'
import { FormError } from './FormError'

interface AccessibleInputProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string
  error?: string
  helpText?: string
  hideLabel?: boolean
}

export const AccessibleInput = forwardRef<HTMLInputElement, AccessibleInputProps>(
  function AccessibleInput(
    { 
      label, 
      error, 
      helpText,
      hideLabel = false,
      id: providedId,
      className = '',
      ...props 
    },
    ref
  ) {
    const generatedId = useId()
    const id = providedId || generatedId
    const errorId = `${id}-error`
    const helpId = `${id}-help`

    return (
      <div className="w-full">
        <label 
          htmlFor={id}
          className={`block text-sm font-medium text-gray-700 ${hideLabel ? 'sr-only' : ''}`}
        >
          {label}
          {props.required && <span aria-hidden="true" className="text-red-500 ml-1">*</span>}
        </label>

        <div className="mt-1">
          <input
            ref={ref}
            id={id}
            aria-invalid={error ? 'true' : 'false'}
            aria-describedby={
              [
                error ? errorId : null,
                helpText ? helpId : null,
              ].filter(Boolean).join(' ') || undefined
            }
            className={`
              block w-full rounded-md shadow-sm
              ${error 
                ? 'border-red-300 focus:border-red-500 focus:ring-red-500' 
                : 'border-gray-300 focus:border-primary-500 focus:ring-primary-500'
              }
              ${props.disabled ? 'bg-gray-100 cursor-not-allowed' : ''}
              ${className}
            `}
            {...props}
          />
        </div>

        {helpText && !error && (
          <p id={helpId} className="mt-1 text-sm text-gray-500">
            {helpText}
          </p>
        )}

        <FormError id={errorId} error={error} />
      </div>
    )
  }
)
