'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { UpdatePreEnrollmentSchema, UpdatePreEnrollment, PreEnrollment } from '@/lib/pre-enrollment-schemas'
import { PreEnrollmentService } from '@/lib/pre-enrollment-service'
import { RACA_OPTIONS, RENDA_FAMILIAR_OPTIONS, SEXO_OPTIONS, TIPO_AUXILIO_OPTIONS } from '@/lib/pre-enrollment-schemas'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Select } from '@/components/ui/Select'
import { Textarea } from '@/components/ui/Textarea'
import { Checkbox } from '@/components/ui/Checkbox'
import { 
  ArrowLeft, 
  User,
  Phone,
  MapPin,
  DollarSign,
  AlertCircle
} from 'lucide-react'
import toast from 'react-hot-toast'
import { useAuth } from '@/hooks/useAuth'
import { formatPhone, formatDateForInput } from '@/lib/enrollment-utils'

interface EditPreEnrollmentPageProps {
    params: {
    id: string
  }
}

export default function EditPreEnrollmentPage({ params }: EditPreEnrollmentPageProps) {
  const router = useRouter()
  const { user } = useAuth()
  const [loading, setLoading] = useState(false)
  const [preEnrollment, setPreEnrollment] = useState<PreEnrollment | null>(null)

  const {
    register,
    handleSubmit,
    watch,
    reset,
    formState: { errors }
  } = useForm<UpdatePreEnrollment>({
    resolver: zodResolver(UpdatePreEnrollmentSchema)
  })

  const necessidadesEspeciais = watch('necessidadesEspeciais')
  const recebeAuxilioGoverno = watch('recebeAuxilioGoverno')

  // Carregar dados da pré-matrícula
  useEffect(() => {
    const loadPreEnrollment = async () => {
      try {
        const data = await PreEnrollmentService.getPreEnrollment(params.id)
        if (data) {
          setPreEnrollment(data)
          // Normalizar dataNascimento para Date antes de resetar o form
          let birthDate: Date
          const raw = data.dataNascimento as any
          if (!raw) {
            birthDate = new Date()
          } else if (typeof raw === 'string') {
            birthDate = new Date(raw)
          } else if (raw && typeof raw.toDate === 'function') {
            birthDate = raw.toDate()
          } else if (raw instanceof Date) {
            birthDate = raw
          } else {
            birthDate = new Date(raw)
          }

          reset({
            nomeCrianca: data.nomeCrianca,
            raca: data.raca,
            sexo: data.sexo,
            // manter como Date para o schema; ChildInfoStep formatará para input
            dataNascimento: birthDate,
            responsavelNome: data.responsavelNome,
            responsavelContato: data.responsavelContato,
            endereco: data.endereco,
            necessidadesEspeciais: data.necessidadesEspeciais,
            descricaoNecessidade: data.descricaoNecessidade,
            rendaFamiliar: data.rendaFamiliar,
            recebeAuxilioGoverno: data.recebeAuxilioGoverno || false,
            tipoAuxilio: data.tipoAuxilio,
            numeroNIS: data.numeroNIS
          })
        } else {
          toast.error('Pré-matrícula não encontrada')
          router.push('/pre-matriculas')
        }
      } catch (error) {
        toast.error('Erro ao carregar pré-matrícula')
        console.error('Erro:', error)
        router.push('/pre-matriculas')
      }
    }

    loadPreEnrollment()
  }, [params.id, reset, router])

  const onSubmit = async (data: UpdatePreEnrollment) => {
    if (!preEnrollment || !user?.uid) {
      toast.error('Usuário não autenticado')
      return
    }

    try {
      setLoading(true)
      await PreEnrollmentService.updatePreEnrollment(preEnrollment.id, data, user.uid)
      toast.success('Pré-matrícula atualizada com sucesso!')
      router.push('/pre-matriculas')
    } catch (error) {
      toast.error('Erro ao atualizar pré-matrícula')
      console.error('Erro:', error)
    } finally {
      setLoading(false)
    }
  }

  if (!preEnrollment) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Carregando pré-matrícula...</p>
        </div>
      </div>
    )
  }

  if (preEnrollment.status !== 'analise') {
    return (
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="text-center py-12">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Pré-matrícula não pode ser editada</h1>
          <p className="text-gray-600 mb-6">
            Esta pré-matrícula já foi avaliada e não pode mais ser editada.
          </p>
          <Button onClick={() => router.push('/pre-matriculas')}>
            Voltar para Lista
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Cabeçalho */}
      <div className="flex items-center gap-4">
        <Button
          variant="outline"
          size="sm"
          onClick={() => router.back()}
        >
          <ArrowLeft className="w-4 h-4" />
        </Button>
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Editar Pré-Matrícula</h1>
          <p className="text-gray-600 mt-1">Editando: {preEnrollment.nomeCrianca}</p>
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* Informações Básicas */}
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <User className="w-5 h-5" />
            Informações Básicas
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Nome da Criança *
              </label>
              <Input
                {...register('nomeCrianca')}
                placeholder="Digite o nome completo"
                error={errors.nomeCrianca?.message}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Raça/Cor *
              </label>
              <Select
                {...register('raca')}
                error={errors.raca?.message}
              >
                <option value="">Selecione</option>
                {RACA_OPTIONS.map(option => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </Select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Sexo *
              </label>
              <Select
                {...register('sexo')}
                error={errors.sexo?.message}
              >
                <option value="">Selecione</option>
                {SEXO_OPTIONS.map(option => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </Select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Data de Nascimento *
              </label>
              <Input
                {...register('dataNascimento', { valueAsDate: true })}
                type="date"
                error={errors.dataNascimento?.message}
              />
            </div>
          </div>
        </Card>

        {/* Responsável */}
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <Phone className="w-5 h-5" />
            Responsável
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Nome do Responsável *
              </label>
              <Input
                {...register('responsavelNome')}
                placeholder="Digite o nome completo"
                error={errors.responsavelNome?.message}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Contato (Telefone/WhatsApp) *
              </label>
              <Input
                {...register('responsavelContato')}
                placeholder="(11) 99999-9999"
                error={errors.responsavelContato?.message}
                onChange={(e) => {
                  const formatted = formatPhone(e.target.value)
                  e.target.value = formatted
                  register('responsavelContato').onChange(e)
                }}
              />
            </div>
          </div>
        </Card>

        {/* Endereço */}
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <MapPin className="w-5 h-5" />
            Endereço
          </h3>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Endereço Completo *
            </label>
            <Textarea
              {...register('endereco')}
              placeholder="Rua, número, bairro, cidade, estado"
              rows={3}
              error={errors.endereco?.message}
            />
          </div>
        </Card>

        {/* Necessidades Especiais */}
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <AlertCircle className="w-5 h-5" />
            Necessidades Especiais
          </h3>
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <Checkbox
                {...register('necessidadesEspeciais')}
                label="A criança possui necessidades especiais"
              />
            </div>

            {necessidadesEspeciais && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Descreva as necessidades especiais
                </label>
                <Textarea
                  {...register('descricaoNecessidade')}
                  placeholder="Descreva as necessidades especiais da criança..."
                  rows={3}
                  error={errors.descricaoNecessidade?.message}
                />
              </div>
            )}
          </div>
        </Card>

        {/* Renda Familiar */}
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <DollarSign className="w-5 h-5" />
            Renda Familiar
          </h3>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Faixa de Renda Familiar *
            </label>
            <Select
              {...register('rendaFamiliar')}
              error={errors.rendaFamiliar?.message}
            >
              <option value="">Selecione</option>
              {RENDA_FAMILIAR_OPTIONS.map(option => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </Select>
          </div>
        </Card>

        {/* Auxílio do Governo */}
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <DollarSign className="w-5 h-5" />
            Auxílio do Governo
          </h3>
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <Checkbox
                {...register('recebeAuxilioGoverno')}
                label="Recebe auxílio do governo"
              />
            </div>

            {recebeAuxilioGoverno && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Tipo de Auxílio
                  </label>
                  <Select
                    {...register('tipoAuxilio')}
                    error={errors.tipoAuxilio?.message}
                  >
                    <option value="">Selecione o tipo de auxílio (opcional)</option>
                    {TIPO_AUXILIO_OPTIONS.map(option => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </Select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Número NIS
                  </label>
                  <Input
                    {...register('numeroNIS')}
                    placeholder="Digite o número NIS (opcional)"
                    error={errors.numeroNIS?.message}
                  />
                </div>
              </div>
            )}
          </div>
        </Card>

        {/* Botões */}
        <div className="flex items-center justify-end gap-4">
          <Button
            type="button"
            variant="outline"
            onClick={() => router.back()}
            disabled={loading}
          >
            Cancelar
          </Button>
          <Button
            type="submit"
            loading={loading}
          >
            Salvar Alterações
          </Button>
        </div>
      </form>
    </div>
  )
}