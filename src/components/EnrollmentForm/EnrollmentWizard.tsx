'use client'

import React, { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { StepIndicator, StepNavigation } from './StepIndicator'
import { ChildInfoStep } from './ChildInfoStep'
import { GuardiansStep } from './GuardiansStep'
import { AddressDocumentsStep } from './AddressDocumentsStep'
import { HousingAssetsStep } from './HousingAssetsStep'
import { FamilyCompositionStep } from './FamilyCompositionStep'
import { SchoolAuthorizedStep } from './SchoolAuthorizedStep'
import { ReviewStep } from './ReviewStep'
import { EnrollmentFormData, type WizardStep } from '@/lib/enrollment-schemas'
import { saveDraftToLocalStorage, loadDraftFromLocalStorage, removeDraftFromLocalStorage } from '@/lib/enrollment-utils'
import toast from 'react-hot-toast'

interface EnrollmentWizardProps {
  initialData?: Partial<EnrollmentFormData>
  onComplete: (data: EnrollmentFormData) => Promise<void>
  onSaveDraft?: (data: Partial<EnrollmentFormData>) => Promise<void>
  isEditing?: boolean
  enrollmentId?: string
  isRematricula?: boolean
}

const STEPS = [
  {
    number: 1,
    title: 'Identificação da Criança',
    description: 'Informações básicas e de saúde da criança'
  },
  {
    number: 2,
    title: 'Responsáveis',
    description: 'Dados dos responsáveis pela criança'
  },
  {
    number: 3,
    title: 'Endereço & Documentos',
    description: 'Endereço residencial e documentos da criança'
  },
  {
    number: 4,
    title: 'Situação Habitacional & Bens',
    description: 'Condições de moradia e bens da família'
  },
  {
    number: 5,
    title: 'Composição Familiar',
    description: 'Membros da família e renda familiar'
  },
  {
    number: 6,
    title: 'Série & Autorizados',
    description: 'Informações escolares e pessoas autorizadas'
  },
  {
    number: 7,
    title: 'Revisão e Confirmar',
    description: 'Revisão final e confirmação da matrícula'
  }
]

export function EnrollmentWizard({
  initialData,
  onComplete,
  onSaveDraft,
  isEditing = false,
  enrollmentId
  ,
  isRematricula = false
}: EnrollmentWizardProps) {
  const [currentStep, setCurrentStep] = useState<WizardStep>(1)
  const [formData, setFormData] = useState<Partial<EnrollmentFormData>>(initialData || {})
  const [isLoading, setIsLoading] = useState(false)
  const [isSavingDraft, setIsSavingDraft] = useState(false)
  const currentStepDataRef = useRef<any>(null)

  const draftKey = `enrollment_draft_${enrollmentId || 'new'}`

  // Carregar rascunho do localStorage
  useEffect(() => {
    // Se houver `initialData` (prefill) preferimos esse prefill ao rascunho salvo.
    if (!isEditing && !initialData) {
      const savedDraft = loadDraftFromLocalStorage(draftKey)
      if (savedDraft) {
        setFormData(savedDraft)
        toast.success('Rascunho carregado automaticamente')
      }
    }
  }, [draftKey, isEditing])

  // Autosave do rascunho
  useEffect(() => {
    if (!isEditing && Object.keys(formData).length > 0) {
      const timeoutId = setTimeout(() => {
        saveDraftToLocalStorage(draftKey, formData)
      }, 2000)

      return () => clearTimeout(timeoutId)
    }
  }, [formData, draftKey, isEditing])

  // Se houver `initialData` (prefill), usar como estado inicial.
  useEffect(() => {
    if (!initialData) return
    console.log('EnrollmentWizard received initialData:', initialData)
    setFormData(initialData)
  }, [initialData])

  const handleStepSubmit = (stepNumber: WizardStep, stepData: any) => {
    console.log(`Salvando dados da etapa ${stepNumber}:`, stepData)
    console.log('FormData antes:', formData)
    
    setFormData(prev => {
      const newData = {
        ...prev,
        [`step${stepNumber}`]: stepData
      }
      console.log('FormData depois:', newData)
      return newData
    })
  }

  const handleSaveDraft = async () => {
    if (!onSaveDraft) return

    setIsSavingDraft(true)
    try {
      await onSaveDraft(formData)
      saveDraftToLocalStorage(draftKey, formData)
      toast.success('Rascunho salvo com sucesso!')
    } catch (error) {
      toast.error('Erro ao salvar rascunho')
    } finally {
      setIsSavingDraft(false)
    }
  }

  const handleComplete = async (reviewData: any) => {
    setIsLoading(true)
    try {
      const completeData: EnrollmentFormData = {
        ...formData,
        step7: reviewData
      } as EnrollmentFormData

      await onComplete(completeData)
      
      // Limpar rascunho após conclusão
      removeDraftFromLocalStorage(draftKey)
      
      toast.success('Matrícula realizada com sucesso!')
    } catch (error) {
      toast.error('Erro ao finalizar matrícula')
      throw error
    } finally {
      setIsLoading(false)
    }
  }

  const goToNextStep = () => {
    // Salvar dados da etapa atual antes de avançar
    if (currentStepDataRef.current) {
      handleStepSubmit(currentStep, currentStepDataRef.current)
    }
    
    if (currentStep < 7) {
      setCurrentStep((currentStep + 1) as WizardStep)
    }
  }

  const goToPreviousStep = () => {
    // Salvar dados da etapa atual antes de voltar
    if (currentStepDataRef.current) {
      handleStepSubmit(currentStep, currentStepDataRef.current)
    }
    
    if (currentStep > 1) {
      setCurrentStep((currentStep - 1) as WizardStep)
    }
  }

  // Função para obter dados da etapa atual
  const getCurrentStepData = () => {
    // Esta função será implementada para obter os dados do formulário atual
    // Por enquanto, retorna null para não quebrar
    return null
  }

  const renderCurrentStep = () => {
    const stepData = formData[`step${currentStep}` as keyof EnrollmentFormData] as any || {}
    
    // Debug: verificar se os dados estão sendo passados
    console.log(`Etapa ${currentStep} - Dados:`, stepData)
    console.log('FormData completo:', formData)

    switch (currentStep) {
      case 1:
        return (
          <ChildInfoStep
            data={stepData}
            onSubmit={(data) => {
              handleStepSubmit(1, data)
              goToNextStep()
            }}
            onSaveDraft={handleSaveDraft}
            onDataChange={(data) => {
              currentStepDataRef.current = data
            }}
          />
        )
      case 2:
        return (
          <GuardiansStep
            data={stepData}
            onSubmit={(data) => {
              handleStepSubmit(2, data)
              goToNextStep()
            }}
            onSaveDraft={handleSaveDraft}
            onDataChange={(data) => {
              currentStepDataRef.current = data
            }}
          />
        )
      case 3:
        return (
          <AddressDocumentsStep
            data={stepData}
            onSubmit={(data) => {
              handleStepSubmit(3, data)
              goToNextStep()
            }}
            onSaveDraft={handleSaveDraft}
            onDataChange={(data) => {
              currentStepDataRef.current = data
            }}
          />
        )
      case 4:
        return (
          <HousingAssetsStep
            data={stepData}
            onSubmit={(data) => {
              handleStepSubmit(4, data)
              goToNextStep()
            }}
            onSaveDraft={handleSaveDraft}
            onDataChange={(data) => {
              currentStepDataRef.current = data
            }}
          />
        )
      case 5:
        return (
          <FamilyCompositionStep
            data={stepData}
            onSubmit={(data) => {
              handleStepSubmit(5, data)
              goToNextStep()
            }}
            onSaveDraft={handleSaveDraft}
            onDataChange={(data) => {
              currentStepDataRef.current = data
            }}
          />
        )
      case 6:
        return (
          <SchoolAuthorizedStep
            data={stepData}
            onSubmit={(data) => {
              handleStepSubmit(6, data)
              goToNextStep()
            }}
            onSaveDraft={handleSaveDraft}
            onDataChange={(data) => {
              currentStepDataRef.current = data
            }}
          />
        )
      case 7:
        return (
          <ReviewStep
            data={stepData}
            enrollmentData={formData}
              onSubmit={handleComplete}
            onSaveDraft={handleSaveDraft}
            onPrevious={goToPreviousStep}
              isEditing={isEditing}
              isRematricula={isRematricula}
          />
        )
      default:
        return null
    }
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      {/* Indicador de Progresso */}
      <StepIndicator
        currentStep={currentStep}
        totalSteps={7}
        steps={STEPS}
        className="mb-8"
        onStepClick={(n) => setCurrentStep(n as WizardStep)}
      />

      {/* Conteúdo da Etapa */}
      <AnimatePresence mode="wait">
        <motion.div
          key={currentStep}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          transition={{ duration: 0.3 }}
        >
          {renderCurrentStep()}
        </motion.div>
      </AnimatePresence>

      {/* Navegação entre Etapas */}
      {currentStep < 7 && (
        <StepNavigation
          currentStep={currentStep}
          totalSteps={7}
          onPrevious={goToPreviousStep}
          onNext={goToNextStep}
          onSaveDraft={handleSaveDraft}
          isPreviousDisabled={currentStep === 1}
          isLoading={isLoading || isSavingDraft}
          className="mt-8"
        />
      )}

      {/* Informações de Ajuda */}
      <div className="mt-8 p-4 bg-blue-50 border border-blue-200 rounded-lg dark:bg-blue-900/20 dark:border-blue-800">
        <div className="flex items-start space-x-3">
          <div className="flex-shrink-0">
            <svg className="h-5 w-5 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
            </svg>
          </div>
          <div className="text-sm text-blue-800 dark:text-blue-200">
            <p className="font-medium">Dicas importantes:</p>
            <ul className="mt-1 space-y-1 list-disc list-inside">
              <li>Seus dados são salvos automaticamente como rascunho</li>
              <li>Você pode voltar e editar informações anteriores</li>
              <li>Todos os campos marcados com * são obrigatórios</li>
              <li>Use o botão "Salvar Rascunho" para garantir que não perca dados</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
}
