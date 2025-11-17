// `jspdf` is imported dynamically to avoid server-side/bundler issues
import { ChartData } from './dashboard-service'
import { StatCard } from '@/components/dashboard/StatsCards'

interface PDFExportData {
  mode: string
  stats: StatCard[]
  charts: {
    title: string
    description?: string
    data: ChartData[]
    type: 'pie' | 'bar' | 'area' | 'line'
  }[]
  filters?: Record<string, any>
  generatedAt: Date
  institutionName?: string
}

export class PDFExportService {
  private doc: any
  private pageWidth: number
  private pageHeight: number
  private margin: number
  private currentY: number
  private lineHeight: number

  constructor() {
    // Don't instantiate jsPDF here (avoids importing it on the server during build).
    // We'll dynamically import and create the instance when generating the PDF.
    this.doc = undefined
    // Default to A4 dimensions in mm; will be overwritten after creating jsPDF instance.
    this.pageWidth = 210
    this.pageHeight = 297
    this.margin = 20
    this.currentY = this.margin
    this.lineHeight = 7
  }

  /**
   * Gera PDF do dashboard
   */
  async generateDashboardPDF(data: PDFExportData): Promise<void> {
    try {
      // Ensure jsPDF is loaded and instance exists (dynamic import to avoid SSR issues)
      if (!this.doc) {
        const mod = await import('jspdf')
        const { jsPDF } = mod as any
        this.doc = new jsPDF('p', 'mm', 'a4')
        // Update page dimensions from the actual document
        this.pageWidth = this.doc.internal.pageSize.getWidth()
        this.pageHeight = this.doc.internal.pageSize.getHeight()
      }
      // Cabeçalho
      this.addHeader(data)
      this.currentY += 10

      // Informações da instituição e data
      this.addMetadata(data)
      this.currentY += 10

      // Filtros aplicados (se houver)
      if (data.filters && Object.keys(data.filters).length > 0) {
        this.addFilters(data.filters)
        this.currentY += 10
      }

      // Estatísticas
      this.addStats(data.stats)
      this.currentY += 10

      // Gráficos
      this.addCharts(data.charts)

      // Rodapé
      this.addFooter(data)

      // Salvar PDF
      const fileName = this.getFileName(data.mode, data.generatedAt)
      this.doc.save(fileName)
    } catch (error) {
      console.error('Erro ao gerar PDF:', error)
      throw error
    }
  }

  /**
   * Adiciona cabeçalho do PDF
   */
  private addHeader(data: PDFExportData): void {
    // Logo/Brasão (espaço reservado)
    this.doc.setFontSize(20)
    this.doc.setFont('helvetica', 'bold')
    this.doc.text('REPÚBLICA FEDERATIVA DO BRASIL', this.pageWidth / 2, this.currentY, { align: 'center' })
    this.currentY += 8

    this.doc.setFontSize(16)
    this.doc.text('MINISTÉRIO DA EDUCAÇÃO', this.pageWidth / 2, this.currentY, { align: 'center' })
    this.currentY += 8

    this.doc.setFontSize(14)
    this.doc.setFont('helvetica', 'normal')
    const institutionName = data.institutionName || 'INSTITUIÇÃO DE ENSINO'
    this.doc.text(institutionName, this.pageWidth / 2, this.currentY, { align: 'center' })
    this.currentY += 8

    // Título do relatório
    this.doc.setFontSize(18)
    this.doc.setFont('helvetica', 'bold')
    const title = this.getReportTitle(data.mode)
    this.doc.text(title, this.pageWidth / 2, this.currentY, { align: 'center' })
    this.currentY += 8

    // Linha separadora
    this.doc.setDrawColor(0, 0, 0)
    this.doc.setLineWidth(0.5)
    this.doc.line(this.margin, this.currentY, this.pageWidth - this.margin, this.currentY)
    this.currentY += 5
  }

  /**
   * Adiciona metadados (data de geração)
   */
  private addMetadata(data: PDFExportData): void {
    this.doc.setFontSize(10)
    this.doc.setFont('helvetica', 'normal')
    const dateStr = data.generatedAt.toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
    this.doc.text(`Data de geração: ${dateStr}`, this.margin, this.currentY)
    this.currentY += 5

    const year = new Date().getFullYear()
    this.doc.text(`Ano letivo de referência: ${year}`, this.margin, this.currentY)
  }

  /**
   * Adiciona informações sobre filtros aplicados
   */
  private addFilters(filters: Record<string, any>): void {
    this.checkPageBreak(15)
    
    this.doc.setFontSize(12)
    this.doc.setFont('helvetica', 'bold')
    this.doc.text('Filtros Aplicados', this.margin, this.currentY)
    this.currentY += 6

    this.doc.setFontSize(10)
    this.doc.setFont('helvetica', 'normal')
    
    const filterLabels: Record<string, string> = {
      renda: 'Renda Familiar',
      raca: 'Raça/Cor',
      bairro: 'Bairro',
      idadeMin: 'Idade Mínima',
      idadeMax: 'Idade Máxima',
      status: 'Status',
      anoLetivo: 'Ano Letivo',
      serie: 'Série/Turma',
      necessidades: 'Necessidades Especiais'
    }

    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        const label = filterLabels[key] || key
        let displayValue = String(value)
        
        if (Array.isArray(value)) {
          displayValue = value.join(', ')
        } else if (typeof value === 'object') {
          displayValue = JSON.stringify(value)
        }
        
        const filterText = `• ${label}: ${displayValue}`
        const lines = this.doc.splitTextToSize(filterText, this.pageWidth - 2 * this.margin - 5)
        this.doc.text(lines, this.margin + 5, this.currentY)
        this.currentY += lines.length * 5
      }
    })
  }

  /**
   * Adiciona estatísticas ao PDF
   */
  private addStats(stats: StatCard[]): void {
    this.checkPageBreak(30)
    
    this.doc.setFontSize(12)
    this.doc.setFont('helvetica', 'bold')
    this.doc.text('Estatísticas Gerais', this.margin, this.currentY)
    this.currentY += 8

    // Criar tabela de estatísticas
    const colWidth = (this.pageWidth - 2 * this.margin) / 2
    let col = 0
    let row = 0
    const maxRows = Math.ceil(stats.length / 2)

    stats.forEach((stat, index) => {
      if (index > 0 && index % 2 === 0) {
        row++
        col = 0
      }

      const x = this.margin + col * colWidth
      const y = this.currentY + row * 15

      // Retângulo de fundo
      this.doc.setFillColor(245, 245, 245)
      this.doc.rect(x, y - 8, colWidth - 5, 12, 'F')

      // Título da estatística
      this.doc.setFontSize(9)
      this.doc.setFont('helvetica', 'normal')
      const titleLines = this.doc.splitTextToSize(stat.title, colWidth - 10)
      this.doc.text(titleLines, x + 2, y - 3)

      // Valor
      this.doc.setFontSize(14)
      this.doc.setFont('helvetica', 'bold')
      this.doc.text(stat.value.toString(), x + 2, y + 3)

      col = (col + 1) % 2
    })

    this.currentY += maxRows * 15 + 5
  }

  /**
   * Adiciona gráficos ao PDF (em formato de tabela)
   */
  private addCharts(charts: PDFExportData['charts']): void {
    charts.forEach((chart) => {
      this.checkPageBreak(40)
      
      // Título do gráfico
      this.doc.setFontSize(12)
      this.doc.setFont('helvetica', 'bold')
      const titleLines = this.doc.splitTextToSize(chart.title, this.pageWidth - 2 * this.margin)
      this.doc.text(titleLines, this.margin, this.currentY)
      this.currentY += titleLines.length * 5 + 2

      // Descrição
      if (chart.description) {
        this.doc.setFontSize(9)
        this.doc.setFont('helvetica', 'italic')
        const descLines = this.doc.splitTextToSize(chart.description, this.pageWidth - 2 * this.margin)
        this.doc.text(descLines, this.margin, this.currentY)
        this.currentY += descLines.length * 4 + 3
      }

      // Tabela com dados do gráfico
      this.addChartTable(chart.data)
      this.currentY += 10
    })
  }

  /**
   * Adiciona tabela de dados do gráfico
   */
  private addChartTable(data: ChartData[]): void {
    this.checkPageBreak(20 + data.length * 6)
    
    // Cabeçalho da tabela
    this.doc.setFontSize(10)
    this.doc.setFont('helvetica', 'bold')
    this.doc.setFillColor(230, 230, 230)
    
    const tableWidth = this.pageWidth - 2 * this.margin
    const nameWidth = tableWidth * 0.7
    const valueWidth = tableWidth * 0.3
    
    this.doc.rect(this.margin, this.currentY - 5, tableWidth, 6, 'F')
    this.doc.text('Categoria', this.margin + 2, this.currentY - 1)
    this.doc.text('Quantidade', this.margin + nameWidth + 2, this.currentY - 1)
    this.currentY += 3

    // Dados da tabela
    this.doc.setFont('helvetica', 'normal')
    data.forEach((item, index) => {
      // Quebrar texto longo do nome
      const nameLines = this.doc.splitTextToSize(item.name, nameWidth - 4)
      const valueStr = item.value.toString()
      
      // Calcular altura do item (mínimo 6mm)
      const itemHeight = Math.max(6, nameLines.length * 5 + 1)
      
      // Fundo alternado
      if (index % 2 === 0) {
        this.doc.setFillColor(250, 250, 250)
        this.doc.rect(this.margin, this.currentY - 4, tableWidth, itemHeight, 'F')
      }
      
      // Texto do nome (múltiplas linhas se necessário)
      this.doc.text(nameLines, this.margin + 2, this.currentY)
      
      // Valor alinhado verticalmente ao centro se o nome tiver múltiplas linhas
      const valueY = nameLines.length > 1 
        ? this.currentY + (nameLines.length - 1) * 2.5
        : this.currentY
      this.doc.text(valueStr, this.margin + nameWidth + 2, valueY)
      
      this.currentY += itemHeight
      
      // Verificar se precisa de nova página
      this.checkPageBreak(10)
    })
  }

  /**
   * Adiciona rodapé ao PDF
   */
  private addFooter(data: PDFExportData): void {
    const totalPages = this.doc.getNumberOfPages()
    
    for (let i = 1; i <= totalPages; i++) {
      this.doc.setPage(i)
      
      // Linha separadora
      this.doc.setDrawColor(200, 200, 200)
      this.doc.setLineWidth(0.3)
      this.doc.line(this.margin, this.pageHeight - 20, this.pageWidth - this.margin, this.pageHeight - 20)
      
      // Texto do rodapé
      this.doc.setFontSize(8)
      this.doc.setFont('helvetica', 'italic')
      this.doc.text(
        `Relatório gerado automaticamente pelo Sistema de Gestão de Matrículas - Página ${i} de ${totalPages}`,
        this.pageWidth / 2,
        this.pageHeight - 15,
        { align: 'center' }
      )
      
      this.doc.text(
        'Este documento é válido para fins de prestação de contas ao MEC',
        this.pageWidth / 2,
        this.pageHeight - 10,
        { align: 'center' }
      )
    }
  }

  /**
   * Verifica se precisa adicionar nova página
   */
  private checkPageBreak(requiredSpace: number): void {
    if (this.currentY + requiredSpace > this.pageHeight - 30) {
      this.doc.addPage()
      this.currentY = this.margin
    }
  }

  /**
   * Retorna título do relatório baseado no modo
   */
  private getReportTitle(mode: string): string {
    const titles: Record<string, string> = {
      'overview': 'RELATÓRIO GERAL DE MATRÍCULAS',
      'matriculas': 'RELATÓRIO DE MATRÍCULAS',
      'pre-matriculas': 'RELATÓRIO DE PRÉ-MATRÍCULAS',
      'rematriculas': 'RELATÓRIO DE REMATRÍCULAS'
    }
    return titles[mode] || 'RELATÓRIO DO DASHBOARD'
  }

  /**
   * Retorna nome do arquivo PDF
   */
  private getFileName(mode: string, date: Date): string {
    const dateStr = date.toISOString().split('T')[0]
    const modeStr = mode.replace('-', '_')
    return `relatorio_${modeStr}_${dateStr}.pdf`
  }
}

export const pdfExportService = new PDFExportService()

