'use client'

import React, { useState } from 'react'
import { signInWithEmailAndPassword } from 'firebase/auth'
import { auth } from '@/lib/firebase'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { 
  Mail, 
  Lock, 
  Eye, 
  EyeOff,
  ArrowRight,
  AlertCircle
} from 'lucide-react'
import { LogoWithText } from '@/components/Logo'

export default function LoginForm() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    
    if (!email.trim() || !password.trim()) {
      setError('Por favor, preencha todos os campos')
      return
    }

    setLoading(true)

    try {
      await signInWithEmailAndPassword(auth, email, password)
      router.push('/dashboard')
    } catch (error: any) {
      console.error('Erro no login:', error)
      
      if (error.code === 'auth/user-not-found') {
        setError('Usuário não encontrado')
      } else if (error.code === 'auth/wrong-password') {
        setError('Senha incorreta')
      } else if (error.code === 'auth/invalid-email') {
        setError('Email inválido')
      } else if (error.code === 'auth/invalid-credential') {
        setError('Email ou senha incorretos')
      } else {
        setError('Erro ao fazer login. Tente novamente.')
      }
    } finally {
      setLoading(false)
    }
  }

  const handleInputChange = (field: string, value: string) => {
    if (field === 'email') setEmail(value)
    if (field === 'password') setPassword(value)
    if (error) setError('') // Limpar erro ao digitar
  }

  return (
    <div className="w-full max-w-md px-4">
      <Card className="shadow-xl border border-gray-200">
        <CardContent className="p-8">
          <div className="flex justify-center mb-6">
            <LogoWithText size="lg" />
          </div>

          <h2 className="text-2xl font-bold text-center mb-2 text-gray-900">
            Entrar
          </h2>
          <p className="text-sm text-gray-600 text-center mb-6">
            Acesse sua conta para continuar
          </p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              type="email"
              label="Email"
              value={email}
              onChange={(e) => handleInputChange('email', e.target.value)}
              required
              icon={<Mail className="h-4 w-4 text-gray-400" />}
              placeholder="seu@email.com"
            />
            
            <Input
              type={showPassword ? 'text' : 'password'}
              label="Senha"
              value={password}
              onChange={(e) => handleInputChange('password', e.target.value)}
              required
              icon={
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              }
              iconPosition="right"
              placeholder="••••••••"
            />

            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-3 flex items-center space-x-2">
                <AlertCircle className="h-5 w-5 text-red-600" />
                <p className="text-red-600 text-sm">{error}</p>
              </div>
            )}

            <Button
              type="submit"
              loading={loading}
              fullWidth
              size="lg"
              className="flex items-center justify-center gap-2"
            >
              Entrar
              <ArrowRight className="h-4 w-4" />
            </Button>
          </form>

          <div className="mt-6 pt-6 border-t border-gray-200">
            <p className="text-center text-sm text-gray-600">
              Caso não tenha acesso, solicite ao administrador.
            </p>
          </div>
        </CardContent>
      </Card>

      <div className="text-center mt-6">
        <p className="text-xs text-gray-500">
          © 2025 Creche Estrela do Oriente. Todos os direitos reservados.
        </p>
      </div>
    </div>
  )
}

