import { z } from 'zod'

// Schemas de validação para cada etapa
export const ChildInfoSchema = z.object({
  nome: z.string().min(1, 'Nome é obrigatório').max(255, 'Nome muito longo'),
  identidade: z.string().optional(),
  dataNascimento: z.date({
    message: 'Data de nascimento é obrigatória'
  }).refine((date) => {
    const today = new Date()
    const age = today.getFullYear() - date.getFullYear()
    return age >= 2 && age <= 5
  }, 'Idade deve estar entre 2 e 5 anos'),
  sexo: z.enum(['Masculino', 'Feminino', 'Outro'], {
    message: 'Sexo é obrigatório'
  }),
  corRaca: z.enum(['Branca', 'Preta', 'Parda', 'Indígena', 'Amarela', 'Não declarada'], {
    message: 'Cor/raça é obrigatória'
  }),
  gemeos: z.boolean().default(false),
  temIrmaosNaCreche: z.boolean().default(false),
  nomeIrmaoNaCreche: z.string().optional(),
  irmaosNaCreche: z.array(z.object({
    nomeCompleto: z.string(),
    idEnrollment: z.string()
  })).default([]),
  numeroSUS: z.string().optional(),
  unidadeSaude: z.string().optional(),
  problemasSaude: z.string().optional(),
  restricaoAlimentar: z.boolean().default(false),
  tipoRestricao: z.string().optional(),
  alergia: z.boolean().default(false),
  tipoAlergia: z.string().optional(),
  mobilidadeReduzida: z.enum(['Nenhuma', 'Temporária', 'Permanente']).default('Nenhuma'),
  possuiDeficienciasMultiplas: z.boolean().default(false),
  tipoDeficiencia: z.string().optional(),
  publicoEducacaoEspecial: z.boolean().default(false),
  tipoEducacaoEspecial: z.string().optional(),
  classificacao: z.array(z.string()).default([]),
  recebeAuxilioGoverno: z.boolean().default(false),
  tipoAuxilio: z.enum(['Auxílio Brasil', 'Benefício de Prestação Continuada (BPC)', 'Bolsa Família', 'Auxílio-Gás', 'Programa de Erradicação do Trabalho Infantil (PETI)', 'Outro']).optional(),
  numeroNIS: z.string().optional().refine((nis) => {
    if (!nis) return true
    const cleanNis = nis.replace(/\D/g, '')
    return /^\d+$/.test(cleanNis) && cleanNis.length >= 10 && cleanNis.length <= 11
  }, 'NIS deve conter apenas números (10 ou 11 dígitos)')
})

export const GuardianSchema = z.object({
  tipoResponsavel: z.enum(['Mãe', 'Pai', 'Outro']),
  nome: z.string().min(1, 'Nome é obrigatório').max(255, 'Nome muito longo'),
  cpf: z.string().optional().refine((cpf) => {
    if (!cpf) return true
    const cleanCpf = cpf.replace(/\D/g, '')
    return /^\d+$/.test(cleanCpf) && cleanCpf.length === 11
  }, 'CPF deve conter apenas números (11 dígitos)'),
  rg: z.string().optional(),
  celular: z.string().optional().refine((phone) => {
    if (!phone) return true
    const cleanPhone = phone.replace(/\D/g, '')
    return cleanPhone.length >= 10 && cleanPhone.length <= 11
  }, 'Telefone deve ter 10 ou 11 dígitos'),
  outroContato: z.string().optional(),
  localTrabalho: z.string().optional()
})

export const GuardiansSchema = z.object({
  guardians: z.array(GuardianSchema).min(1, 'Pelo menos um responsável é obrigatório')
})

export const AddressSchema = z.object({
  logradouro: z.string().min(1, 'Logradouro é obrigatório').max(255),
  numero: z.string().min(1, 'Número é obrigatório').max(20),
  pontoReferencia: z.string().optional(),
  bairro: z.string().min(1, 'Bairro é obrigatório').max(255),
  municipio: z.string().min(1, 'Município é obrigatório').max(255),
  uf: z.string().min(2, 'UF é obrigatória').max(2),
  cep: z.string().refine((cep) => {
    const cleanCep = cep.replace(/\D/g, '')
    return cleanCep.length === 8
  }, 'CEP deve ter 8 dígitos'),
  telefoneResidencial: z.string().optional(),
  telefoneContato: z.string().optional()
})

export const DocumentsSchema = z.object({
  certidaoNascimento: z.string().optional(),
  municipioNascimento: z.string().optional(),
  municipioRegistro: z.string().optional(),
  cartorioRegistro: z.string().optional(),
  cpfCrianca: z.string().optional().refine((cpf) => {
    if (!cpf) return true
    const cleanCpf = cpf.replace(/\D/g, '')
    return /^\d+$/.test(cleanCpf) && cleanCpf.length === 11
  }, 'CPF deve conter apenas números (11 dígitos)'),
  rgCrianca: z.string().optional(),
  dataEmissaoRg: z.date().optional(),
  orgaoEmissor: z.string().optional()
})

export const AddressDocumentsSchema = AddressSchema.merge(DocumentsSchema)

export const HousingAssetsSchema = z.object({
  tipoOcupacao: z.enum(['Casa Própria', 'Cedida', 'Alugada']),
  valorAluguel: z.number().min(0, 'Valor deve ser positivo').optional(),
  numeroComodos: z.number().min(1, 'Número de cômodos deve ser pelo menos 1'),
  tipoPiso: z.string().min(1, 'Tipo de piso é obrigatório'),
  tipoMoradia: z.string().min(1, 'Tipo de moradia é obrigatório'),
  tipoCobertura: z.string().min(1, 'Tipo de cobertura é obrigatório'),
  saneamentoFossa: z.boolean().default(false),
  saneamentoCifon: z.boolean().default(false),
  energiaEletrica: z.boolean().default(false),
  aguaEncanada: z.boolean().default(false),
  // Bens
  tv: z.boolean().default(false),
  tvQuantidade: z.number().min(0).default(0),
  dvd: z.boolean().default(false),
  dvdQuantidade: z.number().min(0).default(0),
  radio: z.boolean().default(false),
  radioQuantidade: z.number().min(0).default(0),
  computador: z.boolean().default(false),
  computadorQuantidade: z.number().min(0).default(0),
  notebook: z.boolean().default(false),
  notebookQuantidade: z.number().min(0).default(0),
  telefoneFixo: z.boolean().default(false),
  telefoneFixoQuantidade: z.number().min(0).default(0),
  telefoneCelular: z.boolean().default(false),
  telefoneCelularQuantidade: z.number().min(0).default(0),
  tablet: z.boolean().default(false),
  tabletQuantidade: z.number().min(0).default(0),
  internet: z.boolean().default(false),
  tvAssinatura: z.boolean().default(false),
  fogao: z.boolean().default(false),
  fogaoQuantidade: z.number().min(0).default(0),
  geladeira: z.boolean().default(false),
  geladeiraQuantidade: z.number().min(0).default(0),
  freezer: z.boolean().default(false),
  freezerQuantidade: z.number().min(0).default(0),
  microondas: z.boolean().default(false),
  microondasQuantidade: z.number().min(0).default(0),
  maquinaLavar: z.boolean().default(false),
  maquinaLavarQuantidade: z.number().min(0).default(0),
  arCondicionado: z.boolean().default(false),
  arCondicionadoQuantidade: z.number().min(0).default(0),
  bicicleta: z.boolean().default(false),
  bicicletaQuantidade: z.number().min(0).default(0),
  moto: z.boolean().default(false),
  motoQuantidade: z.number().min(0).default(0),
  automovel: z.boolean().default(false),
  automovelQuantidade: z.number().min(0).default(0)
}).refine((data) => {
  if (data.tipoOcupacao === 'Alugada' && (!data.valorAluguel || data.valorAluguel <= 0)) {
    return false
  }
  return true
}, {
  message: 'Valor do aluguel é obrigatório quando tipo de ocupação é "Alugada"',
  path: ['valorAluguel']
})

export const FamilyMemberSchema = z.object({
  nomeMembro: z.string().min(1, 'Nome é obrigatório').max(255),
  idade: z.number().min(0, 'Idade deve ser positiva').max(120),
  parentesco: z.string().min(1, 'Parentesco é obrigatório').max(100),
  situacaoEscolar: z.string().optional(),
  situacaoEmprego: z.string().optional(),
  rendimentoDescricao: z.string().optional(),
  valorBruto: z.number().min(0, 'Valor deve ser positivo').default(0)
})

export const FamilyCompositionSchema = z.object({
  members: z.array(FamilyMemberSchema).max(8, 'Máximo de 8 membros na família')
}).refine((data) => {
  const total = data.members.reduce((sum, member) => sum + member.valorBruto, 0)
  return total >= 0
}, {
  message: 'Renda familiar total não pode ser negativa',
  path: ['members']
})

export const AuthorizedPersonSchema = z.object({
  nome: z.string().min(1, 'Nome é obrigatório').max(255),
  parentesco: z.string().min(1, 'Parentesco é obrigatório').max(100),
  rg: z.string().optional(),
  telefone: z.string().optional()
})

export const SchoolAuthorizedSchema = z.object({
  serie: z.string().min(1, 'Série é obrigatória').max(50),
  anoLetivo: z.string().min(1, 'Ano letivo é obrigatório').max(10),
  authorizedPersons: z.array(AuthorizedPersonSchema).max(2, 'Máximo de 2 pessoas autorizadas')
})

export const ReviewSchema = z.object({
  dataMatricula: z.date().default(() => new Date()),
  aceiteDeclaracao: z.boolean().refine((val) => val === true, 'Aceite da declaração é obrigatório'),
  assinaturaResponsavel: z.string().min(1, 'Assinatura do responsável é obrigatória').max(255)
})

// Schema completo da matrícula
export const EnrollmentSchema = ChildInfoSchema
  .merge(GuardiansSchema)
  .merge(AddressDocumentsSchema)
  .merge(HousingAssetsSchema)
  .merge(FamilyCompositionSchema)
  .merge(SchoolAuthorizedSchema)
  .merge(ReviewSchema)
  .extend({
    rendaFamiliarTotal: z.number().min(0),
    rendaPerCapita: z.number().min(0),
    criadoPor: z.string(),
    criadoEm: z.date(),
    atualizadoEm: z.date(),
    status: z.enum(['draft', 'pending', 'approved', 'rejected']).default('draft')
  })

// Tipos TypeScript derivados dos schemas
export type ChildInfo = z.infer<typeof ChildInfoSchema>
export type Guardian = z.infer<typeof GuardianSchema>
export type Guardians = z.infer<typeof GuardiansSchema>
export type Address = z.infer<typeof AddressSchema>
export type Documents = z.infer<typeof DocumentsSchema>
export type AddressDocuments = z.infer<typeof AddressDocumentsSchema>
export type HousingAssets = z.infer<typeof HousingAssetsSchema>
export type FamilyMember = z.infer<typeof FamilyMemberSchema>
export type FamilyComposition = z.infer<typeof FamilyCompositionSchema>
export type AuthorizedPerson = z.infer<typeof AuthorizedPersonSchema>
export type SchoolAuthorized = z.infer<typeof SchoolAuthorizedSchema>
export type Review = z.infer<typeof ReviewSchema>
export type Enrollment = z.infer<typeof EnrollmentSchema>

// Tipos para as etapas do wizard
export type WizardStep = 1 | 2 | 3 | 4 | 5 | 6 | 7

export interface EnrollmentFormData {
  step1: ChildInfo
  step2: Guardians
  step3: AddressDocuments
  step4: HousingAssets
  step5: FamilyComposition
  step6: SchoolAuthorized
  step7: Review
}

// Opções para selects
export const SEXO_OPTIONS = [
  { value: 'Masculino', label: 'Masculino' },
  { value: 'Feminino', label: 'Feminino' },
  { value: 'Outro', label: 'Outro' }
] as const

export const COR_RACA_OPTIONS = [
  { value: 'Branca', label: 'Branca' },
  { value: 'Preta', label: 'Preta' },
  { value: 'Parda', label: 'Parda' },
  { value: 'Indígena', label: 'Indígena' },
  { value: 'Amarela', label: 'Amarela' },
  { value: 'Não declarada', label: 'Não declarada' }
] as const

export const MOBILIDADE_REDUZIDA_OPTIONS = [
  { value: 'Nenhuma', label: 'Nenhuma' },
  { value: 'Temporária', label: 'Temporária' },
  { value: 'Permanente', label: 'Permanente' }
] as const

export const TIPO_OCUPACAO_OPTIONS = [
  { value: 'Casa Própria', label: 'Casa Própria' },
  { value: 'Cedida', label: 'Cedida' },
  { value: 'Alugada', label: 'Alugada' }
] as const

export const CLASSIFICACAO_OPTIONS = [
  'TEA (Transtorno do Espectro Autista)',
  'TDAH (Transtorno de Déficit de Atenção e Hiperatividade)',
  'Surdez',
  'Cegueira',
  'Baixa Visão',
  'Deficiência Física',
  'Deficiência Intelectual',
  'Síndrome de Down',
  'Paralisia Cerebral',
  'Deficiência Múltipla',
  'Altas Habilidades/Superdotação',
  'Outro'
] as const

export const TIPO_RESPONSAVEL_OPTIONS = [
  { value: 'Mãe', label: 'Mãe' },
  { value: 'Pai', label: 'Pai' },
  { value: 'Outro', label: 'Outro' }
] as const

export const PARENTESCO_OPTIONS = [
  'Mãe',
  'Pai',
  'Avó',
  'Avô',
  'Tia',
  'Tio',
  'Madrinha',
  'Padrinho',
  'Outro'
] as const

export const SITUACAO_ESCOLAR_OPTIONS = [
  'Não frequenta',
  'Creche',
  'Pré-escola',
  'Ensino Fundamental',
  'Ensino Médio',
  'Ensino Superior',
  'Outro'
] as const

export const SITUACAO_EMPREGO_OPTIONS = [
  'Desempregado',
  'Empregado',
  'Autônomo',
  'Aposentado',
  'Estudante',
  'Dona de casa',
  'Outro'
] as const
