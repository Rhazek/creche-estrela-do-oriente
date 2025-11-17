'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { cn } from '@/lib/utils'
import { useAuth } from '@/hooks/useAuth'
import { signOut } from 'firebase/auth'
import { auth } from '@/lib/firebase'
import {
  LayoutDashboard,
  RotateCcw,
  BarChart3,
  Menu,
  X,
  LogOut,
  User,
  UserCheck,
  ClipboardList
} from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { ConfirmDialog, useConfirmDialog } from '@/components/ui/ConfirmDialog'
import { Logo } from '@/components/Logo'

/**
 * Item de navegação da sidebar
 */
interface NavItem {
  label: string
  href: string
  icon: React.ReactNode
  roles?: Array<'funcionario' | 'administrador'>
}

/**
 * Props do componente Sidebar
 */
interface SidebarProps {
  className?: string
}

/**
 * Componente Sidebar responsiva e moderna
 * Navegação lateral com ícones e labels
 */
export const Sidebar: React.FC<SidebarProps> = ({ className }) => {
  const [isCollapsed, setIsCollapsed] = useState(false)
  const [isMobileOpen, setIsMobileOpen] = useState(false)
  const [isLoggingOut, setIsLoggingOut] = useState(false)
  const pathname = usePathname()
  const router = useRouter()
  const { user, userProfile, isAdmin } = useAuth()
  const { isOpen, config, confirm, close, handleConfirm } = useConfirmDialog()

  const handleLogout = () => {
    confirm({
      title: 'Confirmar Logout',
      message: 'Tem certeza que deseja sair do sistema?\n\nVocê precisará fazer login novamente para acessar suas informações.',
      variant: 'warning',
      onConfirm: async () => {
        setIsLoggingOut(true)
        try {
          await signOut(auth)
          // Limpar dados do usuário do localStorage
          localStorage.removeItem('userProfile')
          // Redirecionar para a página inicial
          router.push('/')
        } catch (error) {
          console.error('Erro ao fazer logout:', error)
          alert('Erro ao fazer logout. Tente novamente.')
        } finally {
          setIsLoggingOut(false)
        }
      }
    })
  }

      // Itens de navegação
      const navItems: NavItem[] = [
        {
          label: 'Dashboard',
          href: '/dashboard',
          icon: <LayoutDashboard className="h-5 w-5" />,
          roles: ['funcionario', 'administrador']
        },
        {
          label: 'Pré-Matrículas',
          href: '/pre-matriculas',
          icon: <ClipboardList className="h-5 w-5" />,
          roles: ['funcionario', 'administrador']
        },
        {
          label: 'Matrículas',
          href: '/matriculas',
          icon: <UserCheck className="h-5 w-5" />,
          roles: ['funcionario', 'administrador']
        },
        {
          label: 'Rematrículas',
          href: '/rematriculas',
          icon: <RotateCcw className="h-5 w-5" />,
          roles: ['funcionario', 'administrador']
        },
        {
          label: 'Relatórios',
          href: '/relatorios',
          icon: <BarChart3 className="h-5 w-5" />,
          roles: ['funcionario', 'administrador']
        },
        {
          label: 'Usuários',
          href: '/aprovacao',
          icon: <UserCheck className="h-5 w-5" />,
          roles: ['administrador']
        }
      ]

  // Filtrar itens baseado no perfil do usuário
  const filteredNavItems = navItems.filter(item => {
    if (!item.roles) return true
    if (!userProfile) return false
    return item.roles.includes(userProfile.perfil)
  })

  // Verificar se item está ativo
  const isActive = (href: string) => {
    if (href === '/dashboard') {
      return pathname === '/dashboard'
    }
    return pathname.startsWith(href)
  }

  // Classes da sidebar
  const sidebarClasses = cn(
    'fixed left-0 top-0 z-50',
    'h-full bg-white border-r border-gray-200',
    'transition-all duration-300 ease-in-out',
    'flex flex-col',
    isCollapsed ? 'w-16' : 'w-64',
    className
  )

  // Classes do overlay mobile
  const overlayClasses = cn(
    'fixed inset-0 bg-black bg-opacity-50 z-40',
    'lg:hidden',
    isMobileOpen ? 'block' : 'hidden'
  )

  return (
    <>
      {/* Overlay para mobile */}
      <div
        className={overlayClasses}
        onClick={() => setIsMobileOpen(false)}
      />

      {/* Sidebar */}
      <aside className={sidebarClasses}>
        {/* Header da Sidebar */}
        <div className={cn(
          'p-4 border-b border-gray-200',
          isCollapsed ? 'flex flex-col items-center gap-2' : 'flex items-center justify-between'
        )}>
          <div className={cn(!isCollapsed ? 'flex items-center space-x-2' : 'flex items-center justify-center') }>
            <Logo className="w-8 h-8" />
            {!isCollapsed && (
              <span className="font-semibold text-gray-900">Estrela do Oriente</span>
            )}
          </div>

          {/* Quando expandido, menu fica à direita. Quando colapsado, mostrar botão abaixo (centralizado). */}
          {!isCollapsed ? (
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsCollapsed(!isCollapsed)}
                className="lg:flex hidden"
                aria-label="Toggle sidebar"
              >
                <Menu className="h-4 w-4" />
              </Button>

              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsMobileOpen(false)}
                className="lg:hidden"
                aria-label="Close sidebar"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          ) : (
            <div className="w-full flex justify-center">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsCollapsed(!isCollapsed)}
                aria-label="Abrir menu"
                className="p-0"
              >
                <Menu className="h-5 w-5 text-gray-700" />
              </Button>
            </div>
          )}
        </div>

        {/* Navegação */}
        <nav className="flex-1 p-3">
          <div className="space-y-2">
            {filteredNavItems.map((item) => {
              const active = isActive(item.href)

              const baseClass = isCollapsed
                ? 'flex items-center justify-center w-9 h-9 rounded-lg transition-all duration-200 mx-0.5'
                : 'flex items-center space-x-3 px-3 py-2 rounded-lg transition-all duration-200'

              const activeClass = isCollapsed
                ? 'bg-primary-50 text-primary-700 ring-2 ring-primary-600 ring-offset-2 ring-offset-white'
                : 'bg-primary-50 text-primary-700'

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    baseClass,
                    'hover:bg-gray-100',
                    active ? activeClass : 'text-gray-700 hover:text-gray-900'
                  )}
                  onClick={() => setIsMobileOpen(false)}
                >
                  <div className={cn('flex items-center justify-center')}>{item.icon}</div>
                  {!isCollapsed && (
                    <span className="font-medium truncate">{item.label}</span>
                  )}
                </Link>
              )
            })}
          </div>
        </nav>

        {/* Footer da Sidebar */}
        <div className="p-4 border-t border-gray-200">
          {user && userProfile && (
            <div className={cn(
              'flex items-center space-x-3 mb-4',
              isCollapsed && 'justify-center'
            )}>
              <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center">
                <User className="h-4 w-4 text-gray-600" />
              </div>
              {!isCollapsed && (
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">
                    {userProfile.nomeCompleto}
                  </p>
                  <p className="text-xs text-gray-500">
                    {userProfile.perfil === 'administrador' ? 'Administrador' : 'Funcionário'}
                  </p>
                </div>
              )}
            </div>
          )}
          
          <Button
            variant="ghost"
            size="sm"
            className={cn('w-full text-gray-700 hover:text-red-600', isCollapsed ? 'justify-center' : 'justify-start')}
            onClick={handleLogout}
            aria-label="Sair"
          >
            <LogOut className={cn('h-4 w-4', isCollapsed ? '' : 'mr-2')} />
            {!isCollapsed && 'Sair'}
          </Button>
        </div>
      </aside>

      {/* Dialog de confirmação */}
      <ConfirmDialog
        isOpen={isOpen}
        onClose={close}
        onConfirm={handleConfirm}
        title={config?.title || ''}
        message={config?.message || ''}
        variant={config?.variant || 'default'}
        loading={isLoggingOut}
        confirmText="Sim, sair"
        cancelText="Cancelar"
      />
    </>
  )
}

/**
 * Hook para controlar a sidebar
 */
export const useSidebar = () => {
  const [isMobileOpen, setIsMobileOpen] = useState(false)
  
  return {
    isMobileOpen,
    setIsMobileOpen,
    toggleMobile: () => setIsMobileOpen(!isMobileOpen)
  }
}
