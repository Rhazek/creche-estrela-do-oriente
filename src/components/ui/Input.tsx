'use client'

import React from 'react'
import { cn } from '@/lib/utils'
import { AlertCircle } from 'lucide-react'

/**
 * Converte uma data para o formato YYYY-MM-DD usado por input[type=date]
 */
const formatDateForInput = (date: Date): string => {
  return date.toISOString().split('T')[0]
}

/**
 * Props do componente Input
 */
interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string
  error?: string
  helperText?: string
  icon?: React.ReactNode
  iconPosition?: 'left' | 'right'
  fullWidth?: boolean
}

/**
 * Componente Input moderno e reutilizável
 * Suporta diferentes estados e validações
 */
export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({
    className,
    type = 'text',
    label,
    error,
    helperText,
    icon,
    iconPosition = 'left',
    fullWidth = false,
    ...props
  }, ref) => {
    const { defaultValue, value } = props

    // Se defaultValue for Date, converter para YYYY-MM-DD (para input[type=date])
    const defaultValConverted =
      defaultValue instanceof Date ? formatDateForInput(defaultValue) : defaultValue

    // Só passar `value` se foi explicitamente fornecido (comportamento controlado).
    // Caso contrário, passar `defaultValue` para manter o input como uncontrolled,
    // permitindo que react-hook-form faça o controle via register/reset.
    const inputProps: any = { type, ref, ...props }
    if (value !== undefined) {
      inputProps.value = value
    } else if (defaultValConverted !== undefined) {
      inputProps.defaultValue = defaultValConverted
    }

    // Classes base
    const baseClasses = [
      'block w-full',
      'px-3 py-2',
      'text-sm',
      'border rounded-lg',
      'transition-all duration-200',
      'focus:outline-none focus:ring-2 focus:ring-offset-0',
      'disabled:opacity-50 disabled:cursor-not-allowed',
      'placeholder:text-gray-400'
    ]

    // Estados
    const stateClasses = error ? [
      'border-red-300',
      'focus:border-red-500 focus:ring-red-500',
      'text-red-900'
    ] : [
      'border-gray-300',
      'focus:border-primary-500 focus:ring-primary-500',
      'text-gray-900'
    ]

    // Padding com ícone
    const paddingClasses = icon ? [
      iconPosition === 'left' ? 'pl-10' : 'pl-3',
      iconPosition === 'right' ? 'pr-10' : 'pr-3'
    ] : []

    const classes = cn(
      baseClasses,
      stateClasses,
      paddingClasses,
      fullWidth && 'w-full',
      className
    )

    return (
      <div className={cn('space-y-1', fullWidth && 'w-full')}>
        {label && (
          <label className="block text-sm font-medium text-gray-700">
            {label}
            {props.required && <span className="text-red-500 ml-1">*</span>}
          </label>
        )}
        
        <div className="relative">
          {icon && iconPosition === 'left' && (
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <div className="text-gray-400">
                {icon}
              </div>
            </div>
          )}
          
          {/* Input principal com suporte a Date para inputs type="date" */}
          {(() => {
            const propValue = (props as any).value
            const propDefault = (props as any).defaultValue
            
            // Preparar props do input
            const inputProps = { ...(props as any) }
            delete inputProps.value
            delete inputProps.defaultValue

            // Se temos value explícito, usar como controlado
            if (propValue !== undefined) {
              if (type === 'date' && propValue instanceof Date) {
                inputProps.value = propValue.toISOString().split('T')[0]
              } else {
                inputProps.value = propValue
              }
            } 
            // Caso contrário, usar defaultValue (não controlado - melhor para react-hook-form)
            else if (propDefault !== undefined) {
              if (type === 'date' && propDefault instanceof Date) {
                inputProps.defaultValue = propDefault.toISOString().split('T')[0]
              } else {
                inputProps.defaultValue = propDefault
              }
            }

            return (
              <input
                ref={ref}
                type={type}
                className={classes}
                {...inputProps}
              />
            )
          })()}
          
          {icon && iconPosition === 'right' && (
            <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
              <div className="text-gray-400">
                {icon}
              </div>
            </div>
          )}
          
          {error && (
            <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
              <AlertCircle className="h-4 w-4 text-red-500" />
            </div>
          )}
        </div>
        
        {error && (
          <p className="text-sm text-red-600 flex items-center gap-1">
            <AlertCircle className="h-3 w-3" />
            {error}
          </p>
        )}
        
        {helperText && !error && (
          <p className="text-sm text-gray-500">
            {helperText}
          </p>
        )}
      </div>
    )
  }
)

Input.displayName = 'Input'

/**
 * Componente Select moderno
 */
interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string
  error?: string
  helperText?: string
  options: Array<{ value: string; label: string; disabled?: boolean }>
  placeholder?: string
  fullWidth?: boolean
}

export const Select = React.forwardRef<HTMLSelectElement, SelectProps>(
  ({
    className,
    label,
    error,
    helperText,
    options,
    placeholder,
    fullWidth = false,
    ...props
  }, ref) => {
    const baseClasses = [
      'block w-full',
      'px-3 py-2',
      'text-sm',
      'border rounded-lg',
      'transition-all duration-200',
      'focus:outline-none focus:ring-2 focus:ring-offset-0',
      'disabled:opacity-50 disabled:cursor-not-allowed',
      'bg-white'
    ]

    const stateClasses = error ? [
      'border-red-300',
      'focus:border-red-500 focus:ring-red-500',
      'text-red-900'
    ] : [
      'border-gray-300',
      'focus:border-primary-500 focus:ring-primary-500',
      'text-gray-900'
    ]

    const classes = cn(
      baseClasses,
      stateClasses,
      fullWidth && 'w-full',
      className
    )

    return (
      <div className={cn('space-y-1', fullWidth && 'w-full')}>
        {label && (
          <label className="block text-sm font-medium text-gray-700">
            {label}
            {props.required && <span className="text-red-500 ml-1">*</span>}
          </label>
        )}
        
        <select
          ref={ref}
          className={classes}
          {...props}
        >
          {placeholder && (
            <option value="" disabled>
              {placeholder}
            </option>
          )}
          {options.map((option) => (
            <option
              key={option.value}
              value={option.value}
              disabled={option.disabled}
            >
              {option.label}
            </option>
          ))}
        </select>
        
        {error && (
          <p className="text-sm text-red-600 flex items-center gap-1">
            <AlertCircle className="h-3 w-3" />
            {error}
          </p>
        )}
        
        {helperText && !error && (
          <p className="text-sm text-gray-500">
            {helperText}
          </p>
        )}
      </div>
    )
  }
)

Select.displayName = 'Select'

