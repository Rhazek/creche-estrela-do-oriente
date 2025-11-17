'use client'

import React from 'react'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import { Sidebar, useSidebar } from './Sidebar'
import { Button } from '@/components/ui/Button'
import { Menu } from 'lucide-react'
import { useAuth } from '@/hooks/useAuth'

/**
 * Props do componente LayoutWrapper
 */
interface LayoutWrapperProps {
  children: React.ReactNode
  className?: string
  showSidebar?: boolean
}

/**
 * Componente LayoutWrapper
 * Layout principal da aplicação com sidebar e conteúdo
 */
export const LayoutWrapper: React.FC<LayoutWrapperProps> = ({
  children,
  className,
  showSidebar
}) => {
  const { isMobileOpen, setIsMobileOpen } = useSidebar()
  const pathname = usePathname()
  const { user } = useAuth()
  
  // Determinar se deve mostrar a sidebar baseado na autenticação e página
  const shouldShowSidebar = showSidebar !== undefined 
    ? showSidebar 
    : user && !['/', '/login'].includes(pathname)

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Sidebar */}
      {shouldShowSidebar && (
        <Sidebar isMobileOpen={isMobileOpen} setIsMobileOpen={setIsMobileOpen} />
      )}

      {/* Conteúdo principal */}
      <main className={cn(
        'min-h-screen transition-all duration-300',
        shouldShowSidebar ? 'lg:ml-64' : 'ml-0',
        className
      )}>
        {/* Header fixo para mobile */}
        <div className="lg:hidden bg-white border-b border-gray-200 px-4 py-3">
          <div className="flex items-center justify-center relative">
            <h1 className="text-lg font-semibold text-gray-900">
              Creche-Escola
            </h1>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsMobileOpen(true)}
              className="absolute right-0"
            >
              <Menu className="h-5 w-5" />
            </Button>
          </div>
        </div>

        {/* Área de conteúdo */}
        <div className="p-4 lg:p-6">
          {children}
        </div>
      </main>


    </div>
  )
}

/**
 * Componente PageHeader para cabeçalhos de página
 */
interface PageHeaderProps {
  title: string
  subtitle?: string
  action?: React.ReactNode
  breadcrumbs?: Array<{ label: string; href?: string }>
  className?: string
}

export const PageHeader: React.FC<PageHeaderProps> = ({
  title,
  subtitle,
  action,
  breadcrumbs,
  className
}) => {
  return (
    <div className={cn('mb-6', className)}>
      {/* Breadcrumbs */}
      {breadcrumbs && breadcrumbs.length > 0 && (
        <nav className="flex items-center space-x-2 text-sm text-gray-500 mb-2">
          {breadcrumbs.map((crumb, index) => (
            <React.Fragment key={index}>
              {crumb.href ? (
                <a
                  href={crumb.href}
                  className="hover:text-gray-700 transition-colors"
                >
                  {crumb.label}
                </a>
              ) : (
                <span>{crumb.label}</span>
              )}
              {index < breadcrumbs.length - 1 && (
                <span className="text-gray-400">/</span>
              )}
            </React.Fragment>
          ))}
        </nav>
      )}

      {/* Título e ação */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold text-gray-900">
            {title}
          </h1>
          {subtitle && (
            <p className="mt-1 text-gray-600">
              {subtitle}
            </p>
          )}
        </div>
        
        {action && (
          <div className="flex-shrink-0">
            {action}
          </div>
        )}
      </div>
    </div>
  )
}

/**
 * Componente Container para limitar largura do conteúdo
 */
interface ContainerProps {
  children: React.ReactNode
  className?: string
  maxWidth?: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | 'full'
}

export const Container: React.FC<ContainerProps> = ({
  children,
  className,
  maxWidth = 'xl'
}) => {
  const maxWidthClasses = {
    sm: 'max-w-2xl',
    md: 'max-w-4xl',
    lg: 'max-w-6xl',
    xl: 'max-w-7xl',
    '2xl': 'max-w-8xl',
    full: 'max-w-full'
  }

  return (
    <div className={cn(
      'mx-auto px-4 sm:px-6 lg:px-8',
      maxWidthClasses[maxWidth],
      className
    )}>
      {children}
    </div>
  )
}
