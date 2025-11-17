'use client'

import React, { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Card, CardContent, CardHeader } from '@/components/ui/Card'
import { FormField, Input, Select, RadioGroup, Checkbox } from './FormField'
import { HousingAssetsSchema, type HousingAssets } from '@/lib/enrollment-schemas'
import { formatCurrency, parseCurrency } from '@/lib/enrollment-utils'
import { 
  Home, 
  DollarSign, 
  Users, 
  Droplets, 
  Zap, 
  Tv, 
  Monitor, 
  Phone, 
  Car, 
  Bike,
  Wind,
  WashingMachine,
  Microwave,
  Refrigerator,
  Flame,
  Radio,
  Tablet
} from 'lucide-react'

interface HousingAssetsStepProps {
  data?: Partial<HousingAssets>
  onSubmit: (data: HousingAssets) => void
  onSaveDraft?: (data: Partial<HousingAssets>) => void
  onDataChange?: (data: Partial<HousingAssets>) => void
}

const TIPO_OCUPACAO_OPTIONS = [
  { value: 'Casa Própria', label: 'Casa Própria' },
  { value: 'Cedida', label: 'Cedida' },
  { value: 'Alugada', label: 'Alugada' }
]

const TIPO_PISO_OPTIONS = [
  { value: 'Cimento', label: 'Cimento' },
  { value: 'Cerâmica', label: 'Cerâmica' },
  { value: 'Madeira', label: 'Madeira' },
  { value: 'Terra', label: 'Terra' },
  { value: 'Outro', label: 'Outro' }
]

const TIPO_MORADIA_OPTIONS = [
  { value: 'Casa', label: 'Casa' },
  { value: 'Apartamento', label: 'Apartamento' },
  { value: 'Barraco', label: 'Barraco' },
  { value: 'Cômodo', label: 'Cômodo' },
  { value: 'Outro', label: 'Outro' }
]

const TIPO_COBERTURA_OPTIONS = [
  { value: 'Telha', label: 'Telha' },
  { value: 'Laje', label: 'Laje' },
  { value: 'Zinco', label: 'Zinco' },
  { value: 'Palha', label: 'Palha' },
  { value: 'Outro', label: 'Outro' }
]

const BENS_OPTIONS = [
  { key: 'tv', label: 'TV', icon: <Tv className="h-6 w-6" /> },
  { key: 'dvd', label: 'DVD', icon: <Monitor className="h-6 w-6" /> },
  { key: 'radio', label: 'Rádio', icon: <Radio className="h-6 w-6" /> },
  { key: 'computador', label: 'Computador', icon: <Monitor className="h-6 w-6" /> },
  { key: 'notebook', label: 'Notebook', icon: <Monitor className="h-6 w-6" /> },
  { key: 'telefoneFixo', label: 'Telefone Fixo', icon: <Phone className="h-6 w-6" /> },
  { key: 'telefoneCelular', label: 'Celular', icon: <Phone className="h-6 w-6" /> },
  { key: 'tablet', label: 'Tablet', icon: <Tablet className="h-6 w-6" /> },
  { key: 'internet', label: 'Internet', icon: <Monitor className="h-6 w-6" /> },
  { key: 'tvAssinatura', label: 'TV Assinatura', icon: <Tv className="h-6 w-6" /> },
  { key: 'fogao', label: 'Fogão', icon: <Flame className="h-6 w-6" /> },
  { key: 'geladeira', label: 'Geladeira', icon: <Refrigerator className="h-6 w-6" /> },
  { key: 'freezer', label: 'Freezer', icon: <Refrigerator className="h-6 w-6" /> },
  { key: 'microondas', label: 'Micro-ondas', icon: <Microwave className="h-6 w-6" /> },
  { key: 'maquinaLavar', label: 'Máquina de Lavar', icon: <WashingMachine className="h-6 w-6" /> },
  { key: 'arCondicionado', label: 'Ar Condicionado', icon: <Wind className="h-6 w-6" /> },
  { key: 'bicicleta', label: 'Bicicleta', icon: <Bike className="h-6 w-6" /> },
  { key: 'moto', label: 'Moto', icon: <Bike className="h-6 w-6" /> },
  { key: 'automovel', label: 'Automóvel', icon: <Car className="h-6 w-6" /> }
]

export function HousingAssetsStep({ data, onSubmit, onSaveDraft, onDataChange }: HousingAssetsStepProps) {
  const {
    register,
    handleSubmit,
    watch,
    setValue,
    reset,
    formState: { errors, isValid }
  } = useForm({
    resolver: zodResolver(HousingAssetsSchema),
    defaultValues: {
      tipoOcupacao: 'Casa Própria',
      valorAluguel: undefined,
      numeroComodos: 1,
      tipoPiso: '',
      tipoMoradia: '',
      tipoCobertura: '',
      saneamentoFossa: false,
      saneamentoCifon: false,
      energiaEletrica: false,
      aguaEncanada: false,
      tv: false,
      tvQuantidade: 0,
      dvd: false,
      dvdQuantidade: 0,
      radio: false,
      radioQuantidade: 0,
      computador: false,
      computadorQuantidade: 0,
      notebook: false,
      notebookQuantidade: 0,
      telefoneFixo: false,
      telefoneFixoQuantidade: 0,
      telefoneCelular: false,
      telefoneCelularQuantidade: 0,
      tablet: false,
      tabletQuantidade: 0,
      internet: false,
      tvAssinatura: false,
      fogao: false,
      fogaoQuantidade: 0,
      geladeira: false,
      geladeiraQuantidade: 0,
      freezer: false,
      freezerQuantidade: 0,
      microondas: false,
      microondasQuantidade: 0,
      maquinaLavar: false,
      maquinaLavarQuantidade: 0,
      arCondicionado: false,
      arCondicionadoQuantidade: 0,
      bicicleta: false,
      bicicletaQuantidade: 0,
      moto: false,
      motoQuantidade: 0,
      automovel: false,
      automovelQuantidade: 0,
      ...data
    }
  })

  const watchedValues = watch()

  // Atualizar valores do formulário quando os dados mudam
  useEffect(() => {
    if (data) {
      reset({
        tipoOcupacao: data.tipoOcupacao || 'Casa Própria',
        valorAluguel: data.valorAluguel || undefined,
        numeroComodos: data.numeroComodos || 1,
        tipoPiso: data.tipoPiso || '',
        tipoMoradia: data.tipoMoradia || '',
        tipoCobertura: data.tipoCobertura || '',
        saneamentoFossa: data.saneamentoFossa || false,
        saneamentoCifon: data.saneamentoCifon || false,
        energiaEletrica: data.energiaEletrica || false,
        aguaEncanada: data.aguaEncanada || false,
        tv: data.tv || false,
        tvQuantidade: data.tvQuantidade || 0,
        dvd: data.dvd || false,
        dvdQuantidade: data.dvdQuantidade || 0,
        radio: data.radio || false,
        radioQuantidade: data.radioQuantidade || 0,
        computador: data.computador || false,
        computadorQuantidade: data.computadorQuantidade || 0,
        notebook: data.notebook || false,
        notebookQuantidade: data.notebookQuantidade || 0,
        telefoneFixo: data.telefoneFixo || false,
        telefoneFixoQuantidade: data.telefoneFixoQuantidade || 0,
        telefoneCelular: data.telefoneCelular || false,
        telefoneCelularQuantidade: data.telefoneCelularQuantidade || 0,
        tablet: data.tablet || false,
        tabletQuantidade: data.tabletQuantidade || 0,
        internet: data.internet || false,
        tvAssinatura: data.tvAssinatura || false,
        fogao: data.fogao || false,
        fogaoQuantidade: data.fogaoQuantidade || 0,
        geladeira: data.geladeira || false,
        geladeiraQuantidade: data.geladeiraQuantidade || 0,
        freezer: data.freezer || false,
        freezerQuantidade: data.freezerQuantidade || 0,
        microondas: data.microondas || false,
        microondasQuantidade: data.microondasQuantidade || 0,
        maquinaLavar: data.maquinaLavar || false,
        maquinaLavarQuantidade: data.maquinaLavarQuantidade || 0,
        arCondicionado: data.arCondicionado || false,
        arCondicionadoQuantidade: data.arCondicionadoQuantidade || 0,
        bicicleta: data.bicicleta || false,
        bicicletaQuantidade: data.bicicletaQuantidade || 0,
        moto: data.moto || false,
        motoQuantidade: data.motoQuantidade || 0,
        automovel: data.automovel || false,
        automovelQuantidade: data.automovelQuantidade || 0
      })
    }
  }, [data, reset])

  // Notificar mudanças nos dados
  useEffect(() => {
    if (onDataChange) {
      onDataChange(watchedValues)
    }
  }, [watchedValues, onDataChange])

  const handleFormSubmit = (formData: any) => {
    onSubmit(formData as HousingAssets)
  }

  const handleSaveDraft = () => {
    if (onSaveDraft) {
      onSaveDraft(watchedValues)
    }
  }

  const handleCurrencyChange = (field: keyof HousingAssets, value: string) => {
    const numericValue = parseCurrency(value)
    setValue(field, numericValue)
  }

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6">
      {/* Situação Habitacional */}
      <Card>
        <CardHeader title="Situação Habitacional" />
        <CardContent className="space-y-4">
          <FormField
            label="Tipo de Ocupação"
            name="tipoOcupacao"
            required
            error={errors.tipoOcupacao?.message}
          >
            <RadioGroup
              name="tipoOcupacao"
              options={TIPO_OCUPACAO_OPTIONS}
              value={watchedValues.tipoOcupacao}
              onChange={(value) => setValue('tipoOcupacao', value as any)}
              error={errors.tipoOcupacao?.message}
            />
          </FormField>

          {watchedValues.tipoOcupacao === 'Alugada' && (
            <FormField
              label="Valor do Aluguel"
              name="valorAluguel"
              required
              error={errors.valorAluguel?.message}
            >
              <Input
                {...register('valorAluguel', {
                  setValueAs: (value) => parseCurrency(value)
                })}
                placeholder="R$ 0,00"
                icon={<DollarSign className="h-4 w-4 text-gray-400" />}
                error={errors.valorAluguel?.message}
                onChange={(e) => {
                  const formatted = formatCurrency(parseCurrency(e.target.value))
                  e.target.value = formatted
                }}
              />
            </FormField>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField
              label="Número de Cômodos"
              name="numeroComodos"
              required
              error={errors.numeroComodos?.message}
            >
              <Input
                type="number"
                min="1"
                {...register('numeroComodos', {
                  setValueAs: (value) => parseInt(value) || 1
                })}
                placeholder="1"
                icon={<Home className="h-4 w-4 text-gray-400" />}
                error={errors.numeroComodos?.message}
              />
            </FormField>

            <FormField
              label="Tipo de Piso"
              name="tipoPiso"
              required
              error={errors.tipoPiso?.message}
            >
              <Select
                {...register('tipoPiso')}
                options={TIPO_PISO_OPTIONS}
                placeholder="Selecione o tipo de piso"
                error={errors.tipoPiso?.message}
              />
            </FormField>

            <FormField
              label="Tipo de Moradia"
              name="tipoMoradia"
              required
              error={errors.tipoMoradia?.message}
            >
              <Select
                {...register('tipoMoradia')}
                options={TIPO_MORADIA_OPTIONS}
                placeholder="Selecione o tipo de moradia"
                error={errors.tipoMoradia?.message}
              />
            </FormField>

            <FormField
              label="Tipo de Cobertura"
              name="tipoCobertura"
              required
              error={errors.tipoCobertura?.message}
            >
              <Select
                {...register('tipoCobertura')}
                options={TIPO_COBERTURA_OPTIONS}
                placeholder="Selecione o tipo de cobertura"
                error={errors.tipoCobertura?.message}
              />
            </FormField>
          </div>
        </CardContent>
      </Card>

      {/* Saneamento */}
      <Card>
        <CardHeader title="Saneamento Básico" />
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="flex items-center space-x-2">
              <Checkbox
                {...register('saneamentoFossa')}
                label="Fossa Séptica"
              />
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox
                {...register('saneamentoCifon')}
                label="Cifon"
              />
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox
                {...register('energiaEletrica')}
                label="Energia Elétrica"
              />
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox
                {...register('aguaEncanada')}
                label="Água Encanada"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Bens */}
      <Card>
        <CardHeader title="Bens da Família" />
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {BENS_OPTIONS.map((bem) => (
              <div key={bem.key} className="flex flex-col space-y-3 p-4 border rounded-lg">
                <div className="flex items-center space-x-3">
                  <Checkbox
                    {...register(bem.key as keyof HousingAssets)}
                    label=""
                  />
                  <div className="flex items-center space-x-2">
                    {bem.icon}
                    <span className="text-sm font-medium">{bem.label}</span>
                  </div>
                </div>
                
                {watchedValues[bem.key as keyof HousingAssets] && (
                  <div className="ml-6">
                    <Input
                      {...register(`${bem.key}Quantidade` as keyof HousingAssets, { valueAsNumber: true })}
                      type="number"
                      min="0"
                      placeholder="Quantidade"
                      className="w-full"
                    />
                  </div>
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

    </form>
  )
}
