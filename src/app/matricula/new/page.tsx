'use client'

import React, { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Suspense } from 'react'
import { useAuth } from '@/hooks/useAuth'
import AuthGuard from '@/components/AuthGuard'
import RoleGuard from '@/components/RoleGuard'
import { EnrollmentWizard } from '@/components/EnrollmentForm/EnrollmentWizard'
import { EnrollmentService } from '@/lib/enrollment-service'
import { EnrollmentListService } from '@/lib/enrollment-list-service'
import { formatDateForInput } from '@/lib/enrollment-utils'
import { EnrollmentFormData } from '@/lib/enrollment-schemas'
import { PageHeader, Container } from '@/components/layout/LayoutWrapper'
import { Card, CardContent } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { ArrowLeft, FileText, Save } from 'lucide-react'
import toast from 'react-hot-toast'
import { SuccessFeedback } from '@/components/SuccessFeedback'

function NewEnrollmentContent() {
  const router = useRouter()
  const { user, userProfile } = useAuth()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [success, setSuccess] = useState(false)
  const searchParams = useSearchParams()
  const prefillFrom = searchParams?.get('prefillFrom')
  const isRematricula = !!searchParams?.get('rematricula')
  const [initialData, setInitialData] = useState<Partial<EnrollmentFormData> | undefined>(undefined)

  const handleComplete = async (data: EnrollmentFormData) => {
    if (!user) {
      toast.error('Usuário não autenticado')
      return
    }

    setIsSubmitting(true)
    try {
      const enrollmentData = {
        ...data,
        status: 'confirmada'
      }
      
      const enrollmentId = await EnrollmentService.createEnrollment(
        enrollmentData, 
        user.uid,
        user.email || undefined,
        userProfile?.nomeCompleto || undefined
      )
      
      setSuccess(true)
    } catch (error) {
      console.error('Erro ao criar matrícula:', error)
      toast.error('Erro ao criar matrícula. Tente novamente.')
      setIsSubmitting(false)
    }
  }

  useEffect(() => {
    const loadPrefill = async () => {
      // Prefill detected
      if (!prefillFrom) return
      try {
        let enrollment = await EnrollmentService.getEnrollment(prefillFrom)
        if (!enrollment) {
          // Trying fallback service
          const alt = await EnrollmentListService.getEnrollment(prefillFrom)
          if (!alt) {
            // No enrollment found
            return
          }
          // adaptar o formato retornado por EnrollmentListService para o usado adiante
          enrollment = {
            ...alt,
            // garantir que alguns campos existam com nomes esperados
            nome: (alt as any).nome || (alt as any).nomeCrianca || '',
            corRaca: (alt as any).corRaca || (alt as any).raca || '',
            // dataNascimento já é string no Enrollment retornado
            dataNascimento: (alt as any).dataNascimento
          } as any
        }

        const converted: Partial<EnrollmentFormData> = {
          step1: {
            // suportar ambos os formatos: `nome` ou `nomeCrianca`
            nome: (enrollment as any).nome || (enrollment as any).nomeCrianca || '',
            identidade: (enrollment as any).identidade || '',
            // Manter como Date para schema, Input component faz a conversão para display
            dataNascimento: (() => {
              const raw = (enrollment as any).dataNascimento
              if (!raw) {
                return new Date()
              } else if (typeof raw === 'string') {
                return new Date(raw)
              } else if (raw && typeof (raw as any).toDate === 'function') {
                return (raw as any).toDate()
              } else if (raw instanceof Date) {
                return raw
              } else {
                return new Date(raw as any)
              }
            })(),
            sexo: (enrollment as any).sexo || undefined,
            corRaca: (enrollment as any).corRaca || (enrollment as any).raca || undefined,
            gemeos: (enrollment as any).gemeos || false,
            temIrmaosNaCreche: (enrollment as any).temIrmaosNaCreche || false,
            irmaosNaCreche: (enrollment as any).irmaosNaCreche || [],
            nomeIrmaoNaCreche: (enrollment as any).nomeIrmaoNaCreche || '',
            numeroSUS: (enrollment as any).numeroSUS || '',
            unidadeSaude: (enrollment as any).unidadeSaude || '',
            problemasSaude: (enrollment as any).problemasSaude || '',
            restricaoAlimentar: (enrollment as any).restricaoAlimentar || false,
            tipoRestricao: (enrollment as any).tipoRestricao || '',
            alergia: (enrollment as any).alergia || false,
            tipoAlergia: (enrollment as any).tipoAlergia || '',
            mobilidadeReduzida: (enrollment as any).mobilidadeReduzida as any,
            possuiDeficienciasMultiplas: (enrollment as any).possuiDeficienciasMultiplas || false,
            tipoDeficiencia: (enrollment as any).tipoDeficiencia || '',
            publicoEducacaoEspecial: (enrollment as any).publicoEducacaoEspecial || false,
            tipoEducacaoEspecial: (enrollment as any).tipoEducacaoEspecial || '',
            classificacao: (enrollment as any).classificacao || [],
            recebeAuxilioGoverno: (enrollment as any).recebeAuxilioGoverno || false,
            tipoAuxilio: (enrollment as any).tipoAuxilio as any,
            numeroNIS: (enrollment as any).numeroNIS || ''
          },
          step2: {
            guardians: ((enrollment as any).guardians || []).map((g: any) => ({
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
              email: g.email || ''
            }))
          },
          step3: {
            logradouro: (enrollment as any).logradouro || (enrollment as any).endereco || '',
            numero: (enrollment as any).numero || '',
            pontoReferencia: (enrollment as any).pontoReferencia || '',
            bairro: (enrollment as any).bairro || '',
            municipio: (enrollment as any).municipio || '',
            uf: (enrollment as any).uf || '',
            cep: (enrollment as any).cep || ''
          },
          step6: {
            serie: (enrollment as any).serie,
            anoLetivo: (new Date().getFullYear()).toString(),
            authorizedPersons: ((enrollment as any).authorizedPersons || []).map((p: any) => ({
              nome: p.nome || '',
              parentesco: p.parentesco || '',
              rg: p.rg,
              telefone: p.telefone
            }))
          }
        }

        // Data prefilled successfully
        setInitialData(converted)
      } catch (error) {
        // Error loading enrollment for prefill - using empty form
      }
    }

    loadPrefill()
  }, [prefillFrom])

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

  if (success) {
    return (
      <SuccessFeedback
        title="Matrícula registrada com sucesso!"
        message="A matrícula foi registrada no sistema com sucesso."
        buttonText="Voltar para Matrículas"
        onButtonClick={() => router.push('/matriculas')}
      />
    )
  }

  return (
    <>
      <PageHeader
        title="Nova Matrícula"
        subtitle="Preencha todas as informações para realizar a matrícula da criança"
      />

      <Card className="mb-6">
        <CardContent className="p-4">
          <div className="flex items-start space-x-3">
            <FileText className="h-5 w-5 text-blue-600 mt-0.5" />
            <div className="text-sm text-gray-700 dark:text-gray-300">
              <p className="font-medium text-gray-900 dark:text-white mb-1">
                Informações importantes:
              </p>
              <ul className="space-y-1 list-disc list-inside">
                <li>Todos os campos marcados com * são obrigatórios</li>
                <li>Seus dados são salvos automaticamente como rascunho</li>
                <li>Você pode voltar e editar informações anteriores</li>
                <li>Após finalizar, a matrícula será enviada para aprovação</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-0">
          <EnrollmentWizard
            initialData={initialData}
            onComplete={handleComplete}
            onSaveDraft={handleSaveDraft}
            isEditing={false}
            isRematricula={isRematricula}
          />
        </CardContent>
      </Card>

      <div className="mt-6">
        <Button
          variant="outline"
          onClick={() => router.back()}
          icon={<ArrowLeft className="h-4 w-4" />}
        >
          Voltar
        </Button>
      </div>
    </>
  )
}

export default function NewEnrollmentPage() {
  return (
    <AuthGuard>
      <RoleGuard allowedRoles={['funcionario', 'administrador']}>
        <Container>
          <Suspense fallback={<div className="text-center py-8">Carregando...</div>}>
            <NewEnrollmentContent />
          </Suspense>
        </Container>
      </RoleGuard>
    </AuthGuard>
  )
}
