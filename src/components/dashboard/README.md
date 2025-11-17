# 📊 Dashboard Module

Módulo completo de dashboard para o sistema da Creche Escola Estrela do Oriente.

## 🎯 Funcionalidades

- **Múltiplos Dashboards**: Visão Geral, Matrículas, Pré-Matrículas e Rematrículas
- **Filtros Avançados**: Renda, raça, bairro, idade, necessidades especiais, ano letivo, status
- **Gráficos Dinâmicos**: Pizza, barras, linhas e áreas com Recharts
- **Estatísticas em Tempo Real**: Cards com contadores animados
- **Atividades Recentes**: Timeline das últimas ações do sistema
- **Exportação**: CSV e PDF (planejado)

## 📁 Estrutura de Componentes

```
src/components/dashboard/
├── DashboardHeader.tsx      # Cabeçalho com tabs e botões de ação
├── StatsCards.tsx           # Cards de estatísticas com contadores animados
├── DashboardChart.tsx       # Componente de gráficos (Recharts)
├── DashboardFilters.tsx     # Painel de filtros avançados
├── RecentActivity.tsx       # Timeline de atividades recentes
└── README.md               # Esta documentação
```

## 🧩 Componentes

### 1. DashboardHeader

**Props:**
```typescript
interface DashboardHeaderProps {
  mode: 'overview' | 'matriculas' | 'pre-matriculas' | 'rematriculas'
  onModeChange: (mode) => void
  onExportCSV?: () => void
  onExportPDF?: () => void
}
```

**Funcionalidades:**
- Navegação entre modos de dashboard
- Botões para exportar dados
- Título e subtítulo dinâmicos por modo

### 2. StatsCards

**Props:**
```typescript
interface StatsCardsProps {
  stats: StatCard[]
  loading?: boolean
}

interface StatCard {
  id: string
  title: string
  value: number
  previousValue?: number
  icon: React.ComponentType
  color: 'primary' | 'success' | 'warning' | 'error' | 'info'
  description?: string
}
```

**Funcionalidades:**
- Cards com contadores animados (react-countup)
- Cores temáticas por tipo de estatística
- Indicadores de variação (trending up/down)
- Layout responsivo em grid

### 3. DashboardChart

**Props:**
```typescript
interface DashboardChartProps {
  config: ChartConfig
  loading?: boolean
}

interface ChartConfig {
  type: 'bar' | 'pie' | 'line' | 'area'
  data: ChartData[]
  dataKey: string
  colors?: string[]
  title: string
  description?: string
  height?: number
}
```

**Funcionalidades:**
- Suporte para 4 tipos de gráficos (bar, pie, line, area)
- Responsivo com ResponsiveContainer
- Tooltips e legendas personalizadas
- Paleta de cores configurável

### 4. DashboardFilters

**Props:**
```typescript
interface DashboardFiltersProps {
  filters: DashboardFilters
  onFiltersChange: (filters) => void
  onClearFilters: () => void
}

interface DashboardFilters {
  renda?: string
  raca?: string
  bairro?: string
  idadeMin?: number
  idadeMax?: number
  necessidades?: string[]
  anoLetivo?: string
  status?: string
}
```

**Funcionalidades:**
- Painel expansível de filtros
- Filtros por faixa de renda, raça, bairro, idade, necessidades especiais
- Multi-select para necessidades especiais
- Botão para limpar todos os filtros
- Indicador visual de filtros ativos

### 5. RecentActivity

**Props:**
```typescript
interface RecentActivityProps {
  activities: Activity[]
  loading?: boolean
}

interface Activity {
  id: string
  type: 'matricula' | 'pre-matricula' | 'rematricula' | 'approval' | 'rejection'
  title: string
  description: string
  user: string
  timestamp: Date
}
```

**Funcionalidades:**
- Timeline de atividades recentes
- Ícones e cores por tipo de atividade
- Formatação de timestamp relativo
- Layout responsivo

## 🔧 Serviço de Dashboard

### DashboardService (`src/lib/dashboard-service.ts`)

**Métodos Principais:**

```typescript
// Estatísticas
getOverviewStats(filters?): Promise<DashboardStats>
getMatriculasStats(filters?): Promise<DashboardStats>
getPreMatriculasStats(filters?): Promise<DashboardStats>
getRematriculasStats(filters?): Promise<DashboardStats>

// Dados para gráficos
getChartDataPorRaca(collection, filters?): Promise<ChartData[]>
getChartDataPorRenda(collection, filters?): Promise<ChartData[]>
getChartDataPorBairro(collection, filters?): Promise<ChartData[]>
getChartDataEvolucaoMensal(collection, filters?): Promise<ChartData[]>

// Atividades
getRecentActivities(limit?): Promise<Activity[]>
```

**Estrutura de Dados:**

```typescript
interface DashboardStats {
  total: number
  pendentes: number
  aprovadas: number
  rejeitadas: number
  canceladas: number
  comNecessidadesEspeciais: number
  comAuxilioGoverno: number
}
```

## 📊 Como Adicionar Novos Filtros

1. **Adicione o filtro ao tipo `DashboardFilters`:**
```typescript
interface DashboardFilters {
  // ... filtros existentes
  novoFiltro?: string
}
```

2. **Adicione o campo no componente `DashboardFilters.tsx`:**
```tsx
<div>
  <label className="block text-sm font-medium text-gray-700 mb-2">
    Novo Filtro
  </label>
  <Input
    value={filters.novoFiltro || ''}
    onChange={(e) => handleFilterChange('novoFiltro', e.target.value)}
  />
</div>
```

3. **Implemente a lógica no `DashboardService`:**
```typescript
private buildQuery(collectionName: string, filters?: DashboardFilters) {
  const constraints: QueryConstraint[] = []
  
  if (filters?.novoFiltro) {
    constraints.push(where('campoNoFirestore', '==', filters.novoFiltro))
  }
  
  // ... resto do código
}
```

## 📈 Como Adicionar Novos Gráficos

1. **Crie o método no `DashboardService`:**
```typescript
async getChartDataPorNovoCampo(collectionName: string, filters?: DashboardFilters): Promise<ChartData[]> {
  try {
    const q = this.buildQuery(collectionName, filters)
    const snapshot = await getDocs(q)
    const docs = snapshot.docs.map(doc => doc.data())

    const count: Record<string, number> = {}
    
    docs.forEach(doc => {
      const valor = doc.novoCampo || 'Não informado'
      count[valor] = (count[valor] || 0) + 1
    })

    return Object.entries(count).map(([name, value]) => ({ name, value }))
  } catch (error) {
    console.error('Erro ao buscar dados:', error)
    throw error
  }
}
```

2. **Adicione o gráfico na página do dashboard:**
```typescript
const loadCharts = async (): Promise<ChartConfig[]> => {
  const [porNovoCampo] = await Promise.all([
    dashboardService.getChartDataPorNovoCampo(collectionName, filters)
  ])

  return [
    // ... gráficos existentes
    {
      type: 'bar',
      title: 'Distribuição por Novo Campo',
      description: 'Descrição do gráfico',
      data: porNovoCampo,
      dataKey: 'value',
      colors: ['#0d833a']
    }
  ]
}
```

## 🔒 Segurança

- Acesso apenas para usuários autenticados com roles `ADMIN` ou `SECRETARIA`
- Campos sensíveis (CPF, telefone, renda exata) não são exibidos
- Consultas Firestore otimizadas com `where` e `limit`

## 🎨 Personalização

### Cores

As cores do sistema seguem o padrão TailwindCSS:
- Primary: `#0d833a` (verde)
- Success: `#10b981`
- Warning: `#f59e0b`
- Error: `#ef4444`
- Info: `#3b82f6`

### Tipografia

- Fonte principal: Inter ou Poppins
- Títulos: `font-bold`
- Subtítulos: `font-medium`
- Texto normal: `font-normal`

### Animações

- Framer Motion para transições suaves
- React CountUp para contadores animados
- Duração padrão: 0.5s

## 📝 Estrutura de Dados Esperada do Firestore

### Coleção: `enrollments`

```typescript
{
  nomeCrianca: string
  raca: string
  corRaca: string
  rendaFamiliar: string
  bairro: string
  status: 'pendente_matricula' | 'confirmada' | 'cancelada'
  serie: string
  anoLetivo: string
  necessidadesEspeciais: boolean
  possuiNecessidadesEspeciais: boolean
  necessidadesEspeciaisDescricao: string
  recebeAuxilioGoverno: boolean
  tipoAuxilio: string
  numeroNIS: string
  criadoEm: Timestamp
  atualizadoEm: Timestamp
  criadoPor: string
  rematricula: boolean
}
```

### Coleção: `pre_enrollments`

```typescript
{
  nomeCrianca: string
  raca: string
  rendaFamiliarEstimada: string
  bairro: string
  status: 'analise' | 'aprovada' | 'rejeitada'
  necessidadesEspeciais: boolean
  descricaoNecessidade: string
  criadoEm: Timestamp
  avaliadoPor: string
  dataDecisao: Timestamp
}
```

## 🚀 Como Usar

1. **Importe os componentes:**
```tsx
import DashboardHeader from '@/components/dashboard/DashboardHeader'
import StatsCards from '@/components/dashboard/StatsCards'
import DashboardChart from '@/components/dashboard/DashboardChart'
import DashboardFilters from '@/components/dashboard/DashboardFilters'
import RecentActivity from '@/components/dashboard/RecentActivity'
```

2. **Use na página:**
```tsx
<DashboardHeader
  mode={mode}
  onModeChange={setMode}
  onExportCSV={handleExportCSV}
  onExportPDF={handleExportPDF}
/>

<DashboardFilters
  filters={filters}
  onFiltersChange={setFilters}
  onClearFilters={handleClearFilters}
/>

<StatsCards stats={stats} loading={loading} />

<DashboardChart config={chart} loading={loading} />

<RecentActivity activities={activities} loading={loading} />
```

## 🐛 Troubleshooting

### Gráficos não aparecem

- Verifique se o Recharts está instalado: `npm install recharts`
- Verifique se os dados estão no formato correto
- Verifique o console para erros

### Filtros não funcionam

- Verifique se as regras do Firestore permitem leitura
- Verifique se os campos existem na coleção
- Verifique o console para erros de permissão

### Performance lenta

- Reduza o número de documentos retornados com `limit()`
- Use índices compostos no Firestore
- Implemente paginação para grandes volumes de dados

## 📚 Recursos Adicionais

- [Recharts Documentation](https://recharts.org/)
- [React CountUp](https://www.npmjs.com/package/react-countup)
- [Framer Motion](https://www.framer.com/motion/)
- [TailwindCSS](https://tailwindcss.com/)
- [Firebase Firestore](https://firebase.google.com/docs/firestore)

## 🤝 Contribuindo

Para adicionar novas funcionalidades ao dashboard:

1. Crie uma branch: `git checkout -b feature/nova-funcionalidade`
2. Implemente a funcionalidade
3. Teste localmente
4. Faça commit: `git commit -m "feat: adiciona nova funcionalidade"`
5. Push: `git push origin feature/nova-funcionalidade`
6. Abra um Pull Request

## 📄 Licença

Este módulo faz parte do sistema da Creche Escola Estrela do Oriente.









