'use client'

import React, { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Card, CardContent, CardHeader } from '@/components/ui/Card'
import { FormField, Input, Checkbox } from './FormField'
import { ReviewSchema, type Review } from '@/lib/enrollment-schemas'
import { formatCurrency } from '@/lib/enrollment-utils'
import { CheckCircle, Calendar, FileText, User } from 'lucide-react'
import { motion } from 'framer-motion'

interface ReviewStepProps {
  data?: Partial<Review>
  enrollmentData: any // Dados completos da matrícula para revisão
  onSubmit: (data: Review) => void
  onSaveDraft?: (data: Partial<Review>) => void
  onPrevious?: () => void
  isEditing?: boolean
  isRematricula?: boolean
}

export function ReviewStep({ data, enrollmentData, onSubmit, onSaveDraft, onPrevious, isEditing, isRematricula }: ReviewStepProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  
  const {
    register,
    handleSubmit,
    watch,
    setValue,
    reset,
    formState: { errors, isValid }
  } = useForm({
    resolver: zodResolver(ReviewSchema),
    defaultValues: {
      dataMatricula: new Date(),
      aceiteDeclaracao: false,
      assinaturaResponsavel: '',
      ...data
    }
  })

  const watchedValues = watch()

  // Atualizar valores do formulário quando os dados mudam
  useEffect(() => {
    if (data) {
      reset({
        dataMatricula: data.dataMatricula || new Date(),
        aceiteDeclaracao: data.aceiteDeclaracao || false,
        assinaturaResponsavel: data.assinaturaResponsavel || ''
      })
    }
  }, [data, reset])

  const handleFormSubmit = async (formData: any) => {
    setIsSubmitting(true)
    try {
      await onSubmit(formData)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleSaveDraft = () => {
    if (onSaveDraft) {
      onSaveDraft(watchedValues)
    }
  }

  // Calcular renda per capita
  const totalRenda = enrollmentData?.step5?.members?.reduce((sum: number, member: any) => sum + (member.valorBruto || 0), 0) || 0
  const rendaPerCapita = enrollmentData?.step5?.members?.length ? totalRenda / enrollmentData.step5.members.length : 0

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6">
      {/* Resumo da Matrícula */}
      <Card>
        <CardHeader title="Revisão da Matrícula" />
        <CardContent className="space-y-6">
          {/* Informações da Criança */}
          <div className="border border-gray-200 rounded-lg p-4">
            <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
              <User className="h-5 w-5 mr-2" />
              Informações da Criança
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div>
                <span className="font-medium text-gray-700">Nome:</span>
                <p className="text-gray-900">{enrollmentData?.step1?.nome}</p>
              </div>
              <div>
                <span className="font-medium text-gray-700">Data de Nascimento:</span>
                <p className="text-gray-900">{enrollmentData?.step1?.dataNascimento ? new Date(enrollmentData.step1.dataNascimento).toLocaleDateString('pt-BR') : '-'}</p>
              </div>
              <div>
                <span className="font-medium text-gray-700">Sexo:</span>
                <p className="text-gray-900">{enrollmentData?.step1?.sexo || '-'}</p>
              </div>
              <div>
                <span className="font-medium text-gray-700">Cor/Raça:</span>
                <p className="text-gray-900">{enrollmentData?.step1?.corRaca || '-'}</p>
              </div>
              <div>
                <span className="font-medium text-gray-700">Série:</span>
                <p className="text-gray-900">{enrollmentData?.step6?.serie || '-'}</p>
              </div>
              <div>
                <span className="font-medium text-gray-700">Ano Letivo:</span>
                <p className="text-gray-900">{enrollmentData?.step6?.anoLetivo || '-'}</p>
              </div>
            </div>
          </div>

          {/* Responsáveis */}
          <div className="border border-gray-200 rounded-lg p-4">
            <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
              <User className="h-5 w-5 mr-2" />
              Responsáveis
            </h3>
            <div className="space-y-2">
              {enrollmentData?.step2?.guardians?.map((guardian: any, index: number) => (
                <div key={index} className="text-sm">
                  <span className="font-medium text-gray-700">{guardian.tipoResponsavel}:</span>
                  <p className="text-gray-900">{guardian.nome}</p>
                  {guardian.celular && (
                    <p className="text-gray-600">Tel: {guardian.celular}</p>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Endereço */}
          <div className="border border-gray-200 rounded-lg p-4">
            <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
              <FileText className="h-5 w-5 mr-2" />
              Endereço
            </h3>
            <div className="text-sm">
              <p className="text-gray-900">
                {enrollmentData?.step3?.logradouro}, {enrollmentData?.step3?.numero}
              </p>
              <p className="text-gray-900">
                {enrollmentData?.step3?.bairro} - {enrollmentData?.step3?.municipio}/{enrollmentData?.step3?.uf}
              </p>
              <p className="text-gray-900">CEP: {enrollmentData?.step3?.cep}</p>
            </div>
          </div>

          {/* Resumo Financeiro */}
          <div className="border border-gray-200 rounded-lg p-4">
            <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
              <FileText className="h-5 w-5 mr-2" />
              Resumo Financeiro
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
              <div>
                <span className="font-medium text-gray-700">Membros da Família:</span>
                <p className="text-gray-900">{enrollmentData?.step5?.members?.length || 0}</p>
              </div>
              <div>
                <span className="font-medium text-gray-700">Renda Familiar Total:</span>
                <p className="text-gray-900">{formatCurrency(totalRenda)}</p>
              </div>
              <div>
                <span className="font-medium text-gray-700">Renda Per Capita:</span>
                <p className="text-gray-900">{formatCurrency(rendaPerCapita)}</p>
              </div>
            </div>
          </div>

          {/* Pessoas Autorizadas */}
          <div className="border border-gray-200 rounded-lg p-4">
            <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
              <User className="h-5 w-5 mr-2" />
              Pessoas Autorizadas
            </h3>
            <div className="space-y-2">
              {enrollmentData?.step6?.authorizedPersons?.map((person: any, index: number) => (
                <div key={index} className="text-sm">
                  <span className="font-medium text-gray-700">{person.nome}</span>
                  <p className="text-gray-600">Parentesco: {person.parentesco}</p>
                  {person.telefone && (
                    <p className="text-gray-600">Tel: {person.telefone}</p>
                  )}
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Finalização */}
      <Card>
        <CardHeader title="Finalização da Matrícula" />
        <CardContent className="space-y-4">
          <FormField
            label="Data da Matrícula"
            name="dataMatricula"
            required
            error={errors.dataMatricula?.message}
          >
            <Input
              type="date"
              {...register('dataMatricula', {
                setValueAs: (value) => value ? new Date(value) : new Date()
              })}
              icon={<Calendar className="h-4 w-4 text-gray-400" />}
              error={errors.dataMatricula?.message}
            />
          </FormField>

          <FormField
            label="Assinatura do Responsável"
            name="assinaturaResponsavel"
            required
            error={errors.assinaturaResponsavel?.message}
            helper="Digite o nome completo do responsável que está assinando"
          >
            <Input
              {...register('assinaturaResponsavel')}
              placeholder="Nome completo do responsável"
              icon={<User className="h-4 w-4 text-gray-400" />}
              error={errors.assinaturaResponsavel?.message}
            />
          </FormField>

          <div className="border border-gray-200 rounded-lg p-4 bg-gray-50 dark:bg-gray-800">
            <div className="flex items-start space-x-3">
              <Checkbox
                {...register('aceiteDeclaracao')}
                label=""
                className="mt-1"
              />
              <div className="text-sm text-gray-700 dark:text-gray-300">
                <p className="font-medium mb-2">Declaração de Veracidade</p>
                <p>
                  Declaro que todas as informações fornecidas neste formulário são verdadeiras e estou ciente de que 
                  informações falsas podem resultar no cancelamento da matrícula. Autorizo o uso dos dados para 
                  fins educacionais e administrativos da instituição.
                </p>
              </div>
            </div>
            {errors.aceiteDeclaracao && (
              <p className="text-sm text-red-600 mt-2" role="alert">
                {errors.aceiteDeclaracao.message}
              </p>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Botões de ação */}
      <div className="flex justify-between pt-6 border-t border-gray-200">
        <div className="flex space-x-3">
          {onPrevious && (
            <button
              type="button"
              onClick={onPrevious}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2"
            >
              Voltar
            </button>
          )}
          
          <button
            type="button"
            onClick={handleSaveDraft}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2"
          >
            Salvar Rascunho
          </button>
        </div>
        
        <motion.button
          type="submit"
          disabled={!isValid || isSubmitting}
          className="px-6 py-2 text-sm font-medium text-white bg-primary-600 border border-transparent rounded-md hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          {isSubmitting ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
              <span>Finalizando...</span>
            </>
          ) : (
            <>
              <CheckCircle className="h-4 w-4" />
                <span>{ isEditing ? 'SALVAR DADOS' : (isRematricula ? 'FINALIZAR REMATRÍCULA' : 'Finalizar Matrícula') }</span>
            </>
          )}
        </motion.button>
      </div>
    </form>
  )
}
