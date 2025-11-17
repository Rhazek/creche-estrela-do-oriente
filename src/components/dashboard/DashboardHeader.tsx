'use client'

import React from 'react'
import { motion } from 'framer-motion'
import { 
  BarChart3, 
  FileText, 
  ClipboardList, 
  RotateCcw,
  FileDown
} from 'lucide-react'
import { Button } from '@/components/ui/Button'

interface DashboardHeaderProps {
  mode: 'overview' | 'matriculas' | 'pre-matriculas' | 'rematriculas'
  onModeChange: (mode: 'overview' | 'matriculas' | 'pre-matriculas' | 'rematriculas') => void
  onExportPDF?: () => void
}

export default function DashboardHeader({ 
  mode, 
  onModeChange, 
  onExportPDF 
}: DashboardHeaderProps) {
  const tabs = [
    {
      id: 'overview' as const,
      label: 'Visão Geral',
      icon: BarChart3
    },
    {
      id: 'matriculas' as const,
      label: 'Matrículas',
      icon: FileText
    },
    {
      id: 'pre-matriculas' as const,
      label: 'Pré-Matrículas',
      icon: ClipboardList
    },
    {
      id: 'rematriculas' as const,
      label: 'Rematrículas',
      icon: RotateCcw
    }
  ]

  const getTitle = () => {
    switch (mode) {
      case 'overview':
        return 'Visão Geral do Sistema'
      case 'matriculas':
        return 'Dashboard de Matrículas'
      case 'pre-matriculas':
        return 'Dashboard de Pré-Matrículas'
      case 'rematriculas':
        return 'Dashboard de Rematrículas'
      default:
        return 'Dashboard'
    }
  }

  const getSubtitle = () => {
    switch (mode) {
      case 'overview':
        return 'Estatísticas gerais de matrículas, pré-matrículas e rematrículas'
      case 'matriculas':
        return 'Análise detalhada das matrículas confirmadas'
      case 'pre-matriculas':
        return 'Acompanhamento das solicitações de pré-matrículas'
      case 'rematriculas':
        return 'Gestão das rematrículas para o próximo ano letivo'
      default:
        return 'Painel de controle do sistema'
    }
  }

  return (
    <div className="mb-8">
      {/* Título e Subtitle */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="mb-6"
      >
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          {getTitle()}
        </h1>
        <p className="text-gray-600">
          {getSubtitle()}
        </p>
      </motion.div>

      {/* Tabs de Navegação */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
        className="bg-white rounded-2xl shadow-md p-2 mb-6"
      >
        <div className="flex flex-wrap gap-2">
          {tabs.map((tab) => {
            const Icon = tab.icon
            const isActive = mode === tab.id
            
            return (
              <button
                key={tab.id}
                onClick={() => onModeChange(tab.id)}
                className={`
                  flex items-center space-x-2 px-4 py-3 rounded-xl font-medium text-sm
                  transition-all duration-200
                  ${isActive 
                    ? 'bg-primary-600 text-white shadow-md' 
                    : 'text-gray-600 hover:bg-gray-100'
                  }
                `}
              >
                <Icon className={`h-4 w-4 ${isActive ? 'text-white' : 'text-gray-500'}`} />
                <span>{tab.label}</span>
              </button>
            )
          })}
        </div>
      </motion.div>

      {/* Botões de Ação */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
        className="flex flex-wrap gap-3"
      >
        {onExportPDF && (
          <Button
            variant="outline"
            size="sm"
            onClick={onExportPDF}
            icon={<FileDown className="h-4 w-4" />}
          >
            Gerar PDF
          </Button>
        )}
      </motion.div>
    </div>
  )
}









