'use client'

import React, { useState, useEffect } from 'react'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { FormField } from './FormField'
import { AddressDocuments } from '@/lib/enrollment-schemas'
import { formatPhone } from '@/lib/enrollment-utils'

interface AddressDocumentsStepProps {
  data?: Partial<AddressDocuments>
  onSubmit: (data: AddressDocuments) => void
  onSaveDraft?: () => Promise<void>
  onDataChange?: (data: Partial<AddressDocuments>) => void
}

export function AddressDocumentsStep({
  data = {},
  onSubmit,
  onSaveDraft,
  onDataChange
}: AddressDocumentsStepProps) {
  const [formData, setFormData] = useState<Partial<AddressDocuments>>({
    logradouro: '',
    numero: '',
    pontoReferencia: '',
    bairro: '',
    municipio: '',
    cep: '',
    uf: '',
    telefoneResidencial: '',
    telefoneContato: '',
    certidaoNascimento: '',
    municipioNascimento: '',
    municipioRegistro: '',
    cartorioRegistro: '',
    cpfCrianca: '',
    rgCrianca: '',
    dataEmissaoRg: undefined,
    orgaoEmissor: '',
    ...data
  })

  const [errors, setErrors] = useState<Record<string, string>>({})

  useEffect(() => {
    if (onDataChange) {
      onDataChange(formData)
    }
  }, [formData, onDataChange])

  const handleInputChange = (field: keyof AddressDocuments, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
    
    // Limpar erro do campo quando o usuário começar a digitar
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: ''
      }))
    }
  }

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {}

    if (!formData.logradouro?.trim()) {
      newErrors.logradouro = 'Logradouro é obrigatório'
    }

    if (!formData.numero?.trim()) {
      newErrors.numero = 'Número é obrigatório'
    }

    if (!formData.bairro?.trim()) {
      newErrors.bairro = 'Bairro é obrigatório'
    }

    if (!formData.municipio?.trim()) {
      newErrors.municipio = 'Município é obrigatório'
    }

    if (!formData.cep?.trim()) {
      newErrors.cep = 'CEP é obrigatório'
    } else if (!/^\d{5}-?\d{3}$/.test(formData.cep.replace(/\D/g, ''))) {
      newErrors.cep = 'CEP deve ter formato válido (00000-000)'
    }

    if (!formData.uf?.trim()) {
      newErrors.uf = 'UF é obrigatória'
    }

    if (!formData.telefoneResidencial?.trim() && !formData.telefoneContato?.trim()) {
      newErrors.telefoneResidencial = 'Pelo menos um telefone é obrigatório'
      newErrors.telefoneContato = 'Pelo menos um telefone é obrigatório'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    if (validateForm()) {
      onSubmit(formData as AddressDocuments)
    }
  }

  const formatCEP = (value: string) => {
    const numbers = value.replace(/\D/g, '')
    if (numbers.length <= 5) {
      return numbers
    }
    return `${numbers.slice(0, 5)}-${numbers.slice(5, 8)}`
  }


  return (
    <Card className="p-6">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Endereço & Documentos</h2>
        <p className="text-gray-600">
          Informe o endereço residencial da criança e dados de contato
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Endereço */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="md:col-span-2">
            <FormField
              label="Logradouro *"
              error={errors.logradouro}
              name="logradouro"
            >
              <Input
                value={formData.logradouro || ''}
                onChange={(e) => handleInputChange('logradouro', e.target.value)}
                placeholder="Rua, Avenida, etc."
                className={errors.logradouro ? 'border-red-500' : ''}
              />
            </FormField>
          </div>
          
          <FormField
            label="Número *"
            error={errors.numero}
            name="numero"
          >
            <Input
              value={formData.numero || ''}
              onChange={(e) => handleInputChange('numero', e.target.value)}
              placeholder="123"
              className={errors.numero ? 'border-red-500' : ''}
            />
          </FormField>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            label="Ponto de Referência"
            name="pontoReferencia"
          >
            <Input
              value={formData.pontoReferencia || ''}
              onChange={(e) => handleInputChange('pontoReferencia', e.target.value)}
              placeholder="Próximo ao shopping, etc."
            />
          </FormField>

          <FormField
            label="Bairro *"
            error={errors.bairro}
            name="bairro"
          >
            <Input
              value={formData.bairro || ''}
              onChange={(e) => handleInputChange('bairro', e.target.value)}
              placeholder="Nome do bairro"
              className={errors.bairro ? 'border-red-500' : ''}
            />
          </FormField>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <FormField
            label="Município *"
            error={errors.municipio}
            name="municipio"
          >
            <Input
              value={formData.municipio || ''}
              onChange={(e) => handleInputChange('municipio', e.target.value)}
              placeholder="Nome da cidade"
              className={errors.municipio ? 'border-red-500' : ''}
            />
          </FormField>

          <FormField
            label="CEP *"
            error={errors.cep}
            name="cep"
          >
            <Input
              value={formData.cep || ''}
              onChange={(e) => handleInputChange('cep', formatCEP(e.target.value))}
              placeholder="00000-000"
              maxLength={9}
              className={errors.cep ? 'border-red-500' : ''}
            />
          </FormField>

          <FormField
            label="UF *"
            error={errors.uf}
            name="uf"
          >
            <Input
              value={formData.uf || ''}
              onChange={(e) => handleInputChange('uf', e.target.value.toUpperCase())}
              placeholder="SP"
              maxLength={2}
              className={errors.uf ? 'border-red-500' : ''}
            />
          </FormField>
        </div>

        {/* Contatos */}
        <div className="border-t pt-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Dados de Contato</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField
              label="Telefone Residencial"
              error={errors.telefoneResidencial}
              name="telefoneResidencial"
            >
              <Input
                value={formData.telefoneResidencial || ''}
                onChange={(e) => {
                  const formatted = formatPhone(e.target.value)
                  handleInputChange('telefoneResidencial', formatted)
                }}
                placeholder="(11) 1234-5678"
                maxLength={15}
                className={errors.telefoneResidencial ? 'border-red-500' : ''}
              />
            </FormField>

            <FormField
              label="Telefone de Contato"
              error={errors.telefoneContato}
              name="telefoneContato"
            >
              <Input
                value={formData.telefoneContato || ''}
                onChange={(e) => {
                  const formatted = formatPhone(e.target.value)
                  handleInputChange('telefoneContato', formatted)
                }}
                placeholder="(11) 99999-9999"
                maxLength={15}
                className={errors.telefoneContato ? 'border-red-500' : ''}
              />
            </FormField>
          </div>
        </div>

        {/* Botões */}
        <div className="flex justify-between pt-6 border-t">
          <div className="flex gap-3">
            {onSaveDraft && (
              <Button
                type="button"
                variant="outline"
                onClick={onSaveDraft}
              >
                Salvar Rascunho
              </Button>
            )}
          </div>
          
          <Button type="submit">
            Continuar
          </Button>
        </div>
      </form>
    </Card>
  )
}
