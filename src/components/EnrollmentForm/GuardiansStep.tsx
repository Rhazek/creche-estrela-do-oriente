'use client'

import React, { useState, useEffect } from 'react'
import { useForm, useFieldArray } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Card, CardContent, CardHeader } from '@/components/ui/Card'
import { FormField, Input, Select } from './FormField'
import { GuardiansSchema, type Guardians, type Guardian } from '@/lib/enrollment-schemas'
import { formatCPF, formatPhone } from '@/lib/enrollment-utils'
import { User, Phone, CreditCard, MapPin, Plus, Trash2 } from 'lucide-react'

interface GuardiansStepProps {
  data?: Partial<Guardians>
  onSubmit: (data: Guardians) => void
  onSaveDraft?: (data: Partial<Guardians>) => void
  onDataChange?: (data: Partial<Guardians>) => void
}

const TIPO_RESPONSAVEL_OPTIONS = [
  { value: 'Mãe', label: 'Mãe' },
  { value: 'Pai', label: 'Pai' },
  { value: 'Outro', label: 'Outro' }
]

export function GuardiansStep({ data, onSubmit, onSaveDraft, onDataChange }: GuardiansStepProps) {
  const {
    register,
    handleSubmit,
    control,
    watch,
    setValue,
    reset,
    formState: { errors, isValid }
  } = useForm<Guardians>({
    resolver: zodResolver(GuardiansSchema),
    defaultValues: {
      guardians: data?.guardians || [
        {
          tipoResponsavel: 'Mãe',
          nome: '',
          cpf: '',
          rg: '',
          celular: '',
          outroContato: '',
          localTrabalho: ''
        }
      ]
    }
  })

  const { fields, append, remove } = useFieldArray({
    control,
    name: 'guardians'
  })

  const watchedValues = watch()

  // Atualizar valores do formulário quando os dados mudam
  useEffect(() => {
    if (data) {
      reset({
        guardians: data.guardians || [
          {
            tipoResponsavel: 'Mãe',
            nome: '',
            cpf: '',
            rg: '',
            celular: '',
            outroContato: '',
            localTrabalho: ''
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

  const handleFormSubmit = (formData: Guardians) => {
    onSubmit(formData)
  }

  const handleSaveDraft = () => {
    if (onSaveDraft) {
      onSaveDraft(watchedValues)
    }
  }

  const addGuardian = () => {
    if (fields.length < 3) {
      append({
        tipoResponsavel: 'Outro',
        nome: '',
        cpf: '',
        rg: '',
        celular: '',
        outroContato: '',
        localTrabalho: ''
      })
    }
  }

  const removeGuardian = (index: number) => {
    if (fields.length > 1) {
      remove(index)
    }
  }

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6">
      <Card>
        <CardHeader 
          title="Responsáveis pela Criança" 
          subtitle="Informe os dados dos responsáveis (máximo 3)"
        />
        <CardContent className="space-y-6">
          {fields.map((field, index) => (
            <div key={field.id} className="border border-gray-200 rounded-lg p-4 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-medium text-gray-900">
                  Responsável {index + 1}
                </h3>
                {fields.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeGuardian(index)}
                    className="text-red-600 hover:text-red-800 p-1"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  label="Tipo de Responsável"
                  name={`guardians.${index}.tipoResponsavel`}
                  required
                  error={errors.guardians?.[index]?.tipoResponsavel?.message}
                >
                  <Select
                    {...register(`guardians.${index}.tipoResponsavel`)}
                    options={TIPO_RESPONSAVEL_OPTIONS}
                    placeholder="Selecione o tipo"
                    error={errors.guardians?.[index]?.tipoResponsavel?.message}
                  />
                </FormField>

                <FormField
                  label="Nome Completo"
                  name={`guardians.${index}.nome`}
                  required
                  error={errors.guardians?.[index]?.nome?.message}
                >
                  <Input
                    {...register(`guardians.${index}.nome`)}
                    placeholder="Digite o nome completo"
                    icon={<User className="h-4 w-4 text-gray-400" />}
                    error={errors.guardians?.[index]?.nome?.message}
                  />
                </FormField>

                <FormField
                  label="CPF"
                  name={`guardians.${index}.cpf`}
                  error={errors.guardians?.[index]?.cpf?.message}
                  helper="Opcional - deixe em branco se não possuir"
                >
                  <Input
                    {...register(`guardians.${index}.cpf`)}
                    placeholder="000.000.000-00"
                    icon={<CreditCard className="h-4 w-4 text-gray-400" />}
                    error={errors.guardians?.[index]?.cpf?.message}
                    onChange={(e) => {
                      const formatted = formatCPF(e.target.value)
                      e.target.value = formatted
                    }}
                  />
                </FormField>

                <FormField
                  label="RG"
                  name={`guardians.${index}.rg`}
                  error={errors.guardians?.[index]?.rg?.message}
                >
                  <Input
                    {...register(`guardians.${index}.rg`)}
                    placeholder="Digite o número do RG"
                    error={errors.guardians?.[index]?.rg?.message}
                  />
                </FormField>

                <FormField
                  label="Celular"
                  name={`guardians.${index}.celular`}
                  error={errors.guardians?.[index]?.celular?.message}
                >
                  <Input
                    {...register(`guardians.${index}.celular`)}
                    placeholder="(00) 00000-0000"
                    icon={<Phone className="h-4 w-4 text-gray-400" />}
                    error={errors.guardians?.[index]?.celular?.message}
                    onChange={(e) => {
                      const formatted = formatPhone(e.target.value)
                      e.target.value = formatted
                    }}
                  />
                </FormField>

                <FormField
                  label="Outro Contato"
                  name={`guardians.${index}.outroContato`}
                  error={errors.guardians?.[index]?.outroContato?.message}
                  helper="Telefone alternativo ou WhatsApp"
                >
                  <Input
                    {...register(`guardians.${index}.outroContato`)}
                    placeholder="(00) 00000-0000"
                    icon={<Phone className="h-4 w-4 text-gray-400" />}
                    error={errors.guardians?.[index]?.outroContato?.message}
                    onChange={(e) => {
                      const formatted = formatPhone(e.target.value)
                      e.target.value = formatted
                    }}
                  />
                </FormField>

                <FormField
                  label="Local de Trabalho"
                  name={`guardians.${index}.localTrabalho`}
                  error={errors.guardians?.[index]?.localTrabalho?.message}
                  className="md:col-span-2"
                >
                  <Input
                    {...register(`guardians.${index}.localTrabalho`)}
                    placeholder="Digite o local de trabalho"
                    icon={<MapPin className="h-4 w-4 text-gray-400" />}
                    error={errors.guardians?.[index]?.localTrabalho?.message}
                  />
                </FormField>
              </div>
            </div>
          ))}

          {fields.length < 3 && (
            <button
              type="button"
              onClick={addGuardian}
              className="flex items-center space-x-2 px-4 py-2 text-sm font-medium text-primary-600 bg-primary-50 border border-primary-200 rounded-md hover:bg-primary-100 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2"
            >
              <Plus className="h-4 w-4" />
              <span>Adicionar Responsável</span>
            </button>
          )}
        </CardContent>
      </Card>

    </form>
  )
}
