import { 
  collection, 
  doc, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  getDoc, 
  getDocs, 
  query, 
  where, 
  orderBy, 
  limit,
  serverTimestamp,
  Timestamp,
  setDoc
} from 'firebase/firestore'
import { db } from '@/lib/firebase'
import { EnrollmentFormData, Enrollment } from '@/lib/enrollment-schemas'

// Função para limpar valores undefined antes de enviar para o Firestore
function cleanUndefinedValues(obj: any): any {
  if (obj === null || obj === undefined) {
    return null
  }
  
  if (Array.isArray(obj)) {
    return obj.map(cleanUndefinedValues)
  }
  
  if (typeof obj === 'object') {
    const cleaned: any = {}
    for (const [key, value] of Object.entries(obj)) {
      if (value !== undefined) {
        cleaned[key] = cleanUndefinedValues(value)
      }
    }
    return cleaned
  }
  
  return obj
}

// Tipos para documentos do Firestore
export interface FirestoreEnrollment {
  // Dados da criança
  nome: string
  identidade?: string
  dataNascimento: string | Timestamp
  sexo: string
  corRaca: string
  gemeos: boolean
  temIrmaosNaCreche: boolean
  nomeIrmaoNaCreche?: string
  irmaosNaCreche?: any[]
  numeroSUS?: string
  unidadeSaude?: string
  problemasSaude?: string
  restricaoAlimentar: boolean
  tipoRestricao?: string
  alergia: boolean
  tipoAlergia?: string
  mobilidadeReduzida: string
  possuiDeficienciasMultiplas: boolean
  tipoDeficiencia?: string
  publicoEducacaoEspecial: boolean
  tipoEducacaoEspecial?: string
  classificacao: string[]
  recebeAuxilioGoverno: boolean
  tipoAuxilio?: string
  numeroNIS?: string

  // Endereço
  logradouro: string
  numero: string
  pontoReferencia?: string
  bairro: string
  municipio: string
  uf: string
  cep: string
  telefoneResidencial?: string
  telefoneContato?: string

  // Documentos
  certidaoNascimento?: string
  municipioNascimento?: string
  municipioRegistro?: string
  cartorioRegistro?: string
  cpfCrianca?: string
  rgCrianca?: string
  dataEmissaoRg?: Timestamp
  orgaoEmissor?: string

  // Situação habitacional
  tipoOcupacao: string
  valorAluguel?: number
  numeroComodos: number
  tipoPiso: string
  tipoMoradia: string
  tipoCobertura: string
  saneamentoFossa: boolean
  saneamentoCifon: boolean
  energiaEletrica: boolean
  aguaEncanada: boolean

  // Bens
  tv: boolean
  tvQuantidade?: number
  dvd: boolean
  dvdQuantidade?: number
  radio: boolean
  radioQuantidade?: number
  computador: boolean
  computadorQuantidade?: number
  notebook: boolean
  notebookQuantidade?: number
  telefoneFixo: boolean
  telefoneFixoQuantidade?: number
  telefoneCelular: boolean
  telefoneCelularQuantidade?: number
  tablet: boolean
  tabletQuantidade?: number
  internet: boolean
  tvAssinatura: boolean
  fogao: boolean
  fogaoQuantidade?: number
  geladeira: boolean
  geladeiraQuantidade?: number
  freezer: boolean
  freezerQuantidade?: number
  microondas: boolean
  microondasQuantidade?: number
  maquinaLavar: boolean
  maquinaLavarQuantidade?: number
  arCondicionado: boolean
  arCondicionadoQuantidade?: number
  bicicleta: boolean
  bicicletaQuantidade?: number
  moto: boolean
  motoQuantidade?: number
  automovel: boolean
  automovelQuantidade?: number

  // Informações escolares
  serie: string
  anoLetivo: string

  // Finalização
  dataMatricula: Timestamp
  aceiteDeclaracao: boolean
  assinaturaResponsavel: string

  // Metadados
  rendaFamiliarTotal: number
  rendaPerCapita: number
  criadoPor: string
  criadoEm: Timestamp
  atualizadoEm: Timestamp
  status: 'draft' | 'pending' | 'approved' | 'rejected'
  
  // Subcoleções
  guardians?: any[]
  familyMembers?: any[]
  authorizedPersons?: any[]
}

export interface FirestoreGuardian {
  tipoResponsavel: string
  nome: string
  cpf?: string
  rg?: string
  celular?: string
  outroContato?: string
  localTrabalho?: string
}

export interface FirestoreFamilyMember {
  nomeMembro: string
  idade: number
  parentesco: string
  situacaoEscolar?: string
  situacaoEmprego?: string
  rendimentoDescricao?: string
  valorBruto: number
}

export interface FirestoreAuthorizedPerson {
  nome: string
  parentesco: string
  rg?: string
  telefone?: string
}

export interface FirestoreHistoryEntry {
  action: 'created' | 'updated' | 'approved' | 'rejected' | 'deleted'
  changedBy: string
  changedByEmail?: string
  changedByName?: string
  changedAt: Timestamp
  changesDiff?: {
    field: string
    oldValue: any
    newValue: any
  }[]
  notes?: string
}

// Função para converter dados do formulário para formato do Firestore
export function convertFormDataToFirestore(data: EnrollmentFormData & { status?: string }, userId: string): FirestoreEnrollment {
  const step1 = data.step1
  const step2 = data.step2
  const step3 = data.step3
  const step4 = data.step4
  const step5 = data.step5
  const step6 = data.step6
  const step7 = data.step7

  // Calcular renda familiar
  const rendaFamiliarTotal = step5.members.reduce((sum, member) => sum + member.valorBruto, 0)
  const rendaPerCapita = step5.members.length > 0 ? rendaFamiliarTotal / step5.members.length : 0

  return {
    // Dados da criança
    nome: step1.nome,
    identidade: step1.identidade,
    dataNascimento: step1.dataNascimento instanceof Date 
      ? step1.dataNascimento.toISOString()
      : step1.dataNascimento,
    sexo: step1.sexo,
    corRaca: step1.corRaca,
    gemeos: step1.gemeos,
    temIrmaosNaCreche: step1.temIrmaosNaCreche,
    nomeIrmaoNaCreche: step1.nomeIrmaoNaCreche,
    irmaosNaCreche: step1.irmaosNaCreche || [],
    numeroSUS: step1.numeroSUS,
    unidadeSaude: step1.unidadeSaude,
    problemasSaude: step1.problemasSaude,
    restricaoAlimentar: step1.restricaoAlimentar,
    tipoRestricao: step1.tipoRestricao,
    alergia: step1.alergia,
    tipoAlergia: step1.tipoAlergia,
    mobilidadeReduzida: step1.mobilidadeReduzida,
    possuiDeficienciasMultiplas: step1.possuiDeficienciasMultiplas,
    tipoDeficiencia: step1.tipoDeficiencia,
    publicoEducacaoEspecial: step1.publicoEducacaoEspecial,
    tipoEducacaoEspecial: step1.tipoEducacaoEspecial,
    classificacao: step1.classificacao,
    recebeAuxilioGoverno: step1.recebeAuxilioGoverno,
    tipoAuxilio: step1.tipoAuxilio,
    numeroNIS: step1.numeroNIS,

    // Endereço
    logradouro: step3.logradouro,
    numero: step3.numero,
    pontoReferencia: step3.pontoReferencia,
    bairro: step3.bairro,
    municipio: step3.municipio,
    uf: step3.uf,
    cep: step3.cep,
    telefoneResidencial: step3.telefoneResidencial,
    telefoneContato: step3.telefoneContato,

    // Documentos
    certidaoNascimento: step3.certidaoNascimento,
    municipioNascimento: step3.municipioNascimento,
    municipioRegistro: step3.municipioRegistro,
    cartorioRegistro: step3.cartorioRegistro,
    cpfCrianca: step3.cpfCrianca,
    rgCrianca: step3.rgCrianca,
    dataEmissaoRg: step3.dataEmissaoRg ? Timestamp.fromDate(step3.dataEmissaoRg) : undefined,
    orgaoEmissor: step3.orgaoEmissor,

    // Situação habitacional
    tipoOcupacao: step4.tipoOcupacao,
    valorAluguel: step4.valorAluguel,
    numeroComodos: step4.numeroComodos,
    tipoPiso: step4.tipoPiso,
    tipoMoradia: step4.tipoMoradia,
    tipoCobertura: step4.tipoCobertura,
    saneamentoFossa: step4.saneamentoFossa,
    saneamentoCifon: step4.saneamentoCifon,
    energiaEletrica: step4.energiaEletrica,
    aguaEncanada: step4.aguaEncanada,

    // Bens
    tv: step4.tv,
    tvQuantidade: step4.tvQuantidade || 0,
    dvd: step4.dvd,
    dvdQuantidade: step4.dvdQuantidade || 0,
    radio: step4.radio,
    radioQuantidade: step4.radioQuantidade || 0,
    computador: step4.computador,
    computadorQuantidade: step4.computadorQuantidade || 0,
    notebook: step4.notebook,
    notebookQuantidade: step4.notebookQuantidade || 0,
    telefoneFixo: step4.telefoneFixo,
    telefoneFixoQuantidade: step4.telefoneFixoQuantidade || 0,
    telefoneCelular: step4.telefoneCelular,
    telefoneCelularQuantidade: step4.telefoneCelularQuantidade || 0,
    tablet: step4.tablet,
    tabletQuantidade: step4.tabletQuantidade || 0,
    internet: step4.internet,
    tvAssinatura: step4.tvAssinatura,
    fogao: step4.fogao,
    fogaoQuantidade: step4.fogaoQuantidade || 0,
    geladeira: step4.geladeira,
    geladeiraQuantidade: step4.geladeiraQuantidade || 0,
    freezer: step4.freezer,
    freezerQuantidade: step4.freezerQuantidade || 0,
    microondas: step4.microondas,
    microondasQuantidade: step4.microondasQuantidade || 0,
    maquinaLavar: step4.maquinaLavar,
    maquinaLavarQuantidade: step4.maquinaLavarQuantidade || 0,
    arCondicionado: step4.arCondicionado,
    arCondicionadoQuantidade: step4.arCondicionadoQuantidade || 0,
    bicicleta: step4.bicicleta,
    bicicletaQuantidade: step4.bicicletaQuantidade || 0,
    moto: step4.moto,
    motoQuantidade: step4.motoQuantidade || 0,
    automovel: step4.automovel,
    automovelQuantidade: step4.automovelQuantidade || 0,

    // Informações escolares
    serie: step6.serie,
    anoLetivo: step6.anoLetivo,

    // Finalização
    dataMatricula: Timestamp.fromDate(step7.dataMatricula),
    aceiteDeclaracao: step7.aceiteDeclaracao,
    assinaturaResponsavel: step7.assinaturaResponsavel,

    // Metadados
    rendaFamiliarTotal,
    rendaPerCapita,
    criadoPor: userId,
    criadoEm: serverTimestamp() as Timestamp,
    atualizadoEm: serverTimestamp() as Timestamp,
    status: (data.status as any) || 'confirmada'
  }
}

// Serviços para operações CRUD
export class EnrollmentService {
  // Criar nova matrícula
  static async createEnrollment(data: EnrollmentFormData, userId: string, userEmail?: string, userName?: string): Promise<string> {
    try {
      const enrollmentData = convertFormDataToFirestore(data, userId)
      
      // Limpar valores undefined antes de enviar para o Firestore
      const cleanedData = cleanUndefinedValues(enrollmentData)
      
      // Criar documento principal
      const enrollmentRef = await addDoc(collection(db, 'enrollments'), cleanedData)
      const enrollmentId = enrollmentRef.id

      // Criar subcoleções
      await this.createSubcollections(enrollmentId, data)

      // Criar entrada no histórico
      await this.addHistoryEntry(enrollmentId, 'created', userId, 'Matrícula criada', undefined, userEmail, userName)

      return enrollmentId
    } catch (error) {
      console.error('Erro ao criar matrícula:', error)
      throw new Error('Erro ao criar matrícula')
    }
  }

  // Função auxiliar para calcular diferenças entre objetos
  private static calculateDiff(oldData: any, newData: any, prefix = ''): { field: string; oldValue: any; newValue: any }[] {
    const changes: { field: string; oldValue: any; newValue: any }[] = []
    
    // Comparar campos do objeto principal
    const allKeys = new Set([...Object.keys(oldData || {}), ...Object.keys(newData || {})])
    
    for (const key of allKeys) {
      const oldValue = oldData?.[key]
      const newValue = newData?.[key]
      const fieldName = prefix ? `${prefix}.${key}` : key
      
      // Ignorar campos de metadados
      if (['criadoEm', 'atualizadoEm', 'criadoPor', 'atualizadoPor'].includes(key)) {
        continue
      }
      
      // Se ambos são objetos (mas não arrays), fazer comparação recursiva
      if (oldValue && newValue && typeof oldValue === 'object' && typeof newValue === 'object' && !Array.isArray(oldValue) && !Array.isArray(newValue)) {
        const nestedChanges = this.calculateDiff(oldValue, newValue, fieldName)
        changes.push(...nestedChanges)
      } else if (JSON.stringify(oldValue) !== JSON.stringify(newValue)) {
        changes.push({
          field: fieldName,
          oldValue: oldValue ?? null,
          newValue: newValue ?? null
        })
      }
    }
    
    return changes
  }

  // Atualizar matrícula existente
  static async updateEnrollment(enrollmentId: string, data: EnrollmentFormData, userId: string, userEmail?: string, userName?: string): Promise<void> {
    try {
      // Buscar dados antigos para comparar
      const oldEnrollment = await this.getEnrollment(enrollmentId)
      if (!oldEnrollment) {
        throw new Error('Matrícula não encontrada')
      }

      const enrollmentData = convertFormDataToFirestore(data, userId)
      
      // Limpar valores undefined antes de enviar para o Firestore
      const cleanedData = cleanUndefinedValues(enrollmentData)
      cleanedData.atualizadoEm = serverTimestamp() as Timestamp

      // Calcular diferenças
      const changes = this.calculateDiff(oldEnrollment, cleanedData)

      // Atualizar documento principal
      await updateDoc(doc(db, 'enrollments', enrollmentId), cleanedData as any)

      // Atualizar subcoleções
      await this.updateSubcollections(enrollmentId, data)

      // Adicionar entrada no histórico com diferenças
      await this.addHistoryEntry(
        enrollmentId, 
        'updated', 
        userId, 
        changes.length > 0 ? 'Matrícula atualizada' : 'Matrícula atualizada (sem mudanças)',
        changes,
        userEmail,
        userName
      )
    } catch (error) {
      console.error('Erro ao atualizar matrícula:', error)
      throw new Error('Erro ao atualizar matrícula')
    }
  }

  // Buscar matrícula por ID
  static async getEnrollment(enrollmentId: string): Promise<FirestoreEnrollment | null> {
    try {
      const enrollmentDoc = await getDoc(doc(db, 'enrollments', enrollmentId))
      
      if (!enrollmentDoc.exists()) {
        return null
      }

      const enrollmentData = enrollmentDoc.data() as FirestoreEnrollment
      
      // Carregar subcoleções em paralelo
      const [guardiansSnapshot, familySnapshot, authorizedSnapshot] = await Promise.all([
        getDocs(collection(db, 'enrollments', enrollmentId, 'guardians')),
        getDocs(collection(db, 'enrollments', enrollmentId, 'familyComposition')),
        getDocs(collection(db, 'enrollments', enrollmentId, 'authorizedPersons'))
      ])

      // Adicionar os dados das subcoleções ao objeto principal
      return {
        ...enrollmentData,
        guardians: guardiansSnapshot.docs.map(doc => doc.data()),
        familyMembers: familySnapshot.docs.map(doc => doc.data()),
        authorizedPersons: authorizedSnapshot.docs.map(doc => doc.data())
      }
    } catch (error) {
      console.error('Erro ao buscar matrícula:', error)
      throw new Error('Erro ao buscar matrícula')
    }
  }

  // Listar matrículas com filtros
  static async listEnrollments(filters?: {
    status?: string
    corRaca?: string
    bairro?: string
    municipio?: string
    anoLetivo?: string
    serie?: string
    limit?: number
  }): Promise<FirestoreEnrollment[]> {
    try {
      let q = query(collection(db, 'enrollments'), orderBy('criadoEm', 'desc'))

      if (filters?.status) {
        q = query(q, where('status', '==', filters.status))
      }
      if (filters?.corRaca) {
        q = query(q, where('corRaca', '==', filters.corRaca))
      }
      if (filters?.bairro) {
        q = query(q, where('bairro', '==', filters.bairro))
      }
      if (filters?.municipio) {
        q = query(q, where('municipio', '==', filters.municipio))
      }
      if (filters?.anoLetivo) {
        q = query(q, where('anoLetivo', '==', filters.anoLetivo))
      }
      if (filters?.serie) {
        q = query(q, where('serie', '==', filters.serie))
      }
      if (filters?.limit) {
        q = query(q, limit(filters.limit))
      }

      const querySnapshot = await getDocs(q)
      return querySnapshot.docs.map(doc => doc.data() as FirestoreEnrollment)
    } catch (error) {
      console.error('Erro ao listar matrículas:', error)
      throw new Error('Erro ao listar matrículas')
    }
  }

  // Deletar matrícula
  static async deleteEnrollment(enrollmentId: string, userId: string): Promise<void> {
    try {
      await deleteDoc(doc(db, 'enrollments', enrollmentId))
      await this.addHistoryEntry(enrollmentId, 'deleted', userId, 'Matrícula deletada')
    } catch (error) {
      console.error('Erro ao deletar matrícula:', error)
      throw new Error('Erro ao deletar matrícula')
    }
  }

  // Criar subcoleções
  private static async createSubcollections(enrollmentId: string, data: EnrollmentFormData): Promise<void> {
    const batch = []

    // Responsáveis
    for (const guardian of data.step2.guardians) {
      batch.push(addDoc(collection(db, 'enrollments', enrollmentId, 'guardians'), guardian))
    }

    // Composição familiar
    for (const member of data.step5.members) {
      batch.push(addDoc(collection(db, 'enrollments', enrollmentId, 'familyComposition'), member))
    }

    // Pessoas autorizadas
    for (const person of data.step6.authorizedPersons) {
      batch.push(addDoc(collection(db, 'enrollments', enrollmentId, 'authorizedPersons'), person))
    }

    await Promise.all(batch)
  }

  // Atualizar subcoleções
  private static async updateSubcollections(enrollmentId: string, data: EnrollmentFormData): Promise<void> {
    // Deletar subcoleções existentes e recriar
    // (Simplificação - em produção seria melhor fazer update incremental)
    
    // Responsáveis
    const guardiansSnapshot = await getDocs(collection(db, 'enrollments', enrollmentId, 'guardians'))
    for (const guardianDoc of guardiansSnapshot.docs) {
      await deleteDoc(guardianDoc.ref)
    }
    for (const guardian of data.step2.guardians) {
      await addDoc(collection(db, 'enrollments', enrollmentId, 'guardians'), guardian)
    }

    // Composição familiar
    const familySnapshot = await getDocs(collection(db, 'enrollments', enrollmentId, 'familyComposition'))
    for (const memberDoc of familySnapshot.docs) {
      await deleteDoc(memberDoc.ref)
    }
    for (const member of data.step5.members) {
      await addDoc(collection(db, 'enrollments', enrollmentId, 'familyComposition'), member)
    }

    // Pessoas autorizadas
    const authorizedSnapshot = await getDocs(collection(db, 'enrollments', enrollmentId, 'authorizedPersons'))
    for (const personDoc of authorizedSnapshot.docs) {
      await deleteDoc(personDoc.ref)
    }
    for (const person of data.step6.authorizedPersons) {
      await addDoc(collection(db, 'enrollments', enrollmentId, 'authorizedPersons'), person)
    }
  }

  // Adicionar entrada no histórico
  static async addHistoryEntry(
    enrollmentId: string, 
    action: FirestoreHistoryEntry['action'], 
    userId: string, 
    notes?: string,
    changesDiff?: { field: string; oldValue: any; newValue: any }[],
    userEmail?: string,
    userName?: string
  ): Promise<void> {
    try {
      await addDoc(collection(db, 'enrollments', enrollmentId, 'history'), {
        action,
        changedBy: userId,
        changedByEmail: userEmail || null,
        changedByName: userName || null,
        changedAt: serverTimestamp(),
        changesDiff: changesDiff || null,
        notes: notes || null
      })
    } catch (error) {
      console.error('Erro ao adicionar entrada no histórico:', error)
    }
  }

  // Buscar histórico de uma matrícula
  static async getEnrollmentHistory(enrollmentId: string): Promise<FirestoreHistoryEntry[]> {
    try {
      const historySnapshot = await getDocs(
        query(collection(db, 'enrollments', enrollmentId, 'history'), orderBy('changedAt', 'desc'))
      )
      
      return historySnapshot.docs.map(doc => doc.data() as FirestoreHistoryEntry)
    } catch (error) {
      console.error('Erro ao buscar histórico:', error)
      throw new Error('Erro ao buscar histórico')
    }
  }

  // Salvar rascunho
  static async saveDraft(userId: string, draftId: string, data: Partial<EnrollmentFormData>): Promise<void> {
    try {
      // Saving draft
      
      // Usar estrutura com número par de segmentos: enrollments_drafts/{draftId}
      await setDoc(doc(db, 'enrollments_drafts', draftId), {
        userId,
        draftId,
        data,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      })
      
      // Draft saved successfully
    } catch (error) {
      console.error('Error saving draft:', error)
      throw new Error('Erro ao salvar rascunho')
    }
  }

  // Buscar rascunhos do usuário
  static async getUserDrafts(userId: string): Promise<any[]> {
    try {
      const draftsSnapshot = await getDocs(
        query(
          collection(db, 'enrollments_drafts'),
          where('userId', '==', userId),
          orderBy('updatedAt', 'desc')
        )
      )
      return draftsSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }))
    } catch (error) {
      console.error('Erro ao buscar rascunhos:', error)
      throw new Error('Erro ao buscar rascunhos')
    }
  }
}
