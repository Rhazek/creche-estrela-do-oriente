'use client'

import { useEffect } from 'react'
import { useAuth } from '../hooks/useAuth'
import { useRouter } from 'next/navigation'

export default function Home() {
  const { user, loading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!loading) {
      if (user) {
        // Se o usuário está logado, redireciona para o dashboard
        router.push('/dashboard')
      } else {
        // Se não está logado, redireciona para o login
        router.push('/login')
      }
    }
  }, [user, loading, router])

  // Mostrar loading enquanto redireciona
  return (
    <div className="flex justify-center items-center min-h-screen">
      <div className="text-center">
        <div className="spinner h-12 w-12 mx-auto mb-4"></div>
        <p className="text-gray-600">Carregando...</p>
      </div>
    </div>
  )
}