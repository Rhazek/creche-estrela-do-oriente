import { z } from 'zod'

// Schema para filtros de matrícula
export const EnrollmentFiltersSchema = z.object({
  nome: z.string().optional(),
  raca: z.string().optional(),
  rendaPerCapita: z.string().optional(),
  status: z.string().optional(),
  anoLetivo: z.string().optional(),
  serie: z.string().optional()
})

// Tipos TypeScript
export type EnrollmentFilters = z.infer<typeof EnrollmentFiltersSchema>

// Status de matrícula
export type EnrollmentStatus = 'pendente_matricula' | 'confirmada' | 'cancelada'

// Interface para matrícula completa
export interface Enrollment {
  id: string
  // Dados da criança
  nomeCrianca: string
  raca: 'Branca' | 'Preta' | 'Parda' | 'Amarela' | 'Indígena'
  dataNascimento: string
  
  // Dados do responsável
  responsavelNome: string
  responsavelContato: string
  
  // Endereço
  endereco: string
  
  // Necessidades especiais
  necessidadesEspeciais: boolean
  descricaoNecessidade?: string
  
  // Renda
  rendaFamiliar: 'Até 1 SM' | '1 a 2 SM' | '2 a 3 SM' | 'Acima de 3 SM'
  rendaPerCapita?: number
  
  // Status e informações do sistema
  status: EnrollmentStatus
  anoLetivo?: string
  serie?: string
  
  // Metadados
  criadoEm: string
  criadoPor?: string
  atualizadoEm?: string
  atualizadoPor?: string
  
  // Relacionamento com pré-matrícula (opcional)
  preEnrollmentId?: string
}

// Estatísticas do dashboard
export interface EnrollmentStats {
  pendentes: number
  confirmadas: number
  canceladas: number
  total: number
}

// Opções para selects
export const RACA_OPTIONS = [
  { value: 'Branca', label: 'Branca' },
  { value: 'Preta', label: 'Preta' },
  { value: 'Parda', label: 'Parda' },
  { value: 'Amarela', label: 'Amarela' },
  { value: 'Indígena', label: 'Indígena' }
] as const

export const RENDA_PER_CAPITA_OPTIONS = [
  { value: '0-250', label: 'R$ 0,00 - R$ 250,00' },
  { value: '250-500', label: 'R$ 250,01 - R$ 500,00' },
  { value: '500-750', label: 'R$ 500,01 - R$ 750,00' },
  { value: '750-1000', label: 'R$ 750,01 - R$ 1.000,00' },
  { value: '1000-1250', label: 'R$ 1.000,01 - R$ 1.250,00' },
  { value: '1250-1500', label: 'R$ 1.250,01 - R$ 1.500,00' },
  { value: '1500-1750', label: 'R$ 1.500,01 - R$ 1.750,00' },
  { value: '1750-2000', label: 'R$ 1.750,01 - R$ 2.000,00' },
  { value: '2000+', label: 'Acima de R$ 2.000,00' }
] as const

export const STATUS_OPTIONS = [
  { value: 'pendente_matricula', label: 'Pendente de Matrícula' },
  { value: 'confirmada', label: 'Confirmada' },
  { value: 'cancelada', label: 'Cancelada' }
] as const

export const ANO_LETIVO_OPTIONS = [
  { value: '2024', label: '2024' },
  { value: '2025', label: '2025' },
  { value: '2026', label: '2026' }
] as const

export const SERIE_OPTIONS = [
  { value: 'Berçário I', label: 'Berçário I' },
  { value: 'Berçário II', label: 'Berçário II' },
  { value: 'Maternal I', label: 'Maternal I' },
  { value: 'Maternal II', label: 'Maternal II' },
  { value: 'Pré I', label: 'Pré I' },
  { value: 'Pré II', label: 'Pré II' }
] as const

// Funções utilitárias
export const calcularIdade = (dataNascimento: string): number => {
  if (!dataNascimento) return 0

  try {
    const hoje = new Date()
    // Normalizar para evitar deslocamento por fuso horário ao interpretar strings ISO
    const datePart = (typeof dataNascimento === 'string' ? dataNascimento.split('T')[0] : '')
    let nascimento: Date
    if (/^\d{4}-\d{2}-\d{2}$/.test(datePart)) {
      const [y, m, d] = datePart.split('-').map(Number)
      nascimento = new Date(y, m - 1, d)
    } else {
      nascimento = new Date(dataNascimento)
    }

    if (isNaN(nascimento.getTime())) {
      console.error('❌ Data de nascimento inválida:', dataNascimento)
      return 0
    }

    let idade = hoje.getFullYear() - nascimento.getFullYear()
    const mesAtual = hoje.getMonth()
    const mesNascimento = nascimento.getMonth()

    if (mesAtual < mesNascimento || (mesAtual === mesNascimento && hoje.getDate() < nascimento.getDate())) {
      idade--
    }

    return idade >= 0 ? idade : 0
  } catch (error) {
    console.error('❌ Erro ao calcular idade:', error)
    return 0
  }
}

export const formatarData = (data: string): string => {
  if (!data) return ''
  // Extrair parte YYYY-MM-DD se disponível e criar Date sem timezone
  const datePart = data.split('T')[0]
  if (/^\d{4}-\d{2}-\d{2}$/.test(datePart)) {
    const [y, m, d] = datePart.split('-').map(Number)
    return new Date(y, m - 1, d).toLocaleDateString('pt-BR')
  }

  // Fallback: tentar parse normal
  try {
    return new Date(data).toLocaleDateString('pt-BR')
  } catch (e) {
    return String(data)
  }
}

export const formatarTelefone = (telefone: string | undefined): string => {
  if (!telefone) return ''
  const cleaned = telefone.replace(/\D/g, '')
  if (cleaned.length === 11) {
    return cleaned.replace(/(\d{2})(\d{5})(\d{4})/, '($1) $2-$3')
  }
  if (cleaned.length === 10) {
    return cleaned.replace(/(\d{2})(\d{4})(\d{4})/, '($1) $2-$3')
  }
  return telefone
}
