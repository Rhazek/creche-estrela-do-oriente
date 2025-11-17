import { forwardRef } from 'react'
import { cn } from '@/lib/utils'

interface CheckboxProps extends React.InputHTMLAttributes<HTMLInputElement> {
  error?: string
  label?: string
}

export const Checkbox = forwardRef<HTMLInputElement, CheckboxProps>(
  ({ error, label, className, ...props }, ref) => {
    return (
      <div className="space-y-1">
        <div className="flex items-center space-x-2">
          <input
            ref={ref}
            type="checkbox"
            className={cn(
              'h-4 w-4 rounded border-gray-300 text-primary-600 focus:ring-primary-500 dark:border-gray-600 dark:bg-gray-800',
              error && 'border-red-500',
              className
            )}
            {...props}
          />
          {label && (
            <label
              htmlFor={props.id}
              className="text-sm font-medium text-gray-700 dark:text-gray-300"
            >
              {label}
            </label>
          )}
        </div>
        {error && (
          <p className="text-sm text-red-600">{error}</p>
        )}
      </div>
    )
  }
)

Checkbox.displayName = 'Checkbox'









