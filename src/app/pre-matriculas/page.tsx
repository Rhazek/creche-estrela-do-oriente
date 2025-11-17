'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/hooks/useAuth'
import { PreEnrollmentService } from '@/lib/pre-enrollment-service'
import { PreEnrollment, PreEnrollmentFilters, PreEnrollmentStats } from '@/lib/pre-enrollment-schemas'
import { formatarData, formatarTelefone, calcularIdade } from '@/lib/pre-enrollment-schemas'
import { RACA_OPTIONS, RENDA_FAMILIAR_OPTIONS, STATUS_OPTIONS } from '@/lib/pre-enrollment-schemas'
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
  Trash2, 
  Filter,
  X,
  Users,
  CheckCircle,
  XCircle,
  Clock
} from 'lucide-react'
import toast from 'react-hot-toast'
import { PreEnrollmentDetailsModal } from '@/components/PreEnrollmentDetailsModal'
import { ConfirmationModal } from '@/components/ConfirmationModal'

export default function PreEnrollmentsPage() {
  const router = useRouter()
  const { user } = useAuth()
  const [preEnrollments, setPreEnrollments] = useState<PreEnrollment[]>([])
  const [stats, setStats] = useState<PreEnrollmentStats>({ total: 0, emAnalise: 0, aprovadas: 0, rejeitadas: 0 })
  const [loading, setLoading] = useState(true)
  const [filters, setFilters] = useState<PreEnrollmentFilters>({})
  const [showFilters, setShowFilters] = useState(false)
  const [selectedPreEnrollment, setSelectedPreEnrollment] = useState<PreEnrollment | null>(null)
  const [showDetailsModal, setShowDetailsModal] = useState(false)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [preEnrollmentToDelete, setPreEnrollmentToDelete] = useState<string | null>(null)

  // Carregar dados
  const loadData = useCallback(async () => {
    try {
      setLoading(true)
      const [preEnrollmentsData, statsData] = await Promise.all([
        PreEnrollmentService.getPreEnrollments(filters),
        PreEnrollmentService.getStats()
      ])
      setPreEnrollments(preEnrollmentsData)
      setStats(statsData)
    } catch (error) {
      toast.error('Erro ao carregar pré-matrículas')
      console.error('Erro:', error)
    } finally {
      setLoading(false)
    }
  }, [filters])

  useEffect(() => {
    loadData()
  }, [loadData])

  // Handlers
  const handleViewDetails = (preEnrollment: PreEnrollment) => {
    setSelectedPreEnrollment(preEnrollment)
    setShowDetailsModal(true)
  }

  const handleEdit = (id: string) => {
    router.push(`/pre-matriculas/${id}/editar`)
  }

  const handleDelete = (id: string) => {
    setPreEnrollmentToDelete(id)
    setShowDeleteModal(true)
  }

  const confirmDelete = async () => {
    if (!preEnrollmentToDelete) return

    try {
      await PreEnrollmentService.deletePreEnrollment(preEnrollmentToDelete)
      toast.success('Pré-matrícula excluída com sucesso')
      loadData()
    } catch (error) {
      toast.error('Erro ao excluir pré-matrícula')
      console.error('Erro:', error)
    } finally {
      setShowDeleteModal(false)
      setPreEnrollmentToDelete(null)
    }
  }

  const handleFilterChange = (field: keyof PreEnrollmentFilters, value: string) => {
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
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'analise':
        return <Badge variant="warning">Em Análise</Badge>
      case 'aprovada':
        return <Badge variant="success">Aprovada</Badge>
      case 'rejeitada':
        return <Badge variant="danger">Rejeitada</Badge>
      default:
        return <Badge variant="secondary">{status}</Badge>
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'analise':
        return <Clock className="w-4 h-4" />
      case 'aprovada':
        return <CheckCircle className="w-4 h-4" />
      case 'rejeitada':
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
          <p className="mt-4 text-gray-600">Carregando pré-matrículas...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Cabeçalho */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Pré-Matrículas</h1>
          <p className="text-gray-600 mt-1">Gerencie as solicitações de pré-matrícula</p>
        </div>
        <Button
          onClick={() => router.push('/pre-matriculas/nova')}
          className="flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          Nova Pré-Matrícula
        </Button>
      </div>

      {/* Dashboard Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Em Análise</p>
              <p className="text-2xl font-bold text-yellow-600">{stats.emAnalise}</p>
            </div>
            <div className="p-3 bg-yellow-100 rounded-full">
              <Clock className="w-6 h-6 text-yellow-600" />
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Aprovadas</p>
              <p className="text-2xl font-bold text-green-600">{stats.aprovadas}</p>
            </div>
            <div className="p-3 bg-green-100 rounded-full">
              <CheckCircle className="w-6 h-6 text-green-600" />
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Rejeitadas</p>
              <p className="text-2xl font-bold text-red-600">{stats.rejeitadas}</p>
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
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Nome
              </label>
              <Input
                placeholder="Buscar por nome..."
                value={filters.nome || ''}
                onChange={(e) => handleFilterChange('nome', e.target.value)}
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
                Renda Familiar
              </label>
              <Select
                value={filters.rendaFamiliar || ''}
                onChange={(e) => handleFilterChange('rendaFamiliar', e.target.value)}
              >
                <option value="">Todas</option>
                {RENDA_FAMILIAR_OPTIONS.map(option => (
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
          </div>
        )}

        {Object.keys(filters).length > 0 && (
          <div className="mt-4 flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={clearFilters}>
              <X className="w-4 h-4 mr-2" />
              Limpar Filtros
            </Button>
            <span className="text-sm text-gray-500">
              {preEnrollments.length} resultado(s) encontrado(s)
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
                <th className="text-left py-3 px-4 font-semibold">Renda Familiar</th>
                <th className="text-left py-3 px-4 font-semibold">Status</th>
                <th className="text-left py-3 px-4 font-semibold">Data de Envio</th>
                <th className="text-left py-3 px-4 font-semibold">Ações</th>
              </tr>
            </thead>
            <tbody>
              {preEnrollments.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center py-8 text-gray-500">
                    Nenhuma pré-matrícula encontrada
                  </td>
                </tr>
              ) : (
                preEnrollments.map((preEnrollment) => (
                  <tr key={preEnrollment.id} className="border-b hover:bg-gray-50">
                    <td className="py-3 px-4">
                      <div>
                        <p className="font-medium">{preEnrollment.nomeCrianca}</p>
                        <p className="text-sm text-gray-500">{preEnrollment.responsavelNome}</p>
                      </div>
                    </td>
                    <td className="py-3 px-4">{preEnrollment.raca}</td>
                    <td className="py-3 px-4">
                      {calcularIdade(preEnrollment.dataNascimento)} anos
                    </td>
                    <td className="py-3 px-4">{preEnrollment.rendaFamiliar}</td>
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2">
                        {getStatusIcon(preEnrollment.status)}
                        {getStatusBadge(preEnrollment.status)}
                      </div>
                    </td>
                    <td className="py-3 px-4">{formatarData(preEnrollment.criadoEm)}</td>
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleViewDetails(preEnrollment)}
                        >
                          <Eye className="w-4 h-4" />
                        </Button>
                        {preEnrollment.status === 'analise' && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleEdit(preEnrollment.id)}
                          >
                            <Edit className="w-4 h-4" />
                          </Button>
                        )}
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDelete(preEnrollment.id)}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
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
      {showDetailsModal && selectedPreEnrollment && (
        <PreEnrollmentDetailsModal
          preEnrollment={selectedPreEnrollment}
          onClose={() => {
            setShowDetailsModal(false)
            setSelectedPreEnrollment(null)
          }}
          onApprovalChange={loadData}
        />
      )}

      {showDeleteModal && (
        <ConfirmationModal
          title="Excluir Pré-Matrícula"
          message="Tem certeza que deseja excluir esta pré-matrícula? Esta ação não pode ser desfeita."
          onConfirm={confirmDelete}
          onCancel={() => {
            setShowDeleteModal(false)
            setPreEnrollmentToDelete(null)
          }}
        />
      )}
    </div>
  )
}









