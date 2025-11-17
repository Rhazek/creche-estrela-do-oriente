'use client'

import { useState } from 'react'
import { PreEnrollment } from '@/lib/pre-enrollment-schemas'
import { PreEnrollmentService } from '@/lib/pre-enrollment-service'
import { formatarData, formatarTelefone, calcularIdade } from '@/lib/pre-enrollment-schemas'
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
  AlertCircle
} from 'lucide-react'
import toast from 'react-hot-toast'
import { ConfirmationModal } from '@/components/ConfirmationModal'
import { useAuth } from '@/hooks/useAuth'

interface PreEnrollmentDetailsModalProps {
  preEnrollment: PreEnrollment
  onClose: () => void
  onApprovalChange: () => void
}

export function PreEnrollmentDetailsModal({ 
  preEnrollment, 
  onClose, 
  onApprovalChange 
}: PreEnrollmentDetailsModalProps) {
  const { user } = useAuth()
  const [showApproveModal, setShowApproveModal] = useState(false)
  const [showRejectModal, setShowRejectModal] = useState(false)
  const [rejectReason, setRejectReason] = useState('')
  const [loading, setLoading] = useState(false)

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
        return <Clock className="w-5 h-5 text-yellow-600" />
      case 'aprovada':
        return <CheckCircle className="w-5 h-5 text-green-600" />
      case 'rejeitada':
        return <XCircle className="w-5 h-5 text-red-600" />
      default:
        return null
    }
  }

  const handleApprove = async () => {
    if (!user?.uid) {
      toast.error('Usuário não autenticado')
      return
    }

    try {
      setLoading(true)
      await PreEnrollmentService.approvePreEnrollment(preEnrollment.id, user.uid)
      toast.success('Pré-matrícula aprovada com sucesso!')
      onApprovalChange()
      onClose()
    } catch (error) {
      toast.error('Erro ao aprovar pré-matrícula')
      console.error('Erro:', error)
    } finally {
      setLoading(false)
      setShowApproveModal(false)
    }
  }

  const handleReject = async () => {
    if (!user?.uid) {
      toast.error('Usuário não autenticado')
      return
    }

    try {
      setLoading(true)
      await PreEnrollmentService.rejectPreEnrollment(
        preEnrollment.id, 
        rejectReason, 
        user.uid
      )
      toast.success('Pré-matrícula rejeitada')
      onApprovalChange()
      onClose()
    } catch (error) {
      toast.error('Erro ao rejeitar pré-matrícula')
      console.error('Erro:', error)
    } finally {
      setLoading(false)
      setShowRejectModal(false)
      setRejectReason('')
    }
  }

  return (
    <>
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
        <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
          {/* Cabeçalho */}
          <div className="flex items-center justify-between p-6 border-b">
            <div className="flex items-center gap-3">
              <User className="w-6 h-6 text-gray-600" />
              <div>
                <h2 className="text-xl font-bold">{preEnrollment.nomeCrianca}</h2>
                <div className="flex items-center gap-2 mt-1">
                  {getStatusIcon(preEnrollment.status)}
                  {getStatusBadge(preEnrollment.status)}
                </div>
              </div>
            </div>
            <Button variant="outline" size="sm" onClick={onClose}>
              <X className="w-4 h-4" />
            </Button>
          </div>

          {/* Conteúdo */}
          <div className="p-6 space-y-6">
            {/* Informações Básicas */}
            <Card className="p-6">
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <User className="w-5 h-5" />
                Informações Básicas
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-600">Nome da Criança</label>
                  <p className="text-gray-900">{preEnrollment.nomeCrianca}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-600">Raça/Cor</label>
                  <p className="text-gray-900">{preEnrollment.raca}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-600">Data de Nascimento</label>
                  <p className="text-gray-900">{formatarData(preEnrollment.dataNascimento)}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-600">Idade</label>
                  <p className="text-gray-900">{calcularIdade(preEnrollment.dataNascimento)} anos</p>
                </div>
              </div>
            </Card>

            {/* Responsável */}
            <Card className="p-6">
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <User className="w-5 h-5" />
                Responsável
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-600">Nome</label>
                  <p className="text-gray-900">{preEnrollment.responsavelNome}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-600">Contato</label>
                  <p className="text-gray-900">{formatarTelefone(preEnrollment.responsavelContato)}</p>
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
                <p className="text-gray-900">{preEnrollment.endereco}</p>
              </div>
            </Card>

            {/* Necessidades Especiais */}
            {preEnrollment.necessidadesEspeciais && (
              <Card className="p-6">
                <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                  <AlertCircle className="w-5 h-5" />
                  Necessidades Especiais
                </h3>
                <div>
                  <label className="text-sm font-medium text-gray-600">Descrição</label>
                  <p className="text-gray-900">{preEnrollment.descricaoNecessidade || 'Não informado'}</p>
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
                <p className="text-gray-900">{preEnrollment.rendaFamiliar}</p>
              </div>
            </Card>

            {/* Informações do Sistema */}
            <Card className="p-6">
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <Calendar className="w-5 h-5" />
                Informações do Sistema
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-600">Data de Envio</label>
                  <p className="text-gray-900">{formatarData(preEnrollment.criadoEm)}</p>
                </div>
                {preEnrollment.dataDecisao && (
                  <div>
                    <label className="text-sm font-medium text-gray-600">Data da Decisão</label>
                    <p className="text-gray-900">{formatarData(preEnrollment.dataDecisao)}</p>
                  </div>
                )}
                {preEnrollment.motivoRejeicao && (
                  <div className="md:col-span-2">
                    <label className="text-sm font-medium text-gray-600">Motivo da Rejeição</label>
                    <p className="text-gray-900">{preEnrollment.motivoRejeicao}</p>
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
            
            {preEnrollment.status === 'analise' && (
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  onClick={() => setShowRejectModal(true)}
                  className="text-red-600 border-red-600 hover:bg-red-50"
                >
                  <XCircle className="w-4 h-4 mr-2" />
                  Rejeitar
                </Button>
                <Button
                  onClick={() => setShowApproveModal(true)}
                  className="bg-green-600 hover:bg-green-700"
                >
                  <CheckCircle className="w-4 h-4 mr-2" />
                  Aprovar
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Modal de Confirmação de Aprovação */}
      {showApproveModal && (
        <ConfirmationModal
          title="Aprovar Pré-Matrícula"
          message="Tem certeza que deseja aprovar esta pré-matrícula? Esta ação não pode ser desfeita."
          onConfirm={handleApprove}
          onCancel={() => setShowApproveModal(false)}
          loading={loading}
          confirmText="Aprovar"
          confirmVariant="success"
        />
      )}

      {/* Modal de Confirmação de Rejeição */}
      {showRejectModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-[100]">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <h3 className="text-lg font-semibold mb-4">Rejeitar Pré-Matrícula</h3>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Motivo da Rejeição (opcional)
              </label>
              <textarea
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
                rows={3}
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
                placeholder="Digite o motivo da rejeição..."
              />
            </div>
            <div className="flex items-center justify-end gap-2">
              <Button
                variant="outline"
                onClick={() => setShowRejectModal(false)}
                disabled={loading}
              >
                Cancelar
              </Button>
              <Button
                variant="danger"
                onClick={handleReject}
                loading={loading}
              >
                Rejeitar
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
