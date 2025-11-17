'use client'

import React from 'react'
import { cn } from '@/lib/utils'
import { Loader2 } from 'lucide-react'

/**
 * Props do componente Button
 */
interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger'
  size?: 'sm' | 'md' | 'lg'
  loading?: boolean
  icon?: React.ReactNode
  iconPosition?: 'left' | 'right'
  fullWidth?: boolean
}

/**
 * Componente Button moderno e reutilizável
 * Suporta diferentes variantes, tamanhos e estados
 */
export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({
    className,
    variant = 'primary',
    size = 'md',
    loading = false,
    icon,
    iconPosition = 'left',
    fullWidth = false,
    children,
    disabled,
    ...props
  }, ref) => {
    // Classes base para todos os botões
    const baseClasses = [
      'inline-flex items-center justify-center',
      'font-medium rounded-lg',
      'transition-all duration-200',
      'focus:outline-none focus:ring-2 focus:ring-offset-2',
      'disabled:opacity-50 disabled:cursor-not-allowed',
      'active:scale-95'
    ]

    // Variantes de cor
    const variants = {
      primary: [
        'bg-primary-600 text-white',
        'hover:bg-primary-700',
        'focus:ring-primary-500',
        'shadow-sm hover:shadow-md'
      ],
      secondary: [
        'bg-gray-100 text-gray-900',
        'hover:bg-gray-200',
        'focus:ring-gray-500',
        'border border-gray-300'
      ],
      outline: [
        'bg-transparent text-primary-600',
        'hover:bg-primary-50',
        'focus:ring-primary-500',
        'border border-primary-600'
      ],
      ghost: [
        'bg-transparent text-gray-700',
        'hover:bg-gray-100',
        'focus:ring-gray-500'
      ],
      danger: [
        'bg-red-600 text-white',
        'hover:bg-red-700',
        'focus:ring-red-500',
        'shadow-sm hover:shadow-md'
      ]
    }

    // Tamanhos
    const sizes = {
      sm: 'px-3 py-1.5 text-sm gap-1.5',
      md: 'px-4 py-2 text-sm gap-2',
      lg: 'px-6 py-3 text-base gap-2.5'
    }

    // Classes finais
    const classes = cn(
      baseClasses,
      variants[variant],
      sizes[size],
      fullWidth && 'w-full',
      className
    )

    // Ícone de loading
    const loadingIcon = loading && <Loader2 className="animate-spin" />

    // Renderizar ícone
    const renderIcon = () => {
      if (loading) return loadingIcon
      if (icon) return icon
      return null
    }

    return (
      <button
        ref={ref}
        className={classes}
        disabled={disabled || loading}
        {...props}
      >
        {iconPosition === 'left' && renderIcon()}
        {children}
        {iconPosition === 'right' && renderIcon()}
      </button>
    )
  }
)

Button.displayName = 'Button'

/**
 * Variantes de botão para uso comum
 */
export const ButtonVariants = {
  Primary: (props: Omit<ButtonProps, 'variant'>) => <Button variant="primary" {...props} />,
  Secondary: (props: Omit<ButtonProps, 'variant'>) => <Button variant="secondary" {...props} />,
  Outline: (props: Omit<ButtonProps, 'variant'>) => <Button variant="outline" {...props} />,
  Ghost: (props: Omit<ButtonProps, 'variant'>) => <Button variant="ghost" {...props} />,
  Danger: (props: Omit<ButtonProps, 'variant'>) => <Button variant="danger" {...props} />,
}

