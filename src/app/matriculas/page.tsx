'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/hooks/useAuth'
import { EnrollmentListService } from '@/lib/enrollment-list-service'
import { 
  Enrollment, 
  EnrollmentFilters, 
  EnrollmentStats,
  RACA_OPTIONS,
  RENDA_PER_CAPITA_OPTIONS,
  STATUS_OPTIONS,
  ANO_LETIVO_OPTIONS,
  SERIE_OPTIONS
} from '@/lib/enrollment-list-schemas'
import { formatarData, formatarTelefone, calcularIdade } from '@/lib/enrollment-list-schemas'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Select } from '@/components/ui/Select'
import { Badge } from '@/components/ui/Badge'
import { 
  Plus, 
  Search, 
  Eye, 
  Edit, 
  XCircle,
  Filter,
  X,
  UserCheck,
  UserX,
  Clock,
  CheckCircle
} from 'lucide-react'
import toast from 'react-hot-toast'
import { EnrollmentDetailsModal } from '@/components/EnrollmentDetailsModal'
import { ConfirmationModal } from '@/components/ConfirmationModal'

export default function EnrollmentsPage() {
  const router = useRouter()
  const { user } = useAuth()
  const [enrollments, setEnrollments] = useState<Enrollment[]>([])
  const [stats, setStats] = useState<EnrollmentStats>({ 
    pendentes: 0, 
    confirmadas: 0, 
    canceladas: 0, 
    total: 0 
  })
  const [loading, setLoading] = useState(true)
  const [filters, setFilters] = useState<EnrollmentFilters>({})
  const [searchTerm, setSearchTerm] = useState('')
  const [showFilters, setShowFilters] = useState(false)
  const [selectedEnrollment, setSelectedEnrollment] = useState<Enrollment | null>(null)
  const [showDetailsModal, setShowDetailsModal] = useState(false)
  const [showCancelModal, setShowCancelModal] = useState(false)
  const [enrollmentToCancel, setEnrollmentToCancel] = useState<string | null>(null)

  // Debounce para busca por nome
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      setFilters(prev => ({
        ...prev,
        nome: searchTerm || undefined
      }))
    }, 500) // Aguarda 500ms após parar de digitar

    return () => clearTimeout(timeoutId)
  }, [searchTerm])

  // Carregar dados
  const loadData = useCallback(async () => {
    try {
      setLoading(true)
      const [enrollmentsData, statsData] = await Promise.all([
        EnrollmentListService.getEnrollments(filters),
        EnrollmentListService.getStats()
      ])
      setEnrollments(enrollmentsData)
      setStats(statsData)
    } catch (error) {
      toast.error('Erro ao carregar matrículas')
      console.error('Erro:', error)
    } finally {
      setLoading(false)
    }
  }, [filters])

  useEffect(() => {
    loadData()
  }, [loadData])


  // Handlers
  const handleViewDetails = (enrollment: Enrollment) => {
    setSelectedEnrollment(enrollment)
    setShowDetailsModal(true)
  }

  const handleEditEnrollment = (id: string) => {
    router.push(`/matricula/${id}/edit`)
  }

  const handleCompleteEnrollment = (id: string) => {
    router.push(`/matricula/${id}/edit`)
  }

  const handleCancelEnrollment = (id: string) => {
    setEnrollmentToCancel(id)
    setShowCancelModal(true)
  }

  const confirmCancel = async () => {
    if (!enrollmentToCancel || !user?.uid) return

    try {
      await EnrollmentListService.cancelEnrollment(enrollmentToCancel, user.uid)
      toast.success('Matrícula cancelada com sucesso')
      loadData()
    } catch (error) {
      toast.error('Erro ao cancelar matrícula')
      console.error('Erro:', error)
    } finally {
      setShowCancelModal(false)
      setEnrollmentToCancel(null)
    }
  }

  const handleFilterChange = (field: keyof EnrollmentFilters, value: string) => {
    setFilters(prev => {
      const newFilters = { ...prev }
      if (value && value.trim() !== '') {
        newFilters[field] = value
      } else {
        // Remove o filtro se o valor estiver vazio
        delete newFilters[field]
      }
      return newFilters
    })
  }

  const clearFilters = () => {
    setFilters({})
    setSearchTerm('')
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pendente_matricula':
        return <Badge variant="warning">Pendente</Badge>
      case 'confirmada':
        return <Badge variant="success">Confirmada</Badge>
      case 'cancelada':
        return <Badge variant="danger">Cancelada</Badge>
      default:
        return <Badge variant="secondary">{status}</Badge>
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pendente_matricula':
        return <Clock className="w-4 h-4" />
      case 'confirmada':
        return <CheckCircle className="w-4 h-4" />
      case 'cancelada':
        return <XCircle className="w-4 h-4" />
      default:
        return null
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Carregando matrículas...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Cabeçalho */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Matrículas</h1>
          <p className="text-gray-600 mt-1">Gerencie as matrículas do sistema</p>
        </div>
        <Button
          onClick={() => router.push('/matricula/new')}
          className="flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          Nova Matrícula
        </Button>
      </div>

      {/* Dashboard Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Pendentes de Matrícula</p>
              <p className="text-2xl font-bold text-yellow-600">{stats.pendentes}</p>
            </div>
            <div className="p-3 bg-yellow-100 rounded-full">
              <Clock className="w-6 h-6 text-yellow-600" />
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Matrículas Confirmadas</p>
              <p className="text-2xl font-bold text-green-600">{stats.confirmadas}</p>
            </div>
            <div className="p-3 bg-green-100 rounded-full">
              <CheckCircle className="w-6 h-6 text-green-600" />
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Matrículas Canceladas</p>
              <p className="text-2xl font-bold text-red-600">{stats.canceladas}</p>
            </div>
            <div className="p-3 bg-red-100 rounded-full">
              <XCircle className="w-6 h-6 text-red-600" />
            </div>
          </div>
        </Card>
      </div>

      {/* Filtros */}
      <Card className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold">Filtros</h3>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowFilters(!showFilters)}
          >
            <Filter className="w-4 h-4 mr-2" />
            {showFilters ? 'Ocultar' : 'Mostrar'} Filtros
          </Button>
        </div>
        
        {showFilters && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Nome
              </label>
              <Input
                placeholder="Buscar por nome..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Raça/Cor
              </label>
              <Select
                value={filters.raca || ''}
                onChange={(e) => handleFilterChange('raca', e.target.value)}
              >
                <option value="">Todas</option>
                {RACA_OPTIONS.map(option => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </Select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Renda Per Capita
              </label>
              <Select
                value={filters.rendaPerCapita || ''}
                onChange={(e) => handleFilterChange('rendaPerCapita', e.target.value)}
              >
                <option value="">Todas</option>
                {RENDA_PER_CAPITA_OPTIONS.map(option => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </Select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Status
              </label>
              <Select
                value={filters.status || ''}
                onChange={(e) => handleFilterChange('status', e.target.value)}
              >
                <option value="">Todos</option>
                {STATUS_OPTIONS.map(option => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </Select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Ano Letivo
              </label>
              <Select
                value={filters.anoLetivo || ''}
                onChange={(e) => handleFilterChange('anoLetivo', e.target.value)}
              >
                <option value="">Todos</option>
                {ANO_LETIVO_OPTIONS.map(option => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </Select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Série
              </label>
              <Select
                value={filters.serie || ''}
                onChange={(e) => handleFilterChange('serie', e.target.value)}
              >
                <option value="">Todas</option>
                {SERIE_OPTIONS.map(option => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </Select>
            </div>
          </div>
        )}

        {Object.keys(filters).length > 0 && (
          <div className="mt-4 flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={clearFilters}>
              <X className="w-4 h-4 mr-2" />
              Limpar Filtros
            </Button>
            <span className="text-sm text-gray-500">
              {enrollments.length} resultado(s) encontrado(s)
            </span>
          </div>
        )}
      </Card>

      {/* Tabela */}
      <Card className="p-6">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b">
                <th className="text-left py-3 px-4 font-semibold">Nome da Criança</th>
                <th className="text-left py-3 px-4 font-semibold">Raça</th>
                <th className="text-left py-3 px-4 font-semibold">Idade</th>
                <th className="text-left py-3 px-4 font-semibold">Série</th>
                <th className="text-left py-3 px-4 font-semibold">Renda Per Capita</th>
                <th className="text-left py-3 px-4 font-semibold">Status</th>
                <th className="text-left py-3 px-4 font-semibold">Última Atualização</th>
                <th className="text-left py-3 px-4 font-semibold">Ações</th>
              </tr>
            </thead>
            <tbody>
              {enrollments.length === 0 ? (
                <tr>
                  <td colSpan={8} className="text-center py-8 text-gray-500">
                    Nenhuma matrícula encontrada
                  </td>
                </tr>
              ) : (
                enrollments.map((enrollment) => (
                  <tr key={enrollment.id} className="border-b hover:bg-gray-50">
                    <td className="py-3 px-4">
                      <div>
                        <p className="font-medium">{enrollment.nomeCrianca}</p>
                        <p className="text-sm text-gray-500">{enrollment.responsavelNome}</p>
                      </div>
                    </td>
                    <td className="py-3 px-4">{enrollment.raca}</td>
                    <td className="py-3 px-4">
                      {calcularIdade(enrollment.dataNascimento)} anos
                    </td>
                    <td className="py-3 px-4">{enrollment.serie || '-'}</td>
                    <td className="py-3 px-4">
                      {enrollment.rendaPerCapita ? `R$ ${enrollment.rendaPerCapita.toFixed(2)}` : '-'}
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2">
                        {getStatusIcon(enrollment.status)}
                        {getStatusBadge(enrollment.status)}
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      {enrollment.atualizadoEm ? formatarData(enrollment.atualizadoEm) : formatarData(enrollment.criadoEm)}
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleViewDetails(enrollment)}
                        >
                          <Eye className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleEditEnrollment(enrollment.id)}
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                        {enrollment.status === 'pendente_matricula' && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleCompleteEnrollment(enrollment.id)}
                            className="text-primary-600 border-primary-600 hover:bg-primary-50"
                          >
                            <UserCheck className="w-4 h-4" />
                          </Button>
                        )}
                        {enrollment.status !== 'cancelada' && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleCancelEnrollment(enrollment.id)}
                            className="text-red-600 border-red-600 hover:bg-red-50"
                          >
                            <XCircle className="w-4 h-4" />
                          </Button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Modais */}
      {showDetailsModal && selectedEnrollment && (
        <EnrollmentDetailsModal
          enrollment={selectedEnrollment}
          onClose={() => {
            setShowDetailsModal(false)
            setSelectedEnrollment(null)
          }}
          onEnrollmentChange={loadData}
        />
      )}

      {showCancelModal && (
        <ConfirmationModal
          title="Cancelar Matrícula"
          message="Tem certeza que deseja cancelar esta matrícula? Esta ação não pode ser desfeita."
          onConfirm={confirmCancel}
          onCancel={() => {
            setShowCancelModal(false)
            setEnrollmentToCancel(null)
          }}
        />
      )}
    </div>
  )
}




