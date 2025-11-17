'use client'

import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Card, CardContent } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Select } from '@/components/ui/Select'
import { 
  Filter, 
  X, 
  ChevronDown,
  ChevronUp
} from 'lucide-react'

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

interface DashboardFiltersProps {
  filters: DashboardFilters
  onFiltersChange: (filters: DashboardFilters) => void
  onClearFilters: () => void
}

export default function DashboardFilters({ 
  filters, 
  onFiltersChange, 
  onClearFilters 
}: DashboardFiltersProps) {
  const [showFilters, setShowFilters] = useState(false)

  const rendaOptions = [
    { value: '', label: 'Todas as faixas' },
    { value: 'Até 1 SM', label: 'Até 1 SM' },
    { value: '1 a 2 SM', label: '1 a 2 SM' },
    { value: '2 a 3 SM', label: '2 a 3 SM' },
    { value: 'Acima de 3 SM', label: 'Acima de 3 SM' }
  ]

  const racaOptions = [
    { value: '', label: 'Todas' },
    { value: 'Branca', label: 'Branca' },
    { value: 'Preta', label: 'Preta' },
    { value: 'Parda', label: 'Parda' },
    { value: 'Amarela', label: 'Amarela' },
    { value: 'Indígena', label: 'Indígena' }
  ]

  const statusOptions = [
    { value: '', label: 'Todos' },
    { value: 'pendente', label: 'Pendente' },
    { value: 'aprovada', label: 'Aprovada' },
    { value: 'rejeitada', label: 'Rejeitada' },
    { value: 'confirmada', label: 'Confirmada' },
    { value: 'cancelada', label: 'Cancelada' }
  ]

  const necessidadeOptions = [
    { value: 'TEA', label: 'TEA (Transtorno do Espectro Autista)' },
    { value: 'Deficiência Física', label: 'Deficiência Física' },
    { value: 'Deficiência Auditiva', label: 'Deficiência Auditiva' },
    { value: 'Deficiência Visual', label: 'Deficiência Visual' },
    { value: 'Deficiência Intelectual', label: 'Deficiência Intelectual' },
    { value: 'Altas Habilidades', label: 'Altas Habilidades' }
  ]

  const serieOptions = [
    { value: '', label: 'Todas as turmas' },
    { value: 'Berçário I', label: 'Berçário I' },
    { value: 'Berçário II', label: 'Berçário II' },
    { value: 'Maternal I', label: 'Maternal I' },
    { value: 'Maternal II', label: 'Maternal II' },
    { value: 'Pré I', label: 'Pré I' },
    { value: 'Pré II', label: 'Pré II' },
    { value: '1º Ano', label: '1º Ano' },
    { value: '2º Ano', label: '2º Ano' },
    { value: '3º Ano', label: '3º Ano' },
    { value: '4º Ano', label: '4º Ano' },
    { value: '5º Ano', label: '5º Ano' }
  ]

  const hasActiveFilters = Object.values(filters).some(value => 
    value !== undefined && value !== '' && 
    (Array.isArray(value) ? value.length > 0 : true)
  )

  const handleFilterChange = (key: keyof DashboardFilters, value: any) => {
    const newFilters = { ...filters }
    
    // Remove o filtro se o valor for vazio ou null
    if (value === '' || value === null || value === undefined || (Array.isArray(value) && value.length === 0)) {
      delete newFilters[key]
    } else {
      newFilters[key] = value
    }
    
    onFiltersChange(newFilters)
  }

  return (
    <div className="mb-6">
      {/* Botão para mostrar/esconder filtros */}
      <div className="flex items-center justify-between mb-4">
        <Button
          variant="outline"
          onClick={() => setShowFilters(!showFilters)}
          icon={showFilters ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
        >
          {showFilters ? 'Ocultar Filtros' : 'Mostrar Filtros'}
          {hasActiveFilters && (
            <span className="ml-2 bg-primary-600 text-white text-xs rounded-full px-2 py-0.5">
              {Object.values(filters).filter(v => v !== undefined && v !== '' && (Array.isArray(v) ? v.length > 0 : true)).length}
            </span>
          )}
        </Button>

        {hasActiveFilters && (
          <Button
            variant="outline"
            onClick={onClearFilters}
            icon={<X className="h-4 w-4" />}
            className="text-error-600 border-error-600 hover:bg-error-50"
          >
            Limpar Filtros
          </Button>
        )}
      </div>

      {/* Painel de Filtros */}
      <AnimatePresence>
        {showFilters && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
          >
            <Card className="shadow-md">
              <CardContent className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {/* Filtro de Renda */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Renda Familiar
                    </label>
                    <Select
                      value={filters.renda || ''}
                      onChange={(e) => handleFilterChange('renda', e.target.value)}
                    >
                      {rendaOptions.map(option => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </Select>
                  </div>

                  {/* Filtro de Raça */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Raça/Cor
                    </label>
                    <Select
                      value={filters.raca || ''}
                      onChange={(e) => handleFilterChange('raca', e.target.value)}
                    >
                      {racaOptions.map(option => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </Select>
                  </div>

                  {/* Filtro de Bairro */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Bairro
                    </label>
                    <Input
                      type="text"
                      value={filters.bairro || ''}
                      onChange={(e) => handleFilterChange('bairro', e.target.value)}
                      placeholder="Digite o bairro"
                    />
                  </div>

                  {/* Filtro de Idade Mínima */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Idade Mínima (anos)
                    </label>
                    <Input
                      type="number"
                      value={filters.idadeMin !== undefined ? filters.idadeMin : ''}
                      onChange={(e) => {
                        const value = e.target.value === '' ? undefined : parseInt(e.target.value)
                        handleFilterChange('idadeMin', value !== undefined && !isNaN(value) ? value : undefined)
                      }}
                      placeholder="0"
                      min="0"
                      max="18"
                    />
                  </div>

                  {/* Filtro de Idade Máxima */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Idade Máxima (anos)
                    </label>
                    <Input
                      type="number"
                      value={filters.idadeMax !== undefined ? filters.idadeMax : ''}
                      onChange={(e) => {
                        const value = e.target.value === '' ? undefined : parseInt(e.target.value)
                        handleFilterChange('idadeMax', value !== undefined && !isNaN(value) ? value : undefined)
                      }}
                      placeholder="18"
                      min="0"
                      max="18"
                    />
                  </div>

                  {/* Filtro de Status */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Status
                    </label>
                    <Select
                      value={filters.status || ''}
                      onChange={(e) => handleFilterChange('status', e.target.value)}
                    >
                      {statusOptions.map(option => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </Select>
                  </div>

                  {/* Filtro de Ano Letivo */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Ano Letivo
                    </label>
                    <Input
                      type="text"
                      value={filters.anoLetivo || ''}
                      onChange={(e) => handleFilterChange('anoLetivo', e.target.value)}
                      placeholder="Ex: 2025"
                    />
                  </div>

                  {/* Filtro de Turma/Série */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Turma/Série
                    </label>
                    <Select
                      value={filters.serie || ''}
                      onChange={(e) => handleFilterChange('serie', e.target.value)}
                    >
                      {serieOptions.map(option => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </Select>
                  </div>
                </div>

                {/* Filtro de Necessidades Especiais (Multi-select) */}
                <div className="mt-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Necessidades Especiais
                  </label>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
                    {necessidadeOptions.map(option => (
                      <label key={option.value} className="flex items-center space-x-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={filters.necessidades?.includes(option.value) || false}
                          onChange={(e) => {
                            const currentNecessidades = filters.necessidades || []
                            const newNecessidades = e.target.checked
                              ? [...currentNecessidades, option.value]
                              : currentNecessidades.filter(n => n !== option.value)
                            handleFilterChange('necessidades', newNecessidades)
                          }}
                          className="w-4 h-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
                        />
                        <span className="text-sm text-gray-700">{option.label}</span>
                      </label>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}







