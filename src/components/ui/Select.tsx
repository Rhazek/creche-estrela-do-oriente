import * as React from 'react'
import { cn } from '@/lib/utils'

export interface SelectProps
  extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string
  icon?: React.ReactNode
  error?: string
}

const Select = React.forwardRef<HTMLSelectElement, SelectProps>(
  ({ className, label, icon, error, ...props }, ref) => {
    return (
      <div className="space-y-1">
        {label && (
          <label htmlFor={props.id || props.name} className="block text-sm font-medium text-gray-700 dark:text-gray-300">
            {label}
          </label>
        )}
        <div className="relative">
          {icon && (
            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
              {icon}
            </div>
          )}
          <select
            className={cn(
              'flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50',
              icon && 'pl-10',
              error && 'border-error-500 focus-visible:ring-error-500',
              className
            )}
            ref={ref}
            {...props}
          />
        </div>
        {error && (
          <p className="text-sm text-error-500">{error}</p>
        )}
      </div>
    )
  }
)
Select.displayName = 'Select'

export { Select }




