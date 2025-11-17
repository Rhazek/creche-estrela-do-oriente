'use client'

import React, { useEffect } from 'react'
import { useForm, useFieldArray } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Card, CardContent, CardHeader } from '@/components/ui/Card'
import { FormField, Input, Select } from './FormField'
import { SchoolAuthorizedSchema, type SchoolAuthorized, type AuthorizedPerson } from '@/lib/enrollment-schemas'
import { formatPhone } from '@/lib/enrollment-utils'
import { GraduationCap, User, Phone, FileText, Plus, Trash2 } from 'lucide-react'

interface SchoolAuthorizedStepProps {
  data?: Partial<SchoolAuthorized>
  onSubmit: (data: SchoolAuthorized) => void
  onSaveDraft?: (data: Partial<SchoolAuthorized>) => void
  onDataChange?: (data: Partial<SchoolAuthorized>) => void
}

const SERIE_OPTIONS = [
  { value: 'Berçário I', label: 'Berçário I' },
  { value: 'Berçário II', label: 'Berçário II' },
  { value: 'Maternal I', label: 'Maternal I' },
  { value: 'Maternal II', label: 'Maternal II' },
  { value: 'Pré I', label: 'Pré I' },
  { value: 'Pré II', label: 'Pré II' }
]

const ANO_LETIVO_OPTIONS = [
  { value: '2024', label: '2024' },
  { value: '2025', label: '2025' },
  { value: '2026', label: '2026' }
]

const PARENTESCO_AUTORIZADO_OPTIONS = [
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

export function SchoolAuthorizedStep({ data, onSubmit, onSaveDraft, onDataChange }: SchoolAuthorizedStepProps) {
  const {
    register,
    handleSubmit,
    control,
    watch,
    setValue,
    reset,
    formState: { errors, isValid }
  } = useForm<SchoolAuthorized>({
    resolver: zodResolver(SchoolAuthorizedSchema),
    defaultValues: {
      serie: '',
      anoLetivo: new Date().getFullYear().toString(),
      authorizedPersons: data?.authorizedPersons || [
        {
          nome: '',
          parentesco: '',
          rg: '',
          telefone: ''
        }
      ]
    }
  })

  const { fields, append, remove } = useFieldArray({
    control,
    name: 'authorizedPersons'
  })

  const watchedValues = watch()

  // Atualizar valores do formulário quando os dados mudam
  useEffect(() => {
    if (data) {
      reset({
        serie: data.serie || '',
        anoLetivo: data.anoLetivo || new Date().getFullYear().toString(),
        authorizedPersons: data.authorizedPersons || [
          {
            nome: '',
            parentesco: '',
            rg: '',
            telefone: ''
          }
        ]
      })
    }
  }, [data, reset])

  // Notificar mudanças nos dados
  useEffect(() => {
    if (onDataChange) {
      onDataChange(watchedValues)
    }
  }, [watchedValues, onDataChange])

  const handleFormSubmit = (formData: SchoolAuthorized) => {
    onSubmit(formData)
  }

  const handleSaveDraft = () => {
    if (onSaveDraft) {
      onSaveDraft(watchedValues)
    }
  }

  const addAuthorizedPerson = () => {
    if (fields.length < 2) {
      append({
        nome: '',
        parentesco: '',
        rg: '',
        telefone: ''
      })
    }
  }

  const removeAuthorizedPerson = (index: number) => {
    if (fields.length > 1) {
      remove(index)
    }
  }

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6">
      {/* Informações Escolares */}
      <Card>
        <CardHeader title="Informações Escolares" />
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField
              label="Série"
              name="serie"
              required
              error={errors.serie?.message}
            >
              <Select
                {...register('serie')}
                options={SERIE_OPTIONS}
                placeholder="Selecione a série"
                icon={<GraduationCap className="h-4 w-4 text-gray-400" />}
                error={errors.serie?.message}
              />
            </FormField>

            <FormField
              label="Ano Letivo"
              name="anoLetivo"
              required
              error={errors.anoLetivo?.message}
            >
              <Select
                {...register('anoLetivo')}
                options={ANO_LETIVO_OPTIONS}
                placeholder="Selecione o ano letivo"
                error={errors.anoLetivo?.message}
              />
            </FormField>
          </div>
        </CardContent>
      </Card>

      {/* Pessoas Autorizadas */}
      <Card>
        <CardHeader 
          title="Pessoas Autorizadas" 
          subtitle="Informe pessoas autorizadas a buscar a criança (máximo 2)"
        />
        <CardContent className="space-y-6">
          {fields.map((field, index) => (
            <div key={field.id} className="border border-gray-200 rounded-lg p-4 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-medium text-gray-900">
                  Pessoa Autorizada {index + 1}
                </h3>
                {fields.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeAuthorizedPerson(index)}
                    className="text-red-600 hover:text-red-800 p-1"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  label="Nome Completo"
                  name={`authorizedPersons.${index}.nome`}
                  required
                  error={errors.authorizedPersons?.[index]?.nome?.message}
                >
                  <Input
                    {...register(`authorizedPersons.${index}.nome`)}
                    placeholder="Digite o nome completo"
                    icon={<User className="h-4 w-4 text-gray-400" />}
                    error={errors.authorizedPersons?.[index]?.nome?.message}
                  />
                </FormField>

                <FormField
                  label="Parentesco"
                  name={`authorizedPersons.${index}.parentesco`}
                  required
                  error={errors.authorizedPersons?.[index]?.parentesco?.message}
                >
                  <Select
                    {...register(`authorizedPersons.${index}.parentesco`)}
                    options={PARENTESCO_AUTORIZADO_OPTIONS}
                    placeholder="Selecione o parentesco"
                    error={errors.authorizedPersons?.[index]?.parentesco?.message}
                  />
                </FormField>

                <FormField
                  label="RG"
                  name={`authorizedPersons.${index}.rg`}
                  error={errors.authorizedPersons?.[index]?.rg?.message}
                >
                  <Input
                    {...register(`authorizedPersons.${index}.rg`)}
                    placeholder="Digite o número do RG"
                    icon={<FileText className="h-4 w-4 text-gray-400" />}
                    error={errors.authorizedPersons?.[index]?.rg?.message}
                  />
                </FormField>

                <FormField
                  label="Telefone"
                  name={`authorizedPersons.${index}.telefone`}
                  error={errors.authorizedPersons?.[index]?.telefone?.message}
                >
                  <Input
                    {...register(`authorizedPersons.${index}.telefone`)}
                    placeholder="(00) 00000-0000"
                    icon={<Phone className="h-4 w-4 text-gray-400" />}
                    error={errors.authorizedPersons?.[index]?.telefone?.message}
                    onChange={(e) => {
                      const formatted = formatPhone(e.target.value)
                      e.target.value = formatted
                    }}
                  />
                </FormField>
              </div>
            </div>
          ))}

          {fields.length < 2 && (
            <button
              type="button"
              onClick={addAuthorizedPerson}
              className="flex items-center space-x-2 px-4 py-2 text-sm font-medium text-primary-600 bg-primary-50 border border-primary-200 rounded-md hover:bg-primary-100 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2"
            >
              <Plus className="h-4 w-4" />
              <span>Adicionar Pessoa Autorizada</span>
            </button>
          )}
        </CardContent>
      </Card>

    </form>
  )
}
