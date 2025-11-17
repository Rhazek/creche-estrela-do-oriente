import { z } from 'zod'

// Schema para nova pré-matrícula
export const NewPreEnrollmentSchema = z.object({
  nomeCrianca: z.string().min(1, 'Nome da criança é obrigatório'),
  raca: z.enum(['Branca', 'Preta', 'Parda', 'Amarela', 'Indígena'], {
    message: 'Raça/cor é obrigatória'
  }),
  sexo: z.enum(['Masculino', 'Feminino'], {
    message: 'Sexo é obrigatório'
  }),
  dataNascimento: z.date({
    message: 'Data de nascimento é obrigatória'
  }),
  responsavelNome: z.string().min(1, 'Nome do responsável é obrigatório'),
  responsavelContato: z.string().min(1, 'Contato do responsável é obrigatório'),
  endereco: z.string().min(1, 'Endereço é obrigatório'),
  necessidadesEspeciais: z.boolean().default(false),
  descricaoNecessidade: z.string().optional(),
  rendaFamiliar: z.enum(['Até 1 SM', '1 a 2 SM', '2 a 3 SM', 'Acima de 3 SM'], {
    message: 'Renda familiar é obrigatória'
  }),
  recebeAuxilioGoverno: z.boolean().default(false),
  tipoAuxilio: z.enum(['Auxílio Brasil', 'Benefício de Prestação Continuada (BPC)', 'Bolsa Família', 'Auxílio-Gás', 'Programa de Erradicação do Trabalho Infantil (PETI)', 'Outro']).optional(),
  numeroNIS: z.string().optional().refine((nis) => {
    if (!nis) return true
    const cleanNis = nis.replace(/\D/g, '')
    return /^\d+$/.test(cleanNis) && cleanNis.length >= 10 && cleanNis.length <= 11
  }, 'NIS deve conter apenas números (10 ou 11 dígitos)')
})

// Schema para atualização de pré-matrícula
export const UpdatePreEnrollmentSchema = NewPreEnrollmentSchema.partial()

// Schema para decisão de aprovação/rejeição
export const DecisionSchema = z.object({
  status: z.enum(['aprovada', 'rejeitada']),
  motivoRejeicao: z.string().optional()
})

// Tipos TypeScript
export type NewPreEnrollment = z.infer<typeof NewPreEnrollmentSchema>
export type UpdatePreEnrollment = z.infer<typeof UpdatePreEnrollmentSchema>
export type PreEnrollmentDecision = z.infer<typeof DecisionSchema>

// Tipo para pré-matrícula completa no Firestore
export interface PreEnrollment {
  id: string
  nomeCrianca: string
  raca: 'Branca' | 'Preta' | 'Parda' | 'Amarela' | 'Indígena'
  sexo: 'Masculino' | 'Feminino'
  dataNascimento: string
  responsavelNome: string
  responsavelContato: string
  endereco: string
  necessidadesEspeciais: boolean
  descricaoNecessidade?: string
  rendaFamiliar: 'Até 1 SM' | '1 a 2 SM' | '2 a 3 SM' | 'Acima de 3 SM'
  recebeAuxilioGoverno: boolean
  tipoAuxilio?: 'Auxílio Brasil' | 'Benefício de Prestação Continuada (BPC)' | 'Bolsa Família' | 'Auxílio-Gás' | 'Programa de Erradicação do Trabalho Infantil (PETI)' | 'Outro'
  numeroNIS?: string
  status: 'analise' | 'aprovada' | 'rejeitada'
  criadoEm: string
  avaliadoPor?: string
  dataDecisao?: string
  motivoRejeicao?: string
}

// Tipo para filtros de busca
export interface PreEnrollmentFilters {
  nome?: string
  raca?: string
  rendaFamiliar?: string
  status?: string
}

// Tipo para estatísticas do dashboard
export interface PreEnrollmentStats {
  total: number
  emAnalise: number
  aprovadas: number
  rejeitadas: number
}

// Opções para selects
export const RACA_OPTIONS = [
  { value: 'Branca', label: 'Branca' },
  { value: 'Preta', label: 'Preta' },
  { value: 'Parda', label: 'Parda' },
  { value: 'Amarela', label: 'Amarela' },
  { value: 'Indígena', label: 'Indígena' }
] as const

export const RENDA_FAMILIAR_OPTIONS = [
  { value: 'Até 1 SM', label: 'Até 1 SM' },
  { value: '1 a 2 SM', label: '1 a 2 SM' },
  { value: '2 a 3 SM', label: '2 a 3 SM' },
  { value: 'Acima de 3 SM', label: 'Acima de 3 SM' }
] as const

export const SEXO_OPTIONS = [
  { value: 'Masculino', label: 'Masculino' },
  { value: 'Feminino', label: 'Feminino' }
] as const

export const TIPO_AUXILIO_OPTIONS = [
  { value: 'Auxílio Brasil', label: 'Auxílio Brasil' },
  { value: 'Benefício de Prestação Continuada (BPC)', label: 'Benefício de Prestação Continuada (BPC)' },
  { value: 'Bolsa Família', label: 'Bolsa Família' },
  { value: 'Auxílio-Gás', label: 'Auxílio-Gás' },
  { value: 'Programa de Erradicação do Trabalho Infantil (PETI)', label: 'Programa de Erradicação do Trabalho Infantil (PETI)' },
  { value: 'Outro', label: 'Outro' }
] as const

export const STATUS_OPTIONS = [
  { value: 'analise', label: 'Em Análise' },
  { value: 'aprovada', label: 'Aprovada' },
  { value: 'rejeitada', label: 'Rejeitada' }
] as const

// Função para calcular idade
export const calcularIdade = (dataNascimento: string): number => {
  if (!dataNascimento) return 0

  const hoje = new Date()
  const datePart = (typeof dataNascimento === 'string' ? dataNascimento.split('T')[0] : '')
  let nascimento: Date
  if (/^\d{4}-\d{2}-\d{2}$/.test(datePart)) {
    const [y, m, d] = datePart.split('-').map(Number)
    nascimento = new Date(y, m - 1, d)
  } else {
    nascimento = new Date(dataNascimento)
  }

  let idade = hoje.getFullYear() - nascimento.getFullYear()
  const mesAtual = hoje.getMonth()
  const mesNascimento = nascimento.getMonth()

  if (mesAtual < mesNascimento || (mesAtual === mesNascimento && hoje.getDate() < nascimento.getDate())) {
    idade--
  }

  return idade >= 0 ? idade : 0
}

// Função para formatar data
export const formatarData = (data: string): string => {
  if (!data) return ''
  const datePart = data.split('T')[0]
  if (/^\d{4}-\d{2}-\d{2}$/.test(datePart)) {
    const [y, m, d] = datePart.split('-').map(Number)
    return new Date(y, m - 1, d).toLocaleDateString('pt-BR')
  }

  try {
    return new Date(data).toLocaleDateString('pt-BR')
  } catch (e) {
    return String(data)
  }
}

// Função para formatar telefone
export const formatarTelefone = (telefone: string): string => {
  const cleaned = telefone.replace(/\D/g, '')
  if (cleaned.length === 11) {
    return cleaned.replace(/(\d{2})(\d{5})(\d{4})/, '($1) $2-$3')
  }
  if (cleaned.length === 10) {
    return cleaned.replace(/(\d{2})(\d{4})(\d{4})/, '($1) $2-$3')
  }
  return telefone
}
