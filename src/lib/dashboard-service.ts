import { 
  collection, 
  query, 
  getDocs, 
  orderBy, 
  limit,
  Timestamp
} from 'firebase/firestore'
import { db } from './firebase'

export interface DashboardStats {
  total: number
  pendentes: number
  aprovadas: number
  rejeitadas: number
  canceladas: number
  comNecessidadesEspeciais: number
  comAuxilioGoverno: number
}

export interface ChartData {
  name: string
  value: number
  [key: string]: string | number
}

export interface Activity {
  id: string
  type: 'matricula' | 'pre-matricula' | 'rematricula' | 'approval' | 'rejection'
  title: string
  description: string
  user: string
  timestamp: Date
}

export interface DashboardFilters {
  renda?: string
  raca?: string
  bairro?: string
  idadeMin?: number
  idadeMax?: number
  necessidades?: string[]
  anoLetivo?: string
  status?: string
  serie?: string
}

class DashboardService {
  /**
   * Busca estatísticas gerais do sistema
   */
  async getOverviewStats(filters?: DashboardFilters): Promise<DashboardStats> {
    try {
      // Buscar todas as matrículas e pré-matrículas
      const allMatriculas = await this.getAllDocs('enrollments')
      const allPreMatriculas = await this.getAllDocs('pre_enrollments')

      // Aplicar filtros
      const matriculas = this.applyFilters(allMatriculas, filters)
      const preMatriculas = this.applyFilters(allPreMatriculas, filters)

      return {
        total: matriculas.length + preMatriculas.length,
        pendentes: matriculas.filter(m => m.status === 'pendente_matricula').length + 
                   preMatriculas.filter(p => p.status === 'analise').length,
        aprovadas: matriculas.filter(m => m.status === 'confirmada').length + 
                   preMatriculas.filter(p => p.status === 'aprovada').length,
        rejeitadas: preMatriculas.filter(p => p.status === 'rejeitada').length,
        canceladas: matriculas.filter(m => m.status === 'cancelada').length,
        comNecessidadesEspeciais: this.countWithSpecialNeeds(matriculas, preMatriculas),
        comAuxilioGoverno: this.countWithGovernmentAid(matriculas, preMatriculas)
      }
    } catch (error) {
      console.error('Erro ao buscar estatísticas gerais:', error)
      throw error
    }
  }

  /**
   * Busca estatísticas de matrículas
   */
  async getMatriculasStats(filters?: DashboardFilters): Promise<DashboardStats> {
    try {
      const allMatriculas = await this.getAllDocs('enrollments')
      const matriculas = this.applyFilters(allMatriculas, filters)

      return {
        total: matriculas.length,
        pendentes: matriculas.filter(m => m.status === 'pendente_matricula').length,
        aprovadas: matriculas.filter(m => m.status === 'confirmada').length,
        rejeitadas: 0,
        canceladas: matriculas.filter(m => m.status === 'cancelada').length,
        comNecessidadesEspeciais: this.countWithSpecialNeeds(matriculas),
        comAuxilioGoverno: this.countWithGovernmentAid(matriculas)
      }
    } catch (error) {
      console.error('Erro ao buscar estatísticas de matrículas:', error)
      throw error
    }
  }

  /**
   * Busca estatísticas de pré-matrículas
   */
  async getPreMatriculasStats(filters?: DashboardFilters): Promise<DashboardStats> {
    try {
      const allPreMatriculas = await this.getAllDocs('pre_enrollments')
      const preMatriculas = this.applyFilters(allPreMatriculas, filters)

      return {
        total: preMatriculas.length,
        pendentes: preMatriculas.filter(p => p.status === 'analise').length,
        aprovadas: preMatriculas.filter(p => p.status === 'aprovada').length,
        rejeitadas: preMatriculas.filter(p => p.status === 'rejeitada').length,
        canceladas: 0,
        comNecessidadesEspeciais: this.countWithSpecialNeeds(preMatriculas),
        comAuxilioGoverno: this.countWithGovernmentAid(preMatriculas)
      }
    } catch (error) {
      console.error('Erro ao buscar estatísticas de pré-matrículas:', error)
      throw error
    }
  }

  /**
   * Busca estatísticas de rematrículas
   */
  async getRematriculasStats(filters?: DashboardFilters): Promise<DashboardStats> {
    try {
      // Rematrículas são matrículas com flag isReenrollment = true ou rematricula = true
      const allMatriculas = await this.getAllDocs('enrollments')
      let rematriculas = allMatriculas.filter(m => m.isReenrollment === true || m.rematricula === true)
      
      // Aplicar filtros
      rematriculas = this.applyFilters(rematriculas, filters)

      return {
        total: rematriculas.length,
        pendentes: rematriculas.filter(m => m.status === 'pendente_matricula').length,
        aprovadas: rematriculas.filter(m => m.status === 'confirmada').length,
        rejeitadas: 0,
        canceladas: rematriculas.filter(m => m.status === 'cancelada').length,
        comNecessidadesEspeciais: this.countWithSpecialNeeds(rematriculas),
        comAuxilioGoverno: this.countWithGovernmentAid(rematriculas)
      }
    } catch (error) {
      console.error('Erro ao buscar estatísticas de rematrículas:', error)
      throw error
    }
  }

  /**
   * Busca dados para gráfico de distribuição por raça
   */
  async getChartDataPorRaca(collectionName: string, filters?: DashboardFilters): Promise<ChartData[]> {
    try {
      const allDocs = await this.getAllDocs(collectionName)
      const docs = this.applyFilters(allDocs, filters)

      const racaCount: Record<string, number> = {}
      
      docs.forEach(doc => {
        const raca = doc.raca || doc.corRaca || 'Não informado'
        racaCount[raca] = (racaCount[raca] || 0) + 1
      })

      return Object.entries(racaCount).map(([name, value]) => ({ name, value }))
    } catch (error) {
      console.error('Erro ao buscar dados de raça:', error)
      throw error
    }
  }

  /**
   * Busca dados para gráfico de distribuição por renda
   */
  async getChartDataPorRenda(collectionName: string, filters?: DashboardFilters): Promise<ChartData[]> {
    try {
      const allDocs = await this.getAllDocs(collectionName)
      const docs = this.applyFilters(allDocs, filters)

      const rendaCount: Record<string, number> = {}
      
      docs.forEach(doc => {
        const renda = doc.rendaFamiliar || doc.rendaFamiliarEstimada || 'Não informado'
        rendaCount[renda] = (rendaCount[renda] || 0) + 1
      })

      return Object.entries(rendaCount).map(([name, value]) => ({ name, value }))
    } catch (error) {
      console.error('Erro ao buscar dados de renda:', error)
      throw error
    }
  }

  /**
   * Busca dados para gráfico de distribuição por bairro
   */
  async getChartDataPorBairro(collectionName: string, filters?: DashboardFilters): Promise<ChartData[]> {
    try {
      const allDocs = await this.getAllDocs(collectionName)
      const docs = this.applyFilters(allDocs, filters)

      const bairroCount: Record<string, number> = {}
      
      docs.forEach(doc => {
        // Bairro pode estar em diferentes campos dependendo da estrutura
        const bairro = doc.bairro || (typeof doc.endereco === 'object' ? doc.endereco?.bairro : null) || 'Não informado'
        bairroCount[bairro] = (bairroCount[bairro] || 0) + 1
      })

      // Ordenar por quantidade e pegar top 10
      return Object.entries(bairroCount)
        .map(([name, value]) => ({ name, value }))
        .sort((a, b) => b.value - a.value)
        .slice(0, 10)
    } catch (error) {
      console.error('Erro ao buscar dados de bairro:', error)
      throw error
    }
  }

  /**
   * Busca dados para gráfico de evolução mensal
   */
  async getChartDataEvolucaoMensal(collectionName: string, filters?: DashboardFilters): Promise<ChartData[]> {
    try {
      const allDocs = await this.getAllDocs(collectionName)
      const docs = this.applyFilters(allDocs, filters)

      const monthCount: Record<string, number> = {}
      
      docs.forEach(doc => {
        const date = this.getDateFromDoc(doc)
        if (date) {
          const monthKey = date.toLocaleDateString('pt-BR', { month: 'short', year: 'numeric' })
          monthCount[monthKey] = (monthCount[monthKey] || 0) + 1
        }
      })

      return Object.entries(monthCount)
        .map(([name, value]) => ({ name, value }))
        .sort((a, b) => a.name.localeCompare(b.name))
    } catch (error) {
      console.error('Erro ao buscar dados de evolução:', error)
      throw error
    }
  }

  /**
   * Busca dados para gráfico de distribuição por sexo
   */
  async getChartDataPorSexo(collectionName: string, filters?: DashboardFilters): Promise<ChartData[]> {
    try {
      const allDocs = await this.getAllDocs(collectionName)
      const docs = this.applyFilters(allDocs, filters)

      const sexoCount: Record<string, number> = {}
      
      docs.forEach(doc => {
        const sexo = doc.sexo || doc.genero || 'Não informado'
        sexoCount[sexo] = (sexoCount[sexo] || 0) + 1
      })

      return Object.entries(sexoCount).map(([name, value]) => ({ name, value }))
    } catch (error) {
      console.error('Erro ao buscar dados de sexo:', error)
      throw error
    }
  }

  /**
   * Busca dados para gráfico de distribuição por idade
   */
  async getChartDataPorIdade(collectionName: string, filters?: DashboardFilters): Promise<ChartData[]> {
    try {
      const allDocs = await this.getAllDocs(collectionName)
      const docs = this.applyFilters(allDocs, filters)

      // Contar por idade inteira (0,1,2,3... anos)
      const idadeCount: Record<number, number> = {}

      docs.forEach(doc => {
        const idade = this.calcularIdade(doc.dataNascimento)
        const key = Number.isFinite(idade) ? idade : 0
        idadeCount[key] = (idadeCount[key] || 0) + 1
      })

      // Converter para formato esperado e ordenar por idade crescente
      return Object.entries(idadeCount)
        .map(([age, value]) => ({ name: `${age} anos`, value }))
        .sort((a, b) => {
          const na = parseInt(a.name, 10)
          const nb = parseInt(b.name, 10)
          return na - nb
        })
    } catch (error) {
      console.error('Erro ao buscar dados de idade:', error)
      throw error
    }
  }

  /**
   * Busca dados para gráfico de auxílio do governo
   */
  async getChartDataAuxilioGoverno(collectionName: string, filters?: DashboardFilters): Promise<ChartData[]> {
    try {
      const allDocs = await this.getAllDocs(collectionName)
      const docs = this.applyFilters(allDocs, filters)

      let comAuxilio = 0
      let semAuxilio = 0
      
      docs.forEach(doc => {
        if (doc.recebeAuxilioGoverno || doc.tipoAuxilio || doc.numeroNIS) {
          comAuxilio++
        } else {
          semAuxilio++
        }
      })

      return [
        { name: 'Com Auxílio', value: comAuxilio },
        { name: 'Sem Auxílio', value: semAuxilio }
      ]
    } catch (error) {
      console.error('Erro ao buscar dados de auxílio:', error)
      throw error
    }
  }

  /**
   * Busca dados para gráfico de necessidades especiais
   */
  async getChartDataNecessidadesEspeciais(collectionName: string, filters?: DashboardFilters): Promise<ChartData[]> {
    try {
      const allDocs = await this.getAllDocs(collectionName)
      const docs = this.applyFilters(allDocs, filters)

      let comNecessidades = 0
      let semNecessidades = 0
      
      docs.forEach(doc => {
        if (doc.necessidadesEspeciais || doc.possuiNecessidadesEspeciais || doc.necessidadesEspeciaisDescricao) {
          comNecessidades++
        } else {
          semNecessidades++
        }
      })

      return [
        { name: 'Com Necessidades Especiais', value: comNecessidades },
        { name: 'Sem Necessidades Especiais', value: semNecessidades }
      ]
    } catch (error) {
      console.error('Erro ao buscar dados de necessidades:', error)
      throw error
    }
  }

  /**
   * Busca dados para gráfico de distribuição por renda per capita
   */
  async getChartDataPorRendaPerCapita(collectionName: string, filters?: DashboardFilters): Promise<ChartData[]> {
    try {
      const allDocs = await this.getAllDocs(collectionName)
      const docs = this.applyFilters(allDocs, filters)

      const rendaCount: Record<string, number> = {}
      
      docs.forEach(doc => {
        const rendaPerCapita = doc.rendaPerCapita || 0
        const faixaRenda = this.getFaixaRendaPerCapita(rendaPerCapita)
        rendaCount[faixaRenda] = (rendaCount[faixaRenda] || 0) + 1
      })

      return Object.entries(rendaCount).map(([name, value]) => ({ name, value }))
    } catch (error) {
      console.error('Erro ao buscar dados de renda per capita:', error)
      throw error
    }
  }

  /**
   * Busca atividades recentes
   */
  async getRecentActivities(limitCount: number = 10): Promise<Activity[]> {
    try {
      const activities: Activity[] = []

      // Buscar últimas matrículas
      const matriculasQuery = query(
        collection(db, 'enrollments'),
        orderBy('criadoEm', 'desc'),
        limit(limitCount)
      )
      const matriculasSnapshot = await getDocs(matriculasQuery)
      
      matriculasSnapshot.docs.forEach(doc => {
        const data = doc.data()
        activities.push({
          id: doc.id,
          type: 'matricula',
          title: 'Nova Matrícula',
          description: `${data.nomeCrianca || data.nome || 'Aluno'} - ${data.serie || 'Série não informada'}`,
          user: data.criadoPor || 'Sistema',
          timestamp: data.criadoEm?.toDate() || new Date()
        })
      })

      // Buscar últimas pré-matrículas
      const preMatriculasQuery = query(
        collection(db, 'pre_enrollments'),
        orderBy('criadoEm', 'desc'),
        limit(limitCount)
      )
      const preMatriculasSnapshot = await getDocs(preMatriculasQuery)
      
      preMatriculasSnapshot.docs.forEach(doc => {
        const data = doc.data()
        activities.push({
          id: doc.id,
          type: 'pre-matricula',
          title: 'Nova Pré-Matrícula',
          description: `${data.nomeCrianca || 'Aluno'} - Status: ${data.status}`,
          user: data.criadoPor || 'Sistema',
          timestamp: data.criadoEm?.toDate() || new Date()
        })
      })

      // Ordenar por timestamp e retornar os mais recentes
      return activities
        .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
        .slice(0, limitCount)
    } catch (error) {
      console.error('Erro ao buscar atividades recentes:', error)
      throw error
    }
  }

  /**
   * Busca todos os documentos de uma coleção (sem filtros no Firestore)
   */
  private async getAllDocs(collectionName: string): Promise<any[]> {
    try {
      const q = query(collection(db, collectionName), orderBy('criadoEm', 'desc'))
      const snapshot = await getDocs(q)
      return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }))
    } catch (error) {
      console.error(`Erro ao buscar documentos de ${collectionName}:`, error)
      return []
    }
  }

  /**
   * Aplica filtros aos documentos no frontend
   */
  private applyFilters(docs: any[], filters?: DashboardFilters): any[] {
    if (!filters || Object.keys(filters).length === 0) return docs

    let filtered = [...docs]

    // Filtro de status
    if (filters.status && filters.status.trim() !== '') {
      filtered = filtered.filter(doc => {
        const status = doc.status
        // Mapear status do filtro para os status reais dos documentos
        if (filters.status === 'pendente') {
          return status === 'pendente_matricula' || status === 'analise'
        }
        return status === filters.status
      })
    }

    // Filtro de renda familiar
    if (filters.renda && filters.renda.trim() !== '') {
      filtered = filtered.filter(doc => {
        const renda = doc.rendaFamiliar || doc.rendaFamiliarEstimada
        return renda === filters.renda
      })
    }

    // Filtro de raça
    if (filters.raca && filters.raca.trim() !== '') {
      filtered = filtered.filter(doc => {
        const raca = doc.raca || doc.corRaca
        return raca === filters.raca
      })
    }

    // Filtro de bairro (busca em vários campos possíveis)
    if (filters.bairro && filters.bairro.trim() !== '') {
      const bairroFilter = filters.bairro.toLowerCase().trim()
      filtered = filtered.filter(doc => {
        // Bairro pode estar em diferentes campos dependendo da estrutura
        const bairro = (doc.bairro || '').toLowerCase()
        const endereco = typeof doc.endereco === 'string' 
          ? doc.endereco.toLowerCase() 
          : (doc.endereco?.bairro || doc.logradouro || '').toLowerCase()
        return bairro.includes(bairroFilter) || endereco.includes(bairroFilter)
      })
    }

    // Filtro de ano letivo
    if (filters.anoLetivo && filters.anoLetivo.trim() !== '') {
      filtered = filtered.filter(doc => {
        const anoLetivo = doc.anoLetivo
        return anoLetivo === filters.anoLetivo
      })
    }

    // Filtro de série
    if (filters.serie && filters.serie.trim() !== '') {
      filtered = filtered.filter(doc => {
        const serie = doc.serie
        return serie === filters.serie
      })
    }

    // Filtro de idade mínima
    if (filters.idadeMin !== undefined && filters.idadeMin !== null && filters.idadeMin >= 0) {
      filtered = filtered.filter(doc => {
        const idade = this.calcularIdade(doc.dataNascimento)
        return idade >= filters.idadeMin!
      })
    }

    // Filtro de idade máxima
    if (filters.idadeMax !== undefined && filters.idadeMax !== null && filters.idadeMax > 0) {
      filtered = filtered.filter(doc => {
        const idade = this.calcularIdade(doc.dataNascimento)
        return idade <= filters.idadeMax!
      })
    }

    // Filtro de necessidades especiais
    if (filters.necessidades && filters.necessidades.length > 0) {
      filtered = filtered.filter(doc => {
        // Verifica se o documento tem necessidades especiais
        const temNecessidades = doc.necessidadesEspeciais || doc.possuiNecessidadesEspeciais || doc.necessidadesEspeciaisDescricao || doc.descricaoNecessidade || doc.tipoDeficiencia
        if (!temNecessidades) return false

        // Se há tipos específicos de necessidades, verificar se algum corresponde
        const descricao = (doc.descricaoNecessidade || doc.necessidadesEspeciaisDescricao || doc.tipoDeficiencia || '').toLowerCase()
        return filters.necessidades!.some(nec => 
          descricao.includes(nec.toLowerCase())
        )
      })
    }

    return filtered
  }

  /**
   * Conta documentos com necessidades especiais
   */
  private countWithSpecialNeeds(...docArrays: any[][]): number {
    let count = 0
    docArrays.forEach(docs => {
      docs.forEach(doc => {
        if (doc.necessidadesEspeciais || doc.possuiNecessidadesEspeciais || doc.necessidadesEspeciaisDescricao) {
          count++
        }
      })
    })
    return count
  }

  /**
   * Conta documentos com auxílio governamental
   */
  private countWithGovernmentAid(...docArrays: any[][]): number {
    let count = 0
    docArrays.forEach(docs => {
      docs.forEach(doc => {
        if (doc.recebeAuxilioGoverno || doc.tipoAuxilio || doc.numeroNIS) {
          count++
        }
      })
    })
    return count
  }

  /**
   * Extrai data de um documento
   */
  private getDateFromDoc(doc: any): Date | null {
    if (doc.criadoEm) {
      return doc.criadoEm.toDate ? doc.criadoEm.toDate() : new Date(doc.criadoEm)
    }
    if (doc.dataCadastro) {
      return doc.dataCadastro.toDate ? doc.dataCadastro.toDate() : new Date(doc.dataCadastro)
    }
    return null
  }

  /**
   * Calcula idade a partir da data de nascimento
   */
  private calcularIdade(dataNascimento: any): number {
    if (!dataNascimento) return 0
    
    let data: Date
    
    if (typeof dataNascimento === 'string') {
      data = new Date(dataNascimento)
    } else if (dataNascimento.toDate) {
      data = dataNascimento.toDate()
    } else if (dataNascimento instanceof Date) {
      data = dataNascimento
    } else {
      return 0
    }
    
    if (isNaN(data.getTime())) return 0
    
    const hoje = new Date()
    let idade = hoje.getFullYear() - data.getFullYear()
    const mesAtual = hoje.getMonth()
    const mesNascimento = data.getMonth()
    
    if (mesAtual < mesNascimento || (mesAtual === mesNascimento && hoje.getDate() < data.getDate())) {
      idade--
    }
    
    return Math.max(0, idade)
  }

  /**
   * Retorna faixa de idade
   */
  private getFaixaIdade(idade: number): string {
    if (idade < 1) return '0-1 anos'
    if (idade < 3) return '1-2 anos'
    if (idade < 5) return '3-4 anos'
    if (idade < 7) return '5-6 anos'
    if (idade < 9) return '7-8 anos'
    if (idade < 11) return '9-10 anos'
    if (idade < 13) return '11-12 anos'
    if (idade < 15) return '13-14 anos'
    if (idade < 17) return '15-16 anos'
    return '17+ anos'
  }

  /**
   * Retorna faixa de renda per capita
   */
  private getFaixaRendaPerCapita(renda: number): string {
    if (renda <= 250) return 'R$ 0 - R$ 250'
    if (renda <= 500) return 'R$ 251 - R$ 500'
    if (renda <= 750) return 'R$ 501 - R$ 750'
    if (renda <= 1000) return 'R$ 751 - R$ 1.000'
    if (renda <= 1250) return 'R$ 1.001 - R$ 1.250'
    if (renda <= 1500) return 'R$ 1.251 - R$ 1.500'
    if (renda <= 1750) return 'R$ 1.501 - R$ 1.750'
    if (renda <= 2000) return 'R$ 1.751 - R$ 2.000'
    return 'Acima de R$ 2.000'
  }
}

export const dashboardService = new DashboardService()







