import React from 'react'
import Image from 'next/image'

export function Logo({ className = 'w-8 h-8' }: { className?: string }) {
  return (
    <Image
      src="/CRECHE.svg"
      alt="Estrela do Oriente"
      width={32}
      height={32}
      className={className}
      priority
    />
  )
}

export function LogoWithText({ showText = true, size = 'md' }: { showText?: boolean, size?: 'sm' | 'md' | 'lg' }) {
  const sizes = {
    sm: { logo: 'w-6 h-6', text: 'text-xs' },
    md: { logo: 'w-8 h-8', text: 'text-sm' },
    lg: { logo: 'w-20 h-20', text: 'text-base' }
  }
  
  const currentSize = sizes[size]
  
  return (
    <div className="flex flex-col items-center gap-1">
      <Logo className={currentSize.logo} />
      {showText && (
        <>
          <h1 className="text-2xl font-bold text-gray-900 mt-2">
            Creche Estrela do Oriente
          </h1>
          <p className="text-sm text-gray-600">
            Sistema de Gestão de Matrículas
          </p>
        </>
      )}
    </div>
  )
}
