'use client'

import React from 'react'
import { cn } from '@/lib/utils'

/**
 * Props do componente Card
 */
interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'outlined' | 'elevated' | 'flat'
  padding?: 'none' | 'sm' | 'md' | 'lg'
  hover?: boolean
}

/**
 * Componente Card moderno e reutilizável
 * Usado para agrupar conteúdo relacionado
 */
export const Card = React.forwardRef<HTMLDivElement, CardProps>(
  ({
    className,
    variant = 'default',
    padding = 'md',
    hover = false,
    children,
    ...props
  }, ref) => {
    // Classes base
    const baseClasses = [
      'rounded-xl',
      'transition-all duration-200',
      'bg-white'
    ]

    // Variantes
    const variants = {
      default: 'border border-gray-200',
      outlined: 'border-2 border-gray-300',
      elevated: 'shadow-lg border-0',
      flat: 'border-0 shadow-none'
    }

    // Padding
    const paddings = {
      none: '',
      sm: 'p-3',
      md: 'p-4',
      lg: 'p-6'
    }

    // Hover effect
    const hoverClasses = hover ? [
      'hover:shadow-md',
      'hover:border-gray-300',
      'cursor-pointer'
    ] : []

    const classes = cn(
      baseClasses,
      variants[variant],
      paddings[padding],
      hoverClasses,
      className
    )

    return (
      <div
        ref={ref}
        className={classes}
        {...props}
      >
        {children}
      </div>
    )
  }
)

Card.displayName = 'Card'

/**
 * Componente CardHeader para cabeçalhos de card
 */
interface CardHeaderProps extends React.HTMLAttributes<HTMLDivElement> {
  title?: string
  subtitle?: string
  action?: React.ReactNode
}

export const CardHeader = React.forwardRef<HTMLDivElement, CardHeaderProps>(
  ({ className, title, subtitle, action, children, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn('flex items-start justify-between mb-4', className)}
        {...props}
      >
        <div className="flex-1">
          {title && (
            <h3 className="text-lg font-semibold text-gray-900 mb-1">
              {title}
            </h3>
          )}
          {subtitle && (
            <p className="text-sm text-gray-600">
              {subtitle}
            </p>
          )}
          {children}
        </div>
        {action && (
          <div className="ml-4">
            {action}
          </div>
        )}
      </div>
    )
  }
)

CardHeader.displayName = 'CardHeader'

/**
 * Componente CardContent para conteúdo do card
 */
export const CardContent = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn('text-gray-700', className)}
        {...props}
      />
    )
  }
)

CardContent.displayName = 'CardContent'

/**
 * Componente CardFooter para rodapés de card
 */
export const CardFooter = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn('flex items-center justify-between pt-4 mt-4 border-t border-gray-200', className)}
        {...props}
      />
    )
  }
)

CardFooter.displayName = 'CardFooter'

