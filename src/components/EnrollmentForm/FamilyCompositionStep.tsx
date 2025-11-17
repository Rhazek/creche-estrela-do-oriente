'use client'

import React, { useState, useEffect } from 'react'
import { useForm, useFieldArray } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Card, CardContent, CardHeader } from '@/components/ui/Card'
import { FormField, Input, Select } from './FormField'
import { FamilyCompositionSchema, type FamilyComposition, type FamilyMember } from '@/lib/enrollment-schemas'
import { formatCurrency, parseCurrency, calculateRendaPerCapita } from '@/lib/enrollment-utils'
import { User, Plus, Trash2, DollarSign, Users } from 'lucide-react'

interface FamilyCompositionStepProps {
  data?: Partial<FamilyComposition>
  onSubmit: (data: FamilyComposition) => void
  onSaveDraft?: (data: Partial<FamilyComposition>) => void
  onDataChange?: (data: Partial<FamilyComposition>) => void
}

const PARENTESCO_OPTIONS = [
  { value: 'Aluno(a)', label: 'Aluno(a)' },
  { value: 'Mãe', label: 'Mãe' },
  { value: 'Pai', label: 'Pai' },
  { value: 'Avó', label: 'Avó' },
  { value: 'Avô', label: 'Avô' },
  { value: 'Tia', label: 'Tia' },
  { value: 'Tio', label: 'Tio' },
  { value: 'Madrinha', label: 'Madrinha' },
  { value: 'Padrinho', label: 'Padrinho' },
  { value: 'Irmão', label: 'Irmão' },
  { value: 'Irmã', label: 'Irmã' },
  { value: 'Primo', label: 'Primo' },
  { value: 'Prima', label: 'Prima' },
  { value: 'Outro', label: 'Outro' }
]

const SITUACAO_ESCOLAR_OPTIONS = [
  { value: 'Não frequenta', label: 'Não frequenta' },
  { value: 'Creche', label: 'Creche' },
  { value: 'Pré-escola', label: 'Pré-escola' },
  { value: 'Ensino Fundamental', label: 'Ensino Fundamental' },
  { value: 'Ensino Médio', label: 'Ensino Médio' },
  { value: 'Ensino Superior', label: 'Ensino Superior' },
  { value: 'Outro', label: 'Outro' }
]

const SITUACAO_EMPREGO_OPTIONS = [
  { value: 'Desempregado', label: 'Desempregado' },
  { value: 'Empregado', label: 'Empregado' },
  { value: 'Autônomo', label: 'Autônomo' },
  { value: 'Aposentado', label: 'Aposentado' },
  { value: 'Estudante', label: 'Estudante' },
  { value: 'Dona de casa', label: 'Dona de casa' },
  { value: 'Outro', label: 'Outro' }
]

export function FamilyCompositionStep({ data, onSubmit, onSaveDraft, onDataChange }: FamilyCompositionStepProps) {
  const [totalRenda, setTotalRenda] = useState(0)
  const [rendaPerCapita, setRendaPerCapita] = useState(0)
  
  const {
    register,
    handleSubmit,
    control,
    watch,
    setValue,
    reset,
    formState: { errors, isValid }
  } = useForm({
    resolver: zodResolver(FamilyCompositionSchema),
    defaultValues: {
      members: data?.members || [
        {
          nomeMembro: '',
          idade: 0,
          parentesco: '',
          situacaoEscolar: '',
          situacaoEmprego: '',
          rendimentoDescricao: '',
          valorBruto: 0
        }
      ]
    }
  })

  const { fields, append, remove } = useFieldArray({
    control,
    name: 'members'
  })

  const watchedValues = watch()

  // Atualizar valores do formulário quando os dados mudam
  useEffect(() => {
    if (data) {
      reset({
        members: data.members || [
          {
            nomeMembro: '',
            idade: 0,
            parentesco: '',
            situacaoEscolar: '',
            situacaoEmprego: '',
            rendimentoDescricao: '',
            valorBruto: 0
          }
        ]
      })
    }
  }, [data, reset])

  // Calcular renda dinamicamente
  useEffect(() => {
    const members = watchedValues.members || []
    const total = members.reduce((sum: number, member: any) => sum + (member.valorBruto || 0), 0)
    const perCapita = members.length > 0 ? total / members.length : 0
    
    setTotalRenda(total)
    setRendaPerCapita(perCapita)
  }, [watchedValues.members])

  // Notificar mudanças nos dados
  useEffect(() => {
    if (onDataChange) {
      onDataChange(watchedValues as Partial<FamilyComposition>)
    }
  }, [watchedValues, onDataChange])

  const handleFormSubmit = (formData: any) => {
    onSubmit(formData as FamilyComposition)
  }

  const handleSaveDraft = () => {
    if (onSaveDraft) {
      onSaveDraft(watchedValues as FamilyComposition)
    }
  }

  const addMember = () => {
    if (fields.length < 8) {
      append({
        nomeMembro: '',
        idade: 0,
        parentesco: '',
        situacaoEscolar: '',
        situacaoEmprego: '',
        rendimentoDescricao: '',
        valorBruto: 0
      })
    }
  }

  const removeMember = (index: number) => {
    if (fields.length > 1) {
      remove(index)
    }
  }

  // Calcular totais
  const totalRendaCalculada = watchedValues.members?.reduce((sum, member) => sum + (member.valorBruto || 0), 0) || 0
  const rendaPerCapitaCalculada = watchedValues.members?.length ? totalRendaCalculada / watchedValues.members.length : 0

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6">
      <Card>
        <CardHeader 
          title="Composição Familiar" 
          subtitle="Informe os dados de todos os membros da família (máximo 8)"
        />
        <CardContent className="space-y-6">
          {fields.map((field, index) => (
            <div key={field.id} className="border border-gray-200 rounded-lg p-4 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-medium text-gray-900">
                  Membro {index + 1}
                </h3>
                {fields.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeMember(index)}
                    className="text-red-600 hover:text-red-800 p-1"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <FormField
                  label="Nome"
                  name={`members.${index}.nomeMembro`}
                  required
                  error={errors.members?.[index]?.nomeMembro?.message}
                >
                  <Input
                    {...register(`members.${index}.nomeMembro`)}
                    placeholder="Nome completo"
                    icon={<User className="h-4 w-4 text-gray-400" />}
                    error={errors.members?.[index]?.nomeMembro?.message}
                  />
                </FormField>

                <FormField
                  label="Idade"
                  name={`members.${index}.idade`}
                  required
                  error={errors.members?.[index]?.idade?.message}
                >
                  <Input
                    type="number"
                    min="0"
                    max="120"
                    {...register(`members.${index}.idade`, {
                      setValueAs: (value) => parseInt(value) || 0
                    })}
                    placeholder="0"
                    error={errors.members?.[index]?.idade?.message}
                  />
                </FormField>

                <FormField
                  label="Parentesco"
                  name={`members.${index}.parentesco`}
                  required
                  error={errors.members?.[index]?.parentesco?.message}
                >
                  <Select
                    {...register(`members.${index}.parentesco`)}
                    options={PARENTESCO_OPTIONS}
                    placeholder="Selecione o parentesco"
                    error={errors.members?.[index]?.parentesco?.message}
                  />
                </FormField>

                <FormField
                  label="Situação Escolar"
                  name={`members.${index}.situacaoEscolar`}
                  error={errors.members?.[index]?.situacaoEscolar?.message}
                >
                  <Select
                    {...register(`members.${index}.situacaoEscolar`)}
                    options={SITUACAO_ESCOLAR_OPTIONS}
                    placeholder="Selecione a situação escolar"
                    error={errors.members?.[index]?.situacaoEscolar?.message}
                  />
                </FormField>

                <FormField
                  label="Situação de Emprego"
                  name={`members.${index}.situacaoEmprego`}
                  error={errors.members?.[index]?.situacaoEmprego?.message}
                >
                  <Select
                    {...register(`members.${index}.situacaoEmprego`)}
                    options={SITUACAO_EMPREGO_OPTIONS}
                    placeholder="Selecione a situação de emprego"
                    error={errors.members?.[index]?.situacaoEmprego?.message}
                  />
                </FormField>

                <FormField
                  label="Rendimento Bruto"
                  name={`members.${index}.valorBruto`}
                  error={errors.members?.[index]?.valorBruto?.message}
                >
                  <Input
                    {...register(`members.${index}.valorBruto`, {
                      setValueAs: (value) => parseCurrency(value)
                    })}
                    placeholder="R$ 0,00"
                    icon={<DollarSign className="h-4 w-4 text-gray-400" />}
                    error={errors.members?.[index]?.valorBruto?.message}
                    onBlur={(e) => {
                      const formatted = formatCurrency(parseCurrency(e.target.value))
                      e.target.value = formatted
                    }}
                  />
                </FormField>

                <FormField
                  label="Descrição do Rendimento"
                  name={`members.${index}.rendimentoDescricao`}
                  error={errors.members?.[index]?.rendimentoDescricao?.message}
                  className="md:col-span-2 lg:col-span-3"
                  helper="Ex: Salário, pensão, aposentadoria, etc."
                >
                  <Input
                    {...register(`members.${index}.rendimentoDescricao`)}
                    placeholder="Descreva a fonte do rendimento"
                    error={errors.members?.[index]?.rendimentoDescricao?.message}
                  />
                </FormField>
              </div>
            </div>
          ))}

          {fields.length < 8 && (
            <button
              type="button"
              onClick={addMember}
              className="flex items-center space-x-2 px-4 py-2 text-sm font-medium text-primary-600 bg-primary-50 border border-primary-200 rounded-md hover:bg-primary-100 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2"
            >
              <Plus className="h-4 w-4" />
              <span>Adicionar Membro</span>
            </button>
          )}
        </CardContent>
      </Card>

      {/* Resumo Financeiro */}
      <Card>
        <CardHeader title="Resumo Financeiro" />
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-gray-50 rounded-lg p-4 text-center dark:bg-gray-800">
              <Users className="h-8 w-8 text-gray-400 mx-auto mb-2" />
              <p className="text-sm text-gray-600 dark:text-gray-400">Total de Membros</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{fields.length}</p>
            </div>
            
            <div className="bg-green-50 rounded-lg p-4 text-center dark:bg-green-900/20">
              <DollarSign className="h-8 w-8 text-green-600 mx-auto mb-2" />
              <p className="text-sm text-green-600 dark:text-green-400">Renda Familiar Total</p>
              <p className="text-2xl font-bold text-green-700 dark:text-green-300">
                {formatCurrency(totalRendaCalculada)}
              </p>
            </div>
            
            <div className="bg-blue-50 rounded-lg p-4 text-center dark:bg-blue-900/20">
              <DollarSign className="h-8 w-8 text-blue-600 mx-auto mb-2" />
              <p className="text-sm text-blue-600 dark:text-blue-400">Renda Per Capita</p>
              <p className="text-2xl font-bold text-blue-700 dark:text-blue-300">
                {formatCurrency(rendaPerCapitaCalculada)}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

    </form>
  )
}
