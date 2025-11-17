'use client'

import React, { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { useAuth } from '@/hooks/useAuth'
import AuthGuard from '@/components/AuthGuard'
import RoleGuard from '@/components/RoleGuard'
import { EnrollmentService, FirestoreHistoryEntry, FirestoreEnrollment } from '@/lib/enrollment-service'
import { PageHeader, Container } from '@/components/layout/LayoutWrapper'
import { Card, CardContent, CardHeader } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { ArrowLeft, History, User, Clock, FileText, CheckCircle, XCircle, Edit, Trash2, AlertCircle } from 'lucide-react'
import { Badge } from '@/components/ui/Badge'
import toast from 'react-hot-toast'

export default function EnrollmentHistoryPage() {
  const router = useRouter()
  const params = useParams()
  const { user } = useAuth()
  const enrollmentId = params.id as string
  
  const [enrollment, setEnrollment] = useState<FirestoreEnrollment | null>(null)
  const [history, setHistory] = useState<FirestoreHistoryEntry[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    loadData()
  }, [enrollmentId])

  const loadData = async () => {
    try {
      setIsLoading(true)
      setError(null)
      
      // Carregar matrícula e histórico em paralelo
      const [enrollmentData, historyData] = await Promise.all([
        EnrollmentService.getEnrollment(enrollmentId),
        EnrollmentService.getEnrollmentHistory(enrollmentId)
      ])
      
      if (!enrollmentData) {
        setError('Matrícula não encontrada')
        return
      }

      setEnrollment(enrollmentData)
      setHistory(historyData)
      
    } catch (error) {
      console.error('Erro ao carregar histórico:', error)
      setError('Erro ao carregar histórico')
      toast.error('Erro ao carregar histórico')
    } finally {
      setIsLoading(false)
    }
  }

  const formatDate = (timestamp: any): string => {
    if (!timestamp) return 'N/A'
    
    let date: Date
    if (timestamp.toDate && typeof timestamp.toDate === 'function') {
      date = timestamp.toDate()
    } else if (timestamp instanceof Date) {
      date = timestamp
    } else if (typeof timestamp === 'string') {
      date = new Date(timestamp)
    } else {
      return 'Data inválida'
    }
    
    return date.toLocaleString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const getActionIcon = (action: string) => {
    switch (action) {
      case 'created':
        return <FileText className="h-5 w-5 text-success-600" />
      case 'updated':
        return <Edit className="h-5 w-5 text-primary-600" />
      case 'approved':
        return <CheckCircle className="h-5 w-5 text-success-600" />
      case 'rejected':
        return <XCircle className="h-5 w-5 text-error-600" />
      case 'deleted':
        return <Trash2 className="h-5 w-5 text-error-600" />
      default:
        return <AlertCircle className="h-5 w-5 text-gray-600" />
    }
  }

  const getActionLabel = (action: string): string => {
    switch (action) {
      case 'created':
        return 'Criada'
      case 'updated':
        return 'Atualizada'
      case 'approved':
        return 'Aprovada'
      case 'rejected':
        return 'Rejeitada'
      case 'deleted':
        return 'Deletada'
      default:
        return action
    }
  }

  const getActionBadge = (action: string) => {
    const label = getActionLabel(action)
    let variant: 'success' | 'warning' | 'danger' | 'secondary' = 'secondary'
    
    switch (action) {
      case 'created':
      case 'approved':
        variant = 'success'
        break
      case 'updated':
        variant = 'secondary'
        break
      case 'rejected':
      case 'deleted':
        variant = 'danger'
        break
      default:
        variant = 'secondary'
    }
    
    return <Badge variant={variant}>{label}</Badge>
  }

  const formatFieldName = (field: string): string => {
    // Traduzir nomes de campos para português
    const fieldMap: Record<string, string> = {
      nome: 'Nome',
      dataNascimento: 'Data de Nascimento',
      sexo: 'Sexo',
      corRaca: 'Cor/Raça',
      logradouro: 'Logradouro',
      numero: 'Número',
      bairro: 'Bairro',
      municipio: 'Município',
      cep: 'CEP',
      serie: 'Série',
      anoLetivo: 'Ano Letivo',
      status: 'Status',
      rendaFamiliarTotal: 'Renda Familiar Total',
      rendaPerCapita: 'Renda Per Capita'
    }
    
    return fieldMap[field] || field
  }

  const formatValue = (value: any): string => {
    if (value === null || value === undefined) return '(vazio)'
    if (typeof value === 'boolean') return value ? 'Sim' : 'Não'
    if (typeof value === 'object' && !Array.isArray(value)) return JSON.stringify(value)
    if (Array.isArray(value)) return value.join(', ')
    return String(value)
  }

  if (isLoading) {
    return (
      <AuthGuard>
        <RoleGuard allowedRoles={['funcionario', 'administrador']}>
          <Container>
            <div className="flex justify-center items-center h-64">
              <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
                <p className="mt-4 text-gray-600">Carregando histórico...</p>
              </div>
            </div>
          </Container>
        </RoleGuard>
      </AuthGuard>
    )
  }

  if (error) {
    return (
      <AuthGuard>
        <RoleGuard allowedRoles={['funcionario', 'administrador']}>
          <Container>
            <Card>
              <CardContent className="p-8 text-center">
                <AlertCircle className="h-16 w-16 text-red-500 mx-auto mb-4" />
                <h2 className="text-xl font-semibold text-gray-900 mb-2">
                  Erro ao carregar histórico
                </h2>
                <p className="text-gray-600 mb-6">{error}</p>
                <Button onClick={() => router.back()}>
                  Voltar
                </Button>
              </CardContent>
            </Card>
          </Container>
        </RoleGuard>
      </AuthGuard>
    )
  }

  return (
    <AuthGuard>
      <RoleGuard allowedRoles={['funcionario', 'administrador']}>
        <Container>
          <div className="mb-6">
            <Button
              variant="outline"
              onClick={() => router.back()}
              icon={<ArrowLeft className="h-4 w-4" />}
            >
              Voltar
            </Button>
          </div>

          <PageHeader
            title="Histórico de Alterações"
            subtitle={`Matrícula de ${enrollment?.nome || 'N/A'}`}
          />

          {history.length === 0 ? (
            <Card>
              <CardContent className="p-8 text-center">
                <History className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  Nenhum histórico encontrado
                </h3>
                <p className="text-gray-600">
                  Ainda não há registros de alterações para esta matrícula.
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {history.map((entry, index) => (
                <Card key={index}>
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center">
                          {getActionIcon(entry.action)}
                        </div>
                        <div>
                          <div className="flex items-center space-x-2">
                            <h3 className="text-lg font-semibold text-gray-900">
                              {getActionLabel(entry.action)}
                            </h3>
                            {getActionBadge(entry.action)}
                          </div>
                          <div className="flex items-center space-x-4 mt-1 text-sm text-gray-600">
                            <div className="flex items-center space-x-1">
                              <Clock className="h-4 w-4" />
                              <span>{formatDate(entry.changedAt)}</span>
                            </div>
                            {entry.changedByName && (
                              <div className="flex items-center space-x-1">
                                <User className="h-4 w-4" />
                                <span>{entry.changedByName}</span>
                              </div>
                            )}
                            {entry.changedByEmail && (
                              <span className="text-gray-500">({entry.changedByEmail})</span>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>

                    {entry.notes && (
                      <div className="mb-4 p-3 bg-gray-50 rounded-lg">
                        <p className="text-sm text-gray-700">{entry.notes}</p>
                      </div>
                    )}

                    {entry.changesDiff && entry.changesDiff.length > 0 && (
                      <div className="mt-4 border-t pt-4">
                        <h4 className="text-sm font-semibold text-gray-900 mb-3">
                          Campos Alterados ({entry.changesDiff.length})
                        </h4>
                        <div className="space-y-3">
                          {entry.changesDiff.map((change, changeIndex) => (
                            <div
                              key={changeIndex}
                              className="p-3 bg-gray-50 rounded-lg border border-gray-200"
                            >
                              <div className="flex items-center justify-between mb-2">
                                <span className="text-sm font-medium text-gray-900">
                                  {formatFieldName(change.field)}
                                </span>
                              </div>
                              <div className="grid grid-cols-2 gap-3 text-sm">
                                <div>
                                  <span className="text-gray-500 block mb-1">Valor Anterior:</span>
                                  <span className="text-gray-700 bg-white px-2 py-1 rounded border border-gray-200 block">
                                    {formatValue(change.oldValue)}
                                  </span>
                                </div>
                                <div>
                                  <span className="text-gray-500 block mb-1">Novo Valor:</span>
                                  <span className="text-primary-700 bg-primary-50 px-2 py-1 rounded border border-primary-200 block">
                                    {formatValue(change.newValue)}
                                  </span>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </Container>
      </RoleGuard>
    </AuthGuard>
  )
}

