'use client'

import React, { forwardRef } from 'react'
import { cn } from '@/lib/utils'
import { AlertCircle, CheckCircle } from 'lucide-react'

interface FormFieldProps {
  label: string
  name: string
  required?: boolean
  error?: string
  helper?: string
  children: React.ReactNode
  className?: string
}

export function FormField({
  label,
  name,
  required = false,
  error,
  helper,
  children,
  className
}: FormFieldProps) {
  return (
    <div className={cn('space-y-1', className)}>
      <label
        htmlFor={name}
        className="block text-sm font-medium text-gray-700 dark:text-gray-300"
      >
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </label>
      
      <div className="relative">
        {children}
        
        {error && (
          <div className="absolute inset-y-0 right-0 flex items-center pr-3">
            <AlertCircle className="h-4 w-4 text-red-500" />
          </div>
        )}
      </div>
      
      {error && (
        <p className="text-sm text-red-600 dark:text-red-400" role="alert">
          {error}
        </p>
      )}
      
      {helper && !error && (
        <p className="text-sm text-gray-500 dark:text-gray-400">
          {helper}
        </p>
      )}
    </div>
  )
}

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  error?: string
  icon?: React.ReactNode
  iconPosition?: 'left' | 'right'
}

export const Input = forwardRef<HTMLInputElement, InputProps>(({
  error,
  icon,
  iconPosition = 'left',
  className,
  type,
  ...props
}, ref) => {
  // Para inputs de data, converter Date → YYYY-MM-DD string para exibição
  let displayValue = props.value
  if (type === 'date' && props.value instanceof Date) {
    displayValue = props.value.toISOString().split('T')[0]
  }

  return (
    <div className="relative">
      {icon && iconPosition === 'left' && (
        <div className="absolute inset-y-0 left-0 flex items-center pl-3">
          {icon}
        </div>
      )}
      
      <input
        ref={ref}
        type={type}
        className={cn(
          'flex h-10 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-gray-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 dark:border-gray-600 dark:bg-gray-800 dark:text-white',
          icon && iconPosition === 'left' && 'pl-10',
          icon && iconPosition === 'right' && 'pr-10',
          error && 'border-red-500 focus-visible:ring-red-500',
          className
        )}
        {...props}
        value={displayValue}
      />
      
      {icon && iconPosition === 'right' && (
        <div className="absolute inset-y-0 right-0 flex items-center pr-3">
          {icon}
        </div>
      )}
    </div>
  )
})

Input.displayName = 'Input'

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  error?: string
  icon?: React.ReactNode
  options: Array<{ value: string; label: string }>
  placeholder?: string
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(({
  error,
  icon,
  options,
  placeholder,
  className,
  ...props
}, ref) => {
  return (
    <div className="relative">
      {icon && (
        <div className="absolute inset-y-0 left-0 flex items-center pl-3">
          {icon}
        </div>
      )}

      <select
        ref={ref}
        className={cn(
          'flex h-10 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 dark:border-gray-600 dark:bg-gray-800 dark:text-white',
          icon && 'pl-10',
          error && 'border-red-500 focus-visible:ring-red-500',
          className
        )}
        {...props}
      >
        {placeholder && (
          <option value="" disabled>
            {placeholder}
          </option>
        )}
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </div>
  )
})

Select.displayName = 'Select'

interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  error?: string
  icon?: React.ReactNode
}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(({
  error,
  icon,
  className,
  ...props
}, ref) => {
  return (
    <div className="relative">
      {icon && (
        <div className="absolute top-3 left-3">
          {icon}
        </div>
      )}

      <textarea
        ref={ref}
        className={cn(
          'flex min-h-[80px] w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm ring-offset-background placeholder:text-gray-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 dark:border-gray-600 dark:bg-gray-800 dark:text-white',
          icon && 'pl-10',
          error && 'border-red-500 focus-visible:ring-red-500',
          className
        )}
        {...props}
      />
    </div>
  )
})

Textarea.displayName = 'Textarea'

interface CheckboxProps extends React.InputHTMLAttributes<HTMLInputElement> {
  error?: string
  label: string
}

export const Checkbox = forwardRef<HTMLInputElement, CheckboxProps>(({
  error,
  label,
  className,
  ...props
}, ref) => {
  return (
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
      <label
        htmlFor={props.id}
        className="text-sm font-medium text-gray-700 dark:text-gray-300"
      >
        {label}
      </label>
    </div>
  )
})

Checkbox.displayName = 'Checkbox'

interface RadioGroupProps {
  name: string
  options: Array<{ value: string; label: string }>
  value?: string
  onChange?: (value: string) => void
  error?: string
  className?: string
}

export function RadioGroup({
  name,
  options,
  value,
  onChange,
  error,
  className
}: RadioGroupProps) {
  return (
    <div className={cn('space-y-2', className)}>
      {options.map((option) => (
        <div key={option.value} className="flex items-center space-x-2">
          <input
            type="radio"
            id={`${name}-${option.value}`}
            name={name}
            value={option.value}
            checked={value === option.value}
            onChange={() => onChange?.(option.value)}
            className={cn(
              'h-4 w-4 border-gray-300 text-primary-600 focus:ring-primary-500 dark:border-gray-600 dark:bg-gray-800',
              error && 'border-red-500'
            )}
          />
          <label
            htmlFor={`${name}-${option.value}`}
            className="text-sm font-medium text-gray-700 dark:text-gray-300"
          >
            {option.label}
          </label>
        </div>
      ))}
    </div>
  )
}

interface CheckboxListProps {
  name: string
  options: string[]
  selectedValues: string[]
  onChange: (values: string[]) => void
  error?: string
  maxHeight?: string
  className?: string
}

export function CheckboxList({
  name,
  options,
  selectedValues,
  onChange,
  error,
  maxHeight = '200px',
  className
}: CheckboxListProps) {
  const handleChange = (option: string, checked: boolean) => {
    if (checked) {
      onChange([...selectedValues, option])
    } else {
      onChange(selectedValues.filter(value => value !== option))
    }
  }

  return (
    <div className={cn('space-y-2', className)}>
      <div
        className="border border-gray-300 rounded-md p-3 overflow-y-auto dark:border-gray-600"
        style={{ maxHeight }}
      >
        {options.map((option) => (
          <div key={option} className="flex items-center space-x-2 py-1">
            <input
              type="checkbox"
              id={`${name}-${option}`}
              checked={selectedValues.includes(option)}
              onChange={(e) => handleChange(option, e.target.checked)}
              className={cn(
                'h-4 w-4 rounded border-gray-300 text-primary-600 focus:ring-primary-500 dark:border-gray-600 dark:bg-gray-800',
                error && 'border-red-500'
              )}
            />
            <label
              htmlFor={`${name}-${option}`}
              className="text-sm text-gray-700 dark:text-gray-300"
            >
              {option}
            </label>
          </div>
        ))}
      </div>
      
      {error && (
        <p className="text-sm text-red-600 dark:text-red-400" role="alert">
          {error}
        </p>
      )}
    </div>
  )
}

interface ToggleIconProps {
  name: string
  label: string
  icon: React.ReactNode
  checked: boolean
  onChange: (checked: boolean) => void
  className?: string
}

export function ToggleIcon({
  name,
  label,
  icon,
  checked,
  onChange,
  className
}: ToggleIconProps) {
  return (
    <div className={cn('flex flex-col items-center space-y-2', className)}>
      <button
        type="button"
        onClick={() => onChange(!checked)}
        className={cn(
          'w-16 h-16 rounded-lg border-2 flex items-center justify-center transition-colors',
          checked
            ? 'border-primary-500 bg-primary-50 text-primary-600'
            : 'border-gray-300 bg-white text-gray-400 hover:border-gray-400 dark:border-gray-600 dark:bg-gray-800'
        )}
      >
        {icon}
      </button>
      <span className="text-xs text-center text-gray-600 dark:text-gray-400">
        {label}
      </span>
      <input
        type="checkbox"
        name={name}
        checked={checked}
        onChange={() => onChange(!checked)}
        className="sr-only"
      />
    </div>
  )
}
