import {
  collection,
  doc,
  addDoc,
  updateDoc,
  getDoc,
  getDocs,
  query,
  where,
  orderBy,
  serverTimestamp,
  Timestamp,
  onSnapshot
} from 'firebase/firestore'
import { db } from '@/lib/firebase'
import { 
  Enrollment, 
  EnrollmentFilters,
  EnrollmentStats,
  EnrollmentStatus
} from '@/lib/enrollment-list-schemas'
import { PreEnrollment } from '@/lib/pre-enrollment-schemas'

// Função para limpar valores undefined
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

// Serviço para operações CRUD de matrículas
export class EnrollmentListService {
  // Criar matrícula a partir de pré-matrícula aprovada
  static async createEnrollmentFromPreEnrollment(
    preEnrollment: PreEnrollment,
    userId: string
  ): Promise<string> {
    try {
      // Converter data de nascimento para ISO string, aceitando vários formatos
      let dataNascimentoISO: string
      const raw = preEnrollment.dataNascimento as any
      if (!raw) {
        dataNascimentoISO = new Date().toISOString()
      } else if (typeof raw === 'string') {
        const parsed = new Date(raw)
        dataNascimentoISO = isNaN(parsed.getTime()) ? new Date().toISOString() : parsed.toISOString()
      } else if (raw && typeof raw.toDate === 'function') {
        dataNascimentoISO = raw.toDate().toISOString()
      } else if (raw instanceof Date) {
        dataNascimentoISO = raw.toISOString()
      } else {
        try {
          dataNascimentoISO = new Date(raw).toISOString()
        } catch (e) {
          dataNascimentoISO = new Date().toISOString()
        }
      }

      console.log('📅 Data de nascimento da pré-matrícula (raw):', preEnrollment.dataNascimento)
      console.log('📅 Data convertida para ISO string:', dataNascimentoISO)
      
      const enrollmentData = {
        // Dados da criança (mapeamento direto)
        nome: preEnrollment.nomeCrianca,
        dataNascimento: dataNascimentoISO,
        corRaca: preEnrollment.raca,
        
        // Dados do responsável (primeiro responsável)
        guardians: [{
          tipoResponsavel: 'Outro' as const,
          nome: preEnrollment.responsavelNome,
          celular: preEnrollment.responsavelContato
        }],
        
        // Endereço (mapeamento simplificado)
        logradouro: preEnrollment.endereco,
        numero: '',
        bairro: '',
        municipio: '',
        uf: '',
        cep: '',
        
        // Necessidades especiais
        mobilidadeReduzida: preEnrollment.necessidadesEspeciais ? 'Permanente' : 'Nenhuma',
        tipoDeficiencia: preEnrollment.descricaoNecessidade,
        
        // Status e informações do sistema
        status: 'pendente_matricula' as const,
        preEnrollmentId: preEnrollment.id,
        criadoEm: serverTimestamp() as Timestamp,
        criadoPor: userId
      }

      const cleanedData = cleanUndefinedValues(enrollmentData)
      const enrollmentRef = await addDoc(collection(db, 'enrollments'), cleanedData)
      
      console.log('✅ Matrícula criada a partir de pré-matrícula:', enrollmentRef.id)
      return enrollmentRef.id
    } catch (error) {
      console.error('Erro ao criar matrícula a partir de pré-matrícula:', error)
      throw new Error('Erro ao criar matrícula')
    }
  }

  // Buscar matrícula por ID
  static async getEnrollment(id: string): Promise<Enrollment | null> {
    try {
      const enrollmentDoc = await getDoc(doc(db, 'enrollments', id))
      
      if (!enrollmentDoc.exists()) {
        return null
      }

      const data = enrollmentDoc.data()
      
      // Mapear campos corretamente (suporta tanto o formato antigo quanto o novo)
      const nomeCrianca = data.nomeCrianca || data.nome || ''
      const raca = data.raca || data.corRaca || ''
      const responsavelNome = data.responsavelNome || (data.guardians?.[0]?.nome) || ''
      const responsavelContato = data.responsavelContato || (data.guardians?.[0]?.celular) || ''
      const endereco = data.endereco || data.logradouro || ''
      
      // Converter data de nascimento para string ISO se necessário
      let dataNascimento = data.dataNascimento
      console.log('📅 Antes da conversão:', dataNascimento, 'tipo:', typeof dataNascimento)
      
      // Verificar se é um Map
      if (dataNascimento && typeof dataNascimento === 'object' && dataNascimento.constructor.name === 'Map') {
        console.log('📅 É um Map, convertendo...')
        dataNascimento = new Date(dataNascimento.get('seconds') * 1000).toISOString()
      } else if (dataNascimento instanceof Date) {
        dataNascimento = dataNascimento.toISOString()
        console.log('📅 Convertido de Date para ISO')
      } else if (dataNascimento && typeof dataNascimento.toDate === 'function') {
        dataNascimento = dataNascimento.toDate().toISOString()
        console.log('📅 Convertido de Timestamp para ISO')
      } else if (typeof dataNascimento === 'string') {
        console.log('📅 Já é string:', dataNascimento)
      } else {
        dataNascimento = new Date().toISOString()
        console.log('📅 Usando data atual como fallback')
      }
      
      console.log('📅 Depois da conversão:', dataNascimento)
      
      return {
        id: enrollmentDoc.id,
        nomeCrianca,
        raca,
        dataNascimento,
        responsavelNome,
        responsavelContato,
        endereco,
        necessidadesEspeciais: data.necessidadesEspeciais || false,
        descricaoNecessidade: data.descricaoNecessidade || data.tipoDeficiencia || '',
        rendaFamiliar: data.rendaFamiliar || '',
        rendaPerCapita: data.rendaPerCapita || 0,
        status: data.status,
        anoLetivo: data.anoLetivo,
        serie: data.serie,
        criadoEm: data.criadoEm?.toDate?.()?.toISOString() || new Date().toISOString(),
        criadoPor: data.criadoPor,
        atualizadoEm: data.atualizadoEm?.toDate?.()?.toISOString(),
        atualizadoPor: data.atualizadoPor,
        preEnrollmentId: data.preEnrollmentId
      }
    } catch (error) {
      console.error('Erro ao buscar matrícula:', error)
      throw new Error('Erro ao buscar matrícula')
    }
  }

  // Listar matrículas com filtros
  static async getEnrollments(filters?: EnrollmentFilters): Promise<Enrollment[]> {
    try {
      // Buscar todos os documentos e aplicar filtros no frontend
      // Isso garante que os filtros funcionem sempre, independentemente de índices do Firestore
      let q = query(collection(db, 'enrollments'), orderBy('criadoEm', 'desc'))

      const snapshot = await getDocs(q)
      
      const enrollments: Enrollment[] = []

      snapshot.forEach((doc) => {
        const data = doc.data()
        
        // Mapear campos corretamente (suporta tanto o formato antigo quanto o novo)
        const nomeCrianca = data.nomeCrianca || data.nome || ''
        const raca = data.raca || data.corRaca || ''
        const responsavelNome = data.responsavelNome || (data.guardians?.[0]?.nome) || ''
        const responsavelContato = data.responsavelContato || (data.guardians?.[0]?.celular) || ''
        const endereco = data.endereco || data.logradouro || ''
        
        // Converter data de nascimento para string ISO se necessário
        let dataNascimento = data.dataNascimento
        
        // Se já é string, verificar se é válida
        if (typeof dataNascimento === 'string') {
          const testDate = new Date(dataNascimento)
          if (isNaN(testDate.getTime())) {
            console.warn('⚠️ Data string inválida:', dataNascimento)
            dataNascimento = new Date().toISOString()
          }
        } else if (dataNascimento && typeof dataNascimento === 'object' && dataNascimento.constructor.name === 'Map') {
          dataNascimento = new Date(dataNascimento.get('seconds') * 1000).toISOString()
        } else if (dataNascimento instanceof Date) {
          dataNascimento = dataNascimento.toISOString()
        } else if (dataNascimento && typeof dataNascimento.toDate === 'function') {
          dataNascimento = dataNascimento.toDate().toISOString()
        } else if (typeof dataNascimento !== 'string') {
          console.warn('⚠️ Data de nascimento em formato não reconhecido:', dataNascimento)
          dataNascimento = new Date().toISOString()
        }
        
        enrollments.push({
          id: doc.id,
          nomeCrianca,
          raca,
          dataNascimento,
          responsavelNome,
          responsavelContato,
          endereco,
          necessidadesEspeciais: data.necessidadesEspeciais || false,
          descricaoNecessidade: data.descricaoNecessidade || data.tipoDeficiencia || '',
          rendaFamiliar: data.rendaFamiliar || '',
          rendaPerCapita: data.rendaPerCapita || 0,
          status: data.status,
          anoLetivo: data.anoLetivo,
          serie: data.serie,
          criadoEm: data.criadoEm?.toDate?.()?.toISOString() || new Date().toISOString(),
          criadoPor: data.criadoPor,
          atualizadoEm: data.atualizadoEm?.toDate?.()?.toISOString(),
          atualizadoPor: data.atualizadoPor,
          preEnrollmentId: data.preEnrollmentId
        })
      })

      // Aplicar todos os filtros no frontend
      let filteredEnrollments = [...enrollments]

      // Filtro de nome (busca textual)
      if (filters?.nome && filters.nome.trim() !== '') {
        const nomeFilter = filters.nome.toLowerCase().trim()
        filteredEnrollments = filteredEnrollments.filter(enrollment =>
          enrollment.nomeCrianca.toLowerCase().includes(nomeFilter) ||
          enrollment.responsavelNome.toLowerCase().includes(nomeFilter)
        )
      }

      // Filtro de raça
      if (filters?.raca && filters.raca.trim() !== '') {
        filteredEnrollments = filteredEnrollments.filter(enrollment =>
          enrollment.raca === filters.raca
        )
      }

      // Filtro de renda per capita
      if (filters?.rendaPerCapita && filters.rendaPerCapita.trim() !== '') {
        const rendaFilter = filters.rendaPerCapita.trim()
        
        // Verificar se termina com '+' (ex: "2000+")
        if (rendaFilter.endsWith('+')) {
          const min = parseFloat(rendaFilter.replace('+', ''))
          filteredEnrollments = filteredEnrollments.filter(enrollment => {
            const rendaPerCapita = enrollment.rendaPerCapita || 0
            return rendaPerCapita >= min
          })
        } else {
          // Formato "min-max" (ex: "0-250")
          const parts = rendaFilter.split('-')
          if (parts.length === 2) {
            const min = parseFloat(parts[0])
            const max = parseFloat(parts[1])
            
            if (!isNaN(min) && !isNaN(max)) {
              filteredEnrollments = filteredEnrollments.filter(enrollment => {
                const rendaPerCapita = enrollment.rendaPerCapita || 0
                return rendaPerCapita >= min && rendaPerCapita <= max
              })
            }
          }
        }
      }

      // Filtro de status
      if (filters?.status && filters.status.trim() !== '') {
        filteredEnrollments = filteredEnrollments.filter(enrollment =>
          enrollment.status === filters.status
        )
      }

      // Filtro de ano letivo
      if (filters?.anoLetivo && filters.anoLetivo.trim() !== '') {
        filteredEnrollments = filteredEnrollments.filter(enrollment =>
          enrollment.anoLetivo === filters.anoLetivo
        )
      }

      // Filtro de série
      if (filters?.serie && filters.serie.trim() !== '') {
        filteredEnrollments = filteredEnrollments.filter(enrollment =>
          enrollment.serie === filters.serie
        )
      }

      // Ordenação: pendentes primeiro, depois por data (mais recente primeiro)
      filteredEnrollments.sort((a, b) => {
        // Priorizar status "pendente_matricula"
        if (a.status === 'pendente_matricula' && b.status !== 'pendente_matricula') return -1
        if (a.status !== 'pendente_matricula' && b.status === 'pendente_matricula') return 1
        
        // Se ambos têm o mesmo status (ou nenhum é "pendente"), ordenar por data
        const dateA = new Date(a.criadoEm).getTime()
        const dateB = new Date(b.criadoEm).getTime()
        return dateB - dateA // Mais recente primeiro
      })

      return filteredEnrollments
    } catch (error) {
      console.error('Erro ao listar matrículas:', error)
      throw new Error('Erro ao listar matrículas')
    }
  }

  // Obter estatísticas do dashboard
  static async getStats(): Promise<EnrollmentStats> {
    try {
      const snapshot = await getDocs(collection(db, 'enrollments'))
      
      let pendentes = 0
      let confirmadas = 0
      let canceladas = 0

      snapshot.forEach((doc) => {
        const data = doc.data()
        switch (data.status) {
          case 'pendente_matricula':
            pendentes++
            break
          case 'confirmada':
            confirmadas++
            break
          case 'cancelada':
            canceladas++
            break
        }
      })

      return {
        pendentes,
        confirmadas,
        canceladas,
        total: pendentes + confirmadas + canceladas
      }
    } catch (error) {
      console.error('Erro ao obter estatísticas:', error)
      throw new Error('Erro ao obter estatísticas')
    }
  }

  // Atualizar status da matrícula
  static async updateEnrollmentStatus(
    id: string,
    status: EnrollmentStatus,
    userId: string
  ): Promise<void> {
    try {
      await updateDoc(doc(db, 'enrollments', id), {
        status,
        atualizadoEm: serverTimestamp() as Timestamp,
        atualizadoPor: userId
      })
    } catch (error) {
      console.error('Erro ao atualizar status da matrícula:', error)
      throw new Error('Erro ao atualizar status da matrícula')
    }
  }

  // Cancelar matrícula
  static async cancelEnrollment(id: string, userId: string): Promise<void> {
    try {
      await this.updateEnrollmentStatus(id, 'cancelada', userId)
    } catch (error) {
      console.error('Erro ao cancelar matrícula:', error)
      throw new Error('Erro ao cancelar matrícula')
    }
  }

  // Confirmar matrícula
  static async confirmEnrollment(id: string, userId: string): Promise<void> {
    try {
      await this.updateEnrollmentStatus(id, 'confirmada', userId)
    } catch (error) {
      console.error('Erro ao confirmar matrícula:', error)
      throw new Error('Erro ao confirmar matrícula')
    }
  }

  // Atualizar dados da matrícula
  static async updateEnrollment(
    id: string,
    data: Partial<Enrollment>,
    userId: string
  ): Promise<void> {
    try {
      const updateData: any = {
        ...data,
        atualizadoEm: serverTimestamp() as Timestamp,
        atualizadoPor: userId
      }

      const cleanedData = cleanUndefinedValues(updateData)
      await updateDoc(doc(db, 'enrollments', id), cleanedData)
    } catch (error) {
      console.error('Erro ao atualizar matrícula:', error)
      throw new Error('Erro ao atualizar matrícula')
    }
  }

  // Realizar rematrícula de um aluno
  static async reenrollStudent(
    enrollmentId: string,
    newYear: string,
    userId: string
  ): Promise<string> {
    try {
      // Buscar a matrícula original
      const originalEnrollment = await this.getEnrollment(enrollmentId)
      if (!originalEnrollment) {
        throw new Error('Matrícula não encontrada')
      }

      // Criar nova matrícula para o novo ano letivo
      // Buscar os dados completos da matrícula original no Firestore
      const enrollmentDoc = await getDoc(doc(db, 'enrollments', enrollmentId))
      if (!enrollmentDoc.exists()) {
        throw new Error('Matrícula não encontrada')
      }

      const originalData = enrollmentDoc.data()

      // Criar nova matrícula baseada na original, mas com novo ano letivo
      const newEnrollmentData: any = {
        // Copiar dados da criança
        nomeCrianca: originalData.nomeCrianca || originalData.nome,
        raca: originalData.raca || originalData.corRaca,
        dataNascimento: originalData.dataNascimento,
        sexo: originalData.sexo,
        
        // Copiar dados do responsável
        responsavelNome: originalData.responsavelNome || (originalData.guardians?.[0]?.nome),
        responsavelContato: originalData.responsavelContato || (originalData.guardians?.[0]?.celular),
        
        // Copiar endereço
        endereco: originalData.endereco || originalData.logradouro,
        
        // Copiar necessidades especiais
        necessidadesEspeciais: originalData.necessidadesEspeciais || false,
        descricaoNecessidade: originalData.descricaoNecessidade || originalData.tipoDeficiencia,
        
        // Copiar renda
        rendaFamiliar: originalData.rendaFamiliar,
        rendaPerCapita: originalData.rendaPerCapita,
        recebeAuxilioGoverno: originalData.recebeAuxilioGoverno || false,
        tipoAuxilio: originalData.tipoAuxilio,
        numeroNIS: originalData.numeroNIS,
        
        // Novo ano letivo e status
        anoLetivo: newYear,
        serie: originalData.serie, // Manter a série (pode ser atualizada depois)
        status: 'confirmada' as const,
        
        // Metadados
        criadoEm: serverTimestamp() as Timestamp,
        criadoPor: userId,
        
        // Referência à matrícula original
        enrollmentIdAnterior: enrollmentId,
        isReenrollment: true
      }

      // Copiar outros campos que possam existir
      if (originalData.guardians) {
        newEnrollmentData.guardians = originalData.guardians
      }
      if (originalData.logradouro) {
        newEnrollmentData.logradouro = originalData.logradouro
        newEnrollmentData.numero = originalData.numero
        newEnrollmentData.bairro = originalData.bairro
        newEnrollmentData.municipio = originalData.municipio
        newEnrollmentData.uf = originalData.uf
        newEnrollmentData.cep = originalData.cep
      }

      // Limpar valores undefined
      const cleanedData = cleanUndefinedValues(newEnrollmentData)

      // Criar nova matrícula
      const newEnrollmentRef = await addDoc(collection(db, 'enrollments'), cleanedData)
      
      return newEnrollmentRef.id
    } catch (error) {
      console.error('Erro ao realizar rematrícula:', error)
      throw new Error('Erro ao realizar rematrícula')
    }
  }
}
