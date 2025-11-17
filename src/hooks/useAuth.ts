'use client'

import { useState, useEffect } from 'react'
import { User, onAuthStateChanged, signOut } from 'firebase/auth'
import { doc, getDoc } from 'firebase/firestore'
import { auth, db } from '@/lib/firebase'

interface UserProfile {
  uid: string
  email: string | null
  nomeCompleto: string
  cpf: string
  perfil: 'funcionario' | 'administrador'
  status?: 'pending' | 'approved' | 'rejected'
}

export function useAuth() {
  const [user, setUser] = useState<User | null>(null)
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null)
  const [loading, setLoading] = useState(true)
  const [isApproved, setIsApproved] = useState(false)

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      // Auth state updated
      setUser(user)
      
      if (user) {
        try {
          // Checking user status
          
          // Verificar se está na coleção usuarios (usuários aprovados)
          const userDoc = await getDoc(doc(db, 'usuarios', user.uid))
          
          if (userDoc.exists()) {
            const userData = userDoc.data()
            
            // Verificar se o usuário foi marcado como deletado
            if (userData.deletado) {
              // User marked as deleted, removing access
              // Fazer logout do usuário
              await auth.signOut()
              setUserProfile(null)
              setIsApproved(false)
              localStorage.removeItem('userProfile')
              return
            }
            
            const profile = {
              uid: user.uid,
              email: user.email,
              nomeCompleto: userData.nomeCompleto || user.email || 'Usuário',
              cpf: userData.cpf || '',
              perfil: (userData.perfil || 'funcionario') as 'funcionario' | 'administrador',
              status: 'approved' as 'pending' | 'approved' | 'rejected'
            }
            
            setUserProfile(profile as UserProfile)
            setIsApproved(true)
            localStorage.setItem('userProfile', JSON.stringify(profile))
          } else {
            // Usuário não encontrado na coleção 'usuarios' — acesso negado
            try {
              await auth.signOut()
            } catch (e) {
              console.error('Erro ao encerrar sessão de usuário não autorizado:', e)
            }
            setUserProfile(null)
            setIsApproved(false)
            localStorage.removeItem('userProfile')
            return
          }
        } catch (error) {
          console.error('Erro ao verificar status do usuário:', error)
          // Fallback para localStorage
          const profile = localStorage.getItem('userProfile')
          if (profile) {
            try {
              const parsedProfile = JSON.parse(profile)
              setUserProfile(parsedProfile)
              setIsApproved(parsedProfile.status === 'approved')
            } catch (e) {
              console.error('Erro ao carregar perfil do localStorage:', e)
            }
          }
        }
      } else {
        setUserProfile(null)
        setIsApproved(false)
        localStorage.removeItem('userProfile')
      }
      
      setLoading(false)
    })

    return () => unsubscribe()
  }, [])

  // Função para verificar se o usuário tem permissão de administrador
  const isAdmin = () => {
    return userProfile?.perfil === 'administrador' && isApproved
  }

  // Função para verificar se o usuário tem permissão de funcionário
  const isEmployee = () => {
    return (userProfile?.perfil === 'funcionario' || userProfile?.perfil === 'administrador') && isApproved
  }

  // Função para logout explícito chamada por componentes
  const logout = async () => {
    try {
      await signOut(auth)
    } catch (error) {
      console.error('Erro ao fazer logout:', error)
    } finally {
      setUser(null)
      setUserProfile(null)
      setIsApproved(false)
      localStorage.removeItem('userProfile')
    }
  }

  return { 
    user, 
    userProfile, 
    loading, 
    isAdmin, 
    isEmployee,
    isApproved,
    logout
  }
}