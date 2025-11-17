'use client'

import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import AuthGuard from '@/components/AuthGuard'
import RoleGuard from '@/components/RoleGuard'
import { Container } from '@/components/layout/LayoutWrapper'
import DashboardHeader from '@/components/dashboard/DashboardHeader'
import StatsCards, { StatCard } from '@/components/dashboard/StatsCards'
import DashboardChart, { ChartConfig } from '@/components/dashboard/DashboardChart'
import DashboardFilters, { DashboardFilters as Filters } from '@/components/dashboard/DashboardFilters'
// RecentActivity removed per design: section not required
import { dashboardService } from '@/lib/dashboard-service'
import { 
  Users, 
  CheckCircle, 
  Clock, 
  XCircle,
  AlertCircle,
  DollarSign,
  FileText
} from 'lucide-react'
import toast from 'react-hot-toast'
import { pdfExportService } from '@/lib/pdf-export-service'

type DashboardMode = 'overview' | 'matriculas' | 'pre-matriculas' | 'rematriculas'

export default function DashboardPage() {
  const [mode, setMode] = useState<DashboardMode>('overview')
  const [filters, setFilters] = useState<Filters>({})
  const [stats, setStats] = useState<StatCard[]>([])
  const [charts, setCharts] = useState<ChartConfig[]>([])
  // activities removed — section not shown
  const [loading, setLoading] = useState(true)

  // Carregar dados quando o modo ou filtros mudarem
  useEffect(() => {
    loadDashboardData()
  }, [mode, filters])

  const loadDashboardData = async () => {
    try {
      setLoading(true)

      // Carregar estatísticas
      const statsData = await loadStats()
      setStats(statsData)

      // Carregar gráficos
      const chartsData = await loadCharts()
      setCharts(chartsData)

      // atividades recentes: removidas (não exibidas no dashboard)

    } catch (error) {
      console.error('Erro ao carregar dados do dashboard:', error)
      toast.error('Erro ao carregar dados do dashboard')
    } finally {
      setLoading(false)
    }
  }

  const loadStats = async (): Promise<StatCard[]> => {
    let statsData

    switch (mode) {
      case 'overview':
        statsData = await dashboardService.getOverviewStats(filters)
        return [
          {
            id: 'total',
            title: 'Total Geral',
            value: statsData.total,
            icon: Users,
            color: 'primary',
            description: 'Total de registros no sistema'
          },
          {
            id: 'pendentes',
            title: 'Pendentes',
            value: statsData.pendentes,
            icon: Clock,
            color: 'warning',
            description: 'Aguardando processamento'
          },
          {
            id: 'aprovadas',
            title: 'Aprovadas',
            value: statsData.aprovadas,
            icon: CheckCircle,
            color: 'success',
            description: 'Confirmadas e ativas'
          },
          {
            id: 'rejeitadas',
            title: 'Rejeitadas',
            value: statsData.rejeitadas,
            icon: XCircle,
            color: 'error',
            description: 'Não aprovadas'
          },
          {
            id: 'canceladas',
            title: 'Canceladas',
            value: statsData.canceladas,
            icon: XCircle,
            color: 'error',
            description: 'Canceladas pelo usuário'
          },
          {
            id: 'necessidades',
            title: 'Necessidades Especiais',
            value: statsData.comNecessidadesEspeciais,
            icon: AlertCircle,
            color: 'info',
            description: 'Alunos com necessidades especiais'
          },
          {
            id: 'auxilio',
            title: 'Com Auxílio Governo',
            value: statsData.comAuxilioGoverno,
            icon: DollarSign,
            color: 'info',
            description: 'Beneficiários de programas sociais'
          }
        ]

      case 'matriculas':
        statsData = await dashboardService.getMatriculasStats(filters)
        return [
          {
            id: 'total',
            title: 'Total de Matrículas',
            value: statsData.total,
            icon: FileText,
            color: 'primary',
            description: 'Matrículas registradas'
          },
          {
            id: 'pendentes',
            title: 'Pendentes',
            value: statsData.pendentes,
            icon: Clock,
            color: 'warning',
            description: 'Aguardando confirmação'
          },
          {
            id: 'confirmadas',
            title: 'Confirmadas',
            value: statsData.aprovadas,
            icon: CheckCircle,
            color: 'success',
            description: 'Matrículas ativas'
          },
          {
            id: 'canceladas',
            title: 'Canceladas',
            value: statsData.canceladas,
            icon: XCircle,
            color: 'error',
            description: 'Matrículas canceladas'
          },
          {
            id: 'necessidades',
            title: 'Necessidades Especiais',
            value: statsData.comNecessidadesEspeciais,
            icon: AlertCircle,
            color: 'info',
            description: 'Alunos com necessidades especiais'
          },
          {
            id: 'auxilio',
            title: 'Com Auxílio Governo',
            value: statsData.comAuxilioGoverno,
            icon: DollarSign,
            color: 'info',
            description: 'Beneficiários de programas sociais'
          }
        ]

      case 'pre-matriculas':
        statsData = await dashboardService.getPreMatriculasStats(filters)
        return [
          {
            id: 'total',
            title: 'Total de Pré-Matrículas',
            value: statsData.total,
            icon: FileText,
            color: 'primary',
            description: 'Solicitações recebidas'
          },
          {
            id: 'analise',
            title: 'Em Análise',
            value: statsData.pendentes,
            icon: Clock,
            color: 'warning',
            description: 'Aguardando avaliação'
          },
          {
            id: 'aprovadas',
            title: 'Aprovadas',
            value: statsData.aprovadas,
            icon: CheckCircle,
            color: 'success',
            description: 'Aprovadas para matrícula'
          },
          {
            id: 'rejeitadas',
            title: 'Rejeitadas',
            value: statsData.rejeitadas,
            icon: XCircle,
            color: 'error',
            description: 'Não aprovadas'
          },
          {
            id: 'necessidades',
            title: 'Necessidades Especiais',
            value: statsData.comNecessidadesEspeciais,
            icon: AlertCircle,
            color: 'info',
            description: 'Alunos com necessidades especiais'
          },
          {
            id: 'auxilio',
            title: 'Com Auxílio Governo',
            value: statsData.comAuxilioGoverno,
            icon: DollarSign,
            color: 'info',
            description: 'Beneficiários de programas sociais'
          }
        ]

      case 'rematriculas':
        statsData = await dashboardService.getRematriculasStats(filters)
        return [
          {
            id: 'total',
            title: 'Total de Rematrículas',
            value: statsData.total,
            icon: FileText,
            color: 'primary',
            description: 'Rematrículas solicitadas'
          },
          {
            id: 'pendentes',
            title: 'Pendentes',
            value: statsData.pendentes,
            icon: Clock,
            color: 'warning',
            description: 'Aguardando confirmação'
          },
          {
            id: 'confirmadas',
            title: 'Confirmadas',
            value: statsData.aprovadas,
            icon: CheckCircle,
            color: 'success',
            description: 'Rematrículas confirmadas'
          },
          {
            id: 'canceladas',
            title: 'Canceladas',
            value: statsData.canceladas,
            icon: XCircle,
            color: 'error',
            description: 'Rematrículas canceladas'
          }
        ]

      default:
        return []
    }
  }

  const loadCharts = async (): Promise<ChartConfig[]> => {
    const collectionName = getCollectionName()

    try {
      const [porRaca, porRendaPerCapita, porSexo, porIdade, auxilioGoverno, necessidadesEspeciais] = await Promise.all([
        dashboardService.getChartDataPorRaca(collectionName, filters),
        dashboardService.getChartDataPorRendaPerCapita(collectionName, filters),
        dashboardService.getChartDataPorSexo(collectionName, filters),
        dashboardService.getChartDataPorIdade(collectionName, filters),
        dashboardService.getChartDataAuxilioGoverno(collectionName, filters),
        dashboardService.getChartDataNecessidadesEspeciais(collectionName, filters)
      ])

      return [
        {
          type: 'pie',
          title: 'Distribuição por Raça/Cor',
          description: 'Distribuição dos alunos por raça/cor declarada',
          data: porRaca,
          dataKey: 'value',
          colors: ['#0d833a', '#10b981', '#f59e0b', '#ef4444', '#3b82f6', '#8b5cf6']
        },
        {
          type: 'bar',
          title: 'Distribuição por Renda Per Capita',
          description: 'Quantidade de alunos por faixa de renda per capita',
          data: porRendaPerCapita,
          dataKey: 'value',
          colors: ['#0d833a']
        },
        {
          type: 'pie',
          title: 'Distribuição por Sexo',
          description: 'Distribuição dos alunos por sexo',
          data: porSexo,
          dataKey: 'value',
          colors: ['#0d833a', '#10b981']
        },
        {
          type: 'bar',
          title: 'Distribuição por Idade',
          description: 'Quantidade de alunos por faixa etária',
          data: porIdade,
          dataKey: 'value',
          colors: ['#10b981']
        },
        {
          type: 'pie',
          title: 'Auxílio do Governo',
          description: 'Distribuição de alunos que recebem auxílio governamental',
          data: auxilioGoverno,
          dataKey: 'value',
          colors: ['#f59e0b', '#ef4444']
        },
        {
          type: 'pie',
          title: 'Necessidades Especiais',
          description: 'Distribuição de alunos com necessidades especiais',
          data: necessidadesEspeciais,
          dataKey: 'value',
          colors: ['#3b82f6', '#8b5cf6']
        }
      ]
    } catch (error) {
      console.error('Erro ao carregar gráficos:', error)
      return []
    }
  }

  const getCollectionName = (): string => {
    switch (mode) {
      case 'matriculas':
      case 'rematriculas':
        return 'enrollments'
      case 'pre-matriculas':
        return 'pre_enrollments'
      case 'overview':
        return 'enrollments' // Usar enrollments como padrão
      default:
        return 'enrollments'
    }
  }

  // Exportar CSV removido do dashboard

  const handleExportPDF = async () => {
    try {
      toast.loading('Gerando PDF...', { id: 'pdf-export' })
      
      await pdfExportService.generateDashboardPDF({
        mode,
        stats,
        charts: charts.map(chart => ({
          title: chart.title,
          description: chart.description,
          data: chart.data,
          type: chart.type
        })),
        filters,
        generatedAt: new Date(),
        institutionName: 'Creche Escola' // Você pode tornar isso configurável
      })
      
      toast.success('PDF gerado com sucesso!', { id: 'pdf-export' })
    } catch (error) {
      console.error('Erro ao gerar PDF:', error)
      toast.error('Erro ao gerar PDF. Tente novamente.', { id: 'pdf-export' })
    }
  }

  const handleClearFilters = () => {
    setFilters({})
    toast.success('Filtros limpos')
  }

  return (
    <AuthGuard>
      <RoleGuard allowedRoles={['administrador', 'funcionario']}>
        <Container>
          {/* Header com Tabs */}
          <DashboardHeader
            mode={mode}
            onModeChange={setMode}
            onExportPDF={handleExportPDF}
          />

          {/* Filtros */}
          <DashboardFilters
            filters={filters}
            onFiltersChange={setFilters}
            onClearFilters={handleClearFilters}
          />

          {/* Cards de Estatísticas */}
          <StatsCards stats={stats} loading={loading} />

          {/* Gráficos */}
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6 mt-6">
            {charts.map((chart, index) => (
              <DashboardChart key={index} config={chart} loading={loading} />
            ))}
            </div>

          {/* Atividades Recentes removidas conforme solicitação */}
        </Container>
      </RoleGuard>
    </AuthGuard>
  )
}
