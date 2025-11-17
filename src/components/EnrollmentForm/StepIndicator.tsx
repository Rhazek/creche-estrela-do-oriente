'use client'

import React from 'react'
import { cn } from '@/lib/utils'
import { CheckCircle, Circle } from 'lucide-react'

interface StepIndicatorProps {
  currentStep: number
  totalSteps: number
  steps: Array<{
    number: number
    title: string
    description: string
  }>
  className?: string
  onStepClick?: (step: number) => void
}

export function StepIndicator({
  currentStep,
  totalSteps,
  steps,
  className,
  onStepClick
}: StepIndicatorProps) {
  return (
    <div className={cn('w-full', className)}>
      {/* Barra de progresso */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          {steps.map((step, index) => (
            <div key={step.number} className="flex items-center">
              {/* Círculo do passo */}
              <div className="flex items-center justify-center">
                <button
                  type="button"
                  onClick={() => onStepClick && onStepClick(step.number)}
                  className="flex items-center justify-center"
                >
                  <div
                  className={cn(
                    'flex items-center justify-center w-8 h-8 rounded-full border-2 transition-colors',
                    step.number <= currentStep
                      ? 'border-primary-500 bg-primary-500 text-white'
                      : 'border-gray-300 bg-white text-gray-400 dark:border-gray-600 dark:bg-gray-800'
                  )}
                >
                  {step.number < currentStep ? (
                    <CheckCircle className="w-5 h-5" />
                  ) : (
                    <span className="text-sm font-medium">{step.number}</span>
                  )}
                  </div>
                </button>
              </div>
              
              {/* Linha conectora */}
              {index < steps.length - 1 && (
                <div
                  className={cn(
                    'flex-1 h-0.5 mx-4 transition-colors',
                    step.number < currentStep
                      ? 'bg-primary-500'
                      : 'bg-gray-300 dark:bg-gray-600'
                  )}
                />
              )}
            </div>
          ))}
        </div>
      </div>
      
      {/* Informações do passo atual */}
      <div className="text-center">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
          {steps[currentStep - 1]?.title}
        </h2>
        <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
          {steps[currentStep - 1]?.description}
        </p>
      </div>
      
      {/* Indicador de progresso */}
      <div className="mt-4">
        <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400">
          <span>Passo {currentStep} de {totalSteps}</span>
          <span>{Math.round((currentStep / totalSteps) * 100)}% concluído</span>
        </div>
        <div className="mt-2 w-full bg-gray-200 rounded-full h-2 dark:bg-gray-700">
          <div
            className="bg-primary-500 h-2 rounded-full transition-all duration-300"
            style={{ width: `${(currentStep / totalSteps) * 100}%` }}
          />
        </div>
      </div>
    </div>
  )
}

// Componente para navegação entre passos
interface StepNavigationProps {
  currentStep: number
  totalSteps: number
  onPrevious: () => void
  onNext: () => void
  onSaveDraft?: () => void
  isNextDisabled?: boolean
  isPreviousDisabled?: boolean
  isLoading?: boolean
  className?: string
}

export function StepNavigation({
  currentStep,
  totalSteps,
  onPrevious,
  onNext,
  onSaveDraft,
  isNextDisabled = false,
  isPreviousDisabled = false,
  isLoading = false,
  className
}: StepNavigationProps) {
  return (
    <div className={cn('flex items-center justify-between pt-6 border-t border-gray-200 dark:border-gray-700', className)}>
      <div className="flex items-center space-x-3">
        <button
          type="button"
          onClick={onPrevious}
          disabled={isPreviousDisabled || isLoading}
          className={cn(
            'px-4 py-2 text-sm font-medium rounded-md border transition-colors',
            isPreviousDisabled || isLoading
              ? 'border-gray-300 text-gray-400 cursor-not-allowed dark:border-gray-600'
              : 'border-gray-300 text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-800'
          )}
        >
          Voltar
        </button>
        
        {onSaveDraft && (
          <button
            type="button"
            onClick={onSaveDraft}
            disabled={isLoading}
            className={cn(
              'px-4 py-2 text-sm font-medium rounded-md border border-gray-300 text-gray-700 hover:bg-gray-50 transition-colors dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-800',
              isLoading && 'opacity-50 cursor-not-allowed'
            )}
          >
            Salvar Rascunho
          </button>
        )}
      </div>
      
      <div className="flex items-center space-x-3">
        <span className="text-sm text-gray-500 dark:text-gray-400">
          {currentStep} de {totalSteps}
        </span>
        
        <button
          type="button"
          onClick={onNext}
          disabled={isNextDisabled || isLoading}
          className={cn(
            'px-6 py-2 text-sm font-medium rounded-md transition-colors',
            isNextDisabled || isLoading
              ? 'bg-gray-300 text-gray-500 cursor-not-allowed dark:bg-gray-600 dark:text-gray-400'
              : 'bg-primary-600 text-white hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2'
          )}
        >
          {isLoading ? 'Carregando...' : currentStep === totalSteps ? 'Finalizar' : 'Próximo'}
        </button>
      </div>
    </div>
  )
}




