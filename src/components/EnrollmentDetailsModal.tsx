'use client'

import { Enrollment } from '@/lib/enrollment-list-schemas'
import { formatarData, formatarTelefone, calcularIdade } from '@/lib/enrollment-list-schemas'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { 
  X, 
  CheckCircle, 
  XCircle, 
  Clock,
  User,
  Phone,
  MapPin,
  Calendar,
  DollarSign,
  AlertCircle,
  Edit
} from 'lucide-react'
import { useRouter } from 'next/navigation'

interface EnrollmentDetailsModalProps {
  enrollment: Enrollment
  onClose: () => void
  onEnrollmentChange: () => void
}

export function EnrollmentDetailsModal({ 
  enrollment, 
  onClose, 
  onEnrollmentChange 
}: EnrollmentDetailsModalProps) {
  const router = useRouter()

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pendente_matricula':
        return <Badge variant="warning">Pendente de Matrícula</Badge>
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
        return <Clock className="w-5 h-5 text-yellow-600" />
      case 'confirmada':
        return <CheckCircle className="w-5 h-5 text-green-600" />
      case 'cancelada':
        return <XCircle className="w-5 h-5 text-red-600" />
      default:
        return null
    }
  }

  const handleEdit = () => {
    router.push(`/matricula/${enrollment.id}/edit`)
    onClose()
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        {/* Cabeçalho */}
        <div className="flex items-center justify-between p-6 border-b">
          <div className="flex items-center gap-3">
            <User className="w-6 h-6 text-gray-600" />
            <div>
              <h2 className="text-xl font-bold">{enrollment.nomeCrianca}</h2>
              <div className="flex items-center gap-2 mt-1">
                {getStatusIcon(enrollment.status)}
                {getStatusBadge(enrollment.status)}
              </div>
            </div>
          </div>
          <Button variant="outline" size="sm" onClick={onClose}>
            <X className="w-4 h-4" />
          </Button>
        </div>

        {/* Corpo */}
        <div className="p-6 space-y-6">
          {/* Informações da Criança */}
          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <User className="w-5 h-5" />
              Informações da Criança
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-gray-600">Nome Completo</label>
                <p className="text-gray-900">{enrollment.nomeCrianca}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-600">Data de Nascimento</label>
                <p className="text-gray-900">{formatarData(enrollment.dataNascimento)}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-600">Idade</label>
                <p className="text-gray-900">{calcularIdade(enrollment.dataNascimento)} anos</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-600">Raça/Cor</label>
                <p className="text-gray-900">{enrollment.raca}</p>
              </div>
            </div>
          </Card>

          {/* Responsável */}
          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <Phone className="w-5 h-5" />
              Responsável
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-gray-600">Nome</label>
                <p className="text-gray-900">{enrollment.responsavelNome}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-600">Contato</label>
                <p className="text-gray-900">{formatarTelefone(enrollment.responsavelContato)}</p>
              </div>
            </div>
          </Card>

          {/* Endereço */}
          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <MapPin className="w-5 h-5" />
              Endereço
            </h3>
            <div>
              <label className="text-sm font-medium text-gray-600">Endereço Completo</label>
              <p className="text-gray-900">{enrollment.endereco}</p>
            </div>
          </Card>

          {/* Necessidades Especiais */}
          {enrollment.necessidadesEspeciais && (
            <Card className="p-6">
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <AlertCircle className="w-5 h-5" />
                Necessidades Especiais
              </h3>
              <div>
                <label className="text-sm font-medium text-gray-600">Descrição</label>
                <p className="text-gray-900">{enrollment.descricaoNecessidade || 'Não informado'}</p>
              </div>
            </Card>
          )}

          {/* Renda Familiar */}
          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <DollarSign className="w-5 h-5" />
              Renda Familiar
            </h3>
            <div>
              <label className="text-sm font-medium text-gray-600">Faixa de Renda</label>
              <p className="text-gray-900">{enrollment.rendaFamiliar}</p>
            </div>
          </Card>

          {/* Informações Escolares */}
          {(enrollment.serie || enrollment.anoLetivo) && (
            <Card className="p-6">
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <Calendar className="w-5 h-5" />
                Informações Escolares
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {enrollment.serie && (
                  <div>
                    <label className="text-sm font-medium text-gray-600">Série</label>
                    <p className="text-gray-900">{enrollment.serie}</p>
                  </div>
                )}
                {enrollment.anoLetivo && (
                  <div>
                    <label className="text-sm font-medium text-gray-600">Ano Letivo</label>
                    <p className="text-gray-900">{enrollment.anoLetivo}</p>
                  </div>
                )}
              </div>
            </Card>
          )}

          {/* Informações do Sistema */}
          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <Calendar className="w-5 h-5" />
              Informações do Sistema
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-gray-600">Data de Criação</label>
                <p className="text-gray-900">{formatarData(enrollment.criadoEm)}</p>
              </div>
              {enrollment.atualizadoEm && (
                <div>
                  <label className="text-sm font-medium text-gray-600">Última Atualização</label>
                  <p className="text-gray-900">{formatarData(enrollment.atualizadoEm)}</p>
                </div>
              )}
            </div>
          </Card>
        </div>

        {/* Rodapé */}
        <div className="flex items-center justify-between p-6 border-t bg-gray-50">
          <div className="flex items-center gap-2">
            <Button variant="outline" onClick={onClose}>
              Fechar
            </Button>
          </div>
          
          <div className="flex items-center gap-2">
            {enrollment.status === 'pendente_matricula' && (
              <Button
                onClick={handleEdit}
                className="flex items-center gap-2"
              >
                <Edit className="w-4 h-4" />
                Completar Matrícula
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}









