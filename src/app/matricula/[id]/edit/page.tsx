'use client'

import React, { useState, useEffect, useCallback } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { useAuth } from '@/hooks/useAuth'
import AuthGuard from '@/components/AuthGuard'
import RoleGuard from '@/components/RoleGuard'
import { EnrollmentWizard } from '@/components/EnrollmentForm/EnrollmentWizard'
import { EnrollmentService, FirestoreEnrollment } from '@/lib/enrollment-service'
import { formatDateForInput } from '@/lib/enrollment-utils'
import { EnrollmentFormData } from '@/lib/enrollment-schemas'
import { PageHeader, Container } from '@/components/layout/LayoutWrapper'
import { Card, CardContent } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { ArrowLeft, FileText, History, AlertCircle } from 'lucide-react'
import toast from 'react-hot-toast'
import { SuccessFeedback } from '@/components/SuccessFeedback'

export default function EditEnrollmentPage() {
  const router = useRouter()
  const params = useParams()
  const { user, userProfile } = useAuth()
  const enrollmentId = params.id as string
  
  const [enrollment, setEnrollment] = useState<FirestoreEnrollment | null>(null)
  const [formData, setFormData] = useState<Partial<EnrollmentFormData> | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  const loadEnrollment = useCallback(async () => {
    try {
      setIsLoading(true)
      setError(null)
      
      const enrollmentData = await EnrollmentService.getEnrollment(enrollmentId)
      
      if (!enrollmentData) {
        setError('Matrícula não encontrada')
        return
      }

      setEnrollment(enrollmentData)
      
      // Converter dados do Firestore para formato do formulário
      const convertedData = convertFirestoreToFormData(enrollmentData)
      setFormData(convertedData)
      
    } catch (error) {
      console.error('Erro ao carregar matrícula:', error)
      setError('Erro ao carregar matrícula')
    } finally {
      setIsLoading(false)
    }
  }, [enrollmentId])

  useEffect(() => {
    loadEnrollment()
  }, [loadEnrollment])

  const convertFirestoreToFormData = (data: FirestoreEnrollment): Partial<EnrollmentFormData> => {
    return {
      step1: {
        nome: data.nome,
        identidade: data.identidade,
        // manter como Date para obedecer ao schema do formulário; ChildInfoStep formata para input
        dataNascimento: typeof data.dataNascimento === 'string'
          ? new Date(data.dataNascimento)
          : data.dataNascimento instanceof Date
            ? data.dataNascimento
            : data.dataNascimento && typeof data.dataNascimento.toDate === 'function'
              ? data.dataNascimento.toDate()
              : new Date(),
        sexo: data.sexo as any,
        corRaca: data.corRaca as any,
        gemeos: data.gemeos,
        temIrmaosNaCreche: data.temIrmaosNaCreche || false,
        irmaosNaCreche: data.irmaosNaCreche ? (Array.isArray(data.irmaosNaCreche) ? data.irmaosNaCreche : []) : [],
        numeroSUS: data.numeroSUS,
        unidadeSaude: data.unidadeSaude,
        problemasSaude: data.problemasSaude,
        restricaoAlimentar: data.restricaoAlimentar,
        tipoRestricao: data.tipoRestricao,
        alergia: data.alergia,
        tipoAlergia: data.tipoAlergia,
        mobilidadeReduzida: data.mobilidadeReduzida as any,
        possuiDeficienciasMultiplas: data.possuiDeficienciasMultiplas,
        tipoDeficiencia: data.tipoDeficiencia,
        publicoEducacaoEspecial: data.publicoEducacaoEspecial,
        tipoEducacaoEspecial: data.tipoEducacaoEspecial,
        classificacao: data.classificacao,
        recebeAuxilioGoverno: data.recebeAuxilioGoverno,
        tipoAuxilio: data.tipoAuxilio as any,
        numeroNIS: data.numeroNIS
      },
      step2: {
        guardians: (data.guardians || []).map(g => ({
          tipoResponsavel: g.tipoResponsavel || '',
          nome: g.nome || '',
          cpf: g.cpf || '',
          rg: g.rg || '',
          dataNascimento: g.dataNascimento?.toDate?.() || new Date(),
          profissao: g.profissao || '',
          localTrabalho: g.localTrabalho || '',
          renda: g.renda || 0,
          escolaridade: g.escolaridade || '',
          telefone: g.telefone || '',
          celular: g.celular || '',
          email: g.email || '',
          outroContato: g.outroContato || ''
        }))
      },
      step3: {
        logradouro: data.logradouro,
        numero: data.numero,
        pontoReferencia: data.pontoReferencia,
        bairro: data.bairro,
        municipio: data.municipio,
        uf: data.uf,
        cep: data.cep,
        telefoneResidencial: data.telefoneResidencial,
        telefoneContato: data.telefoneContato,
        certidaoNascimento: data.certidaoNascimento,
        municipioNascimento: data.municipioNascimento,
        municipioRegistro: data.municipioRegistro,
        cartorioRegistro: data.cartorioRegistro,
        cpfCrianca: data.cpfCrianca,
        rgCrianca: data.rgCrianca,
        dataEmissaoRg: data.dataEmissaoRg?.toDate(),
        orgaoEmissor: data.orgaoEmissor
      },
      step4: {
        tipoOcupacao: data.tipoOcupacao as any,
        valorAluguel: data.valorAluguel,
        numeroComodos: data.numeroComodos,
        tipoPiso: data.tipoPiso,
        tipoMoradia: data.tipoMoradia,
        tipoCobertura: data.tipoCobertura,
        saneamentoFossa: data.saneamentoFossa,
        saneamentoCifon: data.saneamentoCifon,
        energiaEletrica: data.energiaEletrica,
        aguaEncanada: data.aguaEncanada,
        tv: data.tv,
        tvQuantidade: data.tvQuantidade || 0,
        dvd: data.dvd,
        dvdQuantidade: data.dvdQuantidade || 0,
        radio: data.radio,
        radioQuantidade: data.radioQuantidade || 0,
        computador: data.computador,
        computadorQuantidade: data.computadorQuantidade || 0,
        notebook: data.notebook,
        notebookQuantidade: data.notebookQuantidade || 0,
        telefoneFixo: data.telefoneFixo,
        telefoneFixoQuantidade: data.telefoneFixoQuantidade || 0,
        telefoneCelular: data.telefoneCelular,
        telefoneCelularQuantidade: data.telefoneCelularQuantidade || 0,
        tablet: data.tablet,
        tabletQuantidade: data.tabletQuantidade || 0,
        internet: data.internet,
        tvAssinatura: data.tvAssinatura,
        fogao: data.fogao,
        fogaoQuantidade: data.fogaoQuantidade || 0,
        geladeira: data.geladeira,
        geladeiraQuantidade: data.geladeiraQuantidade || 0,
        freezer: data.freezer,
        freezerQuantidade: data.freezerQuantidade || 0,
        microondas: data.microondas,
        microondasQuantidade: data.microondasQuantidade || 0,
        maquinaLavar: data.maquinaLavar,
        maquinaLavarQuantidade: data.maquinaLavarQuantidade || 0,
        arCondicionado: data.arCondicionado,
        arCondicionadoQuantidade: data.arCondicionadoQuantidade || 0,
        bicicleta: data.bicicleta,
        bicicletaQuantidade: data.bicicletaQuantidade || 0,
        moto: data.moto,
        motoQuantidade: data.motoQuantidade || 0,
        automovel: data.automovel,
        automovelQuantidade: data.automovelQuantidade || 0
      },
      step5: {
        members: (data.familyMembers || []).map(m => ({
          nomeMembro: m.nomeMembro || m.nome || '',
          idade: m.idade || 0,
          parentesco: m.parentesco || '',
          situacaoEscolar: m.situacaoEscolar || m.escolaridade || '',
          situacaoEmprego: m.situacaoEmprego || '',
          rendimentoDescricao: m.rendimentoDescricao || m.profissao || '',
          valorBruto: m.valorBruto || m.renda || 0
        }))
      },
      step6: {
        serie: data.serie,
        anoLetivo: data.anoLetivo,
        authorizedPersons: (data.authorizedPersons || []).map(p => ({
          nome: p.nome || '',
          parentesco: p.parentesco || '',
          telefone: p.telefone || '',
          documento: p.documento || ''
        }))
      },
      step7: {
        dataMatricula: data.dataMatricula 
          ? (data.dataMatricula instanceof Date 
              ? data.dataMatricula 
              : typeof data.dataMatricula === 'string' 
                ? new Date(data.dataMatricula)
                : data.dataMatricula && typeof data.dataMatricula.toDate === 'function'
                  ? data.dataMatricula.toDate()
                  : new Date())
          : new Date(),
        aceiteDeclaracao: data.aceiteDeclaracao,
        assinaturaResponsavel: data.assinaturaResponsavel
      }
    }
  }

  const handleComplete = async (data: EnrollmentFormData) => {
    if (!user) {
      toast.error('Usuário não autenticado')
      return
    }

    setIsSubmitting(true)
    try {
      await EnrollmentService.updateEnrollment(
        enrollmentId, 
        data, 
        user.uid,
        user.email || undefined,
        userProfile?.nomeCompleto || undefined
      )
      setSuccess(true)
    } catch (error) {
      console.error('Erro ao atualizar matrícula:', error)
      toast.error('Erro ao atualizar matrícula. Tente novamente.')
      setIsSubmitting(false)
    }
  }

  const handleSaveDraft = async (data: Partial<EnrollmentFormData>) => {
    if (!user) {
      toast.error('Usuário não autenticado')
      return
    }

    try {
      const draftId = `draft_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
      await EnrollmentService.saveDraft(user.uid, draftId, data)
      toast.success('Rascunho salvo com sucesso!')
    } catch (error) {
      console.error('Erro ao salvar rascunho:', error)
      toast.error('Erro ao salvar rascunho')
    }
  }

  if (isLoading) {
    return (
      <AuthGuard>
        <RoleGuard allowedRoles={['funcionario', 'administrador']}>
          <Container>
            <div className="flex justify-center items-center h-64">
              <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
                <p className="mt-4 text-gray-600">Carregando matrícula...</p>
              </div>
            </div>
          </Container>
        </RoleGuard>
      </AuthGuard>
    )
  }

  // Se sucesso, mostrar tela de feedback
  if (success) {
    return (
      <AuthGuard>
        <RoleGuard allowedRoles={['funcionario', 'administrador']}>
          <Container>
            <SuccessFeedback
              title="Matrícula registrada com sucesso!"
              message="A matrícula foi atualizada e registrada no sistema com sucesso."
              buttonText="Voltar para Matrículas"
              onButtonClick={() => router.push('/matriculas')}
            />
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
                  Erro ao carregar matrícula
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
          <PageHeader
            title="Editar Matrícula"
            subtitle={`Editando matrícula de ${enrollment?.nome}`}
          />

          {/* Status da matrícula */}
          {enrollment && (
            <Card className="mb-6">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <FileText className="h-5 w-5 text-blue-600" />
                    <div>
                      <p className="font-medium text-gray-900">
                        Status: <span className="capitalize">{enrollment.status}</span>
                      </p>
                      <p className="text-sm text-gray-600">
                        Criada em {enrollment.criadoEm 
                          ? (enrollment.criadoEm instanceof Date 
                              ? enrollment.criadoEm.toLocaleDateString('pt-BR')
                              : typeof enrollment.criadoEm === 'string'
                                ? new Date(enrollment.criadoEm).toLocaleDateString('pt-BR')
                                : enrollment.criadoEm.toDate 
                                  ? enrollment.criadoEm.toDate().toLocaleDateString('pt-BR')
                                  : new Date().toLocaleDateString('pt-BR'))
                          : new Date().toLocaleDateString('pt-BR')}
                      </p>
                    </div>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => router.push(`/matricula/${enrollmentId}/history`)}
                    icon={<History className="h-4 w-4" />}
                  >
                    Ver Histórico
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Wizard de edição */}
          {formData && (
            <Card>
              <CardContent className="p-0">
                <EnrollmentWizard
                  initialData={formData}
                  onComplete={handleComplete}
                  onSaveDraft={handleSaveDraft}
                  isEditing={true}
                  enrollmentId={enrollmentId}
                />
              </CardContent>
            </Card>
          )}

          {/* Botão de voltar */}
          <div className="mt-6">
            <Button
              variant="outline"
              onClick={() => router.back()}
              icon={<ArrowLeft className="h-4 w-4" />}
            >
              Voltar
            </Button>
          </div>
        </Container>
      </RoleGuard>
    </AuthGuard>
  )
}
