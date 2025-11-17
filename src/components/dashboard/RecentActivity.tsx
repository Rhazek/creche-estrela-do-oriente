'use client'

import React from 'react'
import { motion } from 'framer-motion'
import { Card, CardContent, CardHeader } from '@/components/ui/Card'
import { 
  UserPlus, 
  CheckCircle, 
  XCircle, 
  Clock,
  Edit,
  FileText,
  ClipboardList
} from 'lucide-react'

export interface Activity {
  id: string
  type: 'matricula' | 'pre-matricula' | 'rematricula' | 'approval' | 'rejection'
  title: string
  description: string
  user: string
  timestamp: Date
}

interface RecentActivityProps {
  activities: Activity[]
  loading?: boolean
}

export default function RecentActivity({ activities, loading }: RecentActivityProps) {
  const getActivityConfig = (type: Activity['type']) => {
    switch (type) {
      case 'matricula':
        return {
          icon: FileText,
          color: 'text-primary-600',
          bgColor: 'bg-primary-100'
        }
      case 'pre-matricula':
        return {
          icon: ClipboardList,
          color: 'text-info-600',
          bgColor: 'bg-info-100'
        }
      case 'rematricula':
        return {
          icon: Edit,
          color: 'text-warning-600',
          bgColor: 'bg-warning-100'
        }
      case 'approval':
        return {
          icon: CheckCircle,
          color: 'text-success-600',
          bgColor: 'bg-success-100'
        }
      case 'rejection':
        return {
          icon: XCircle,
          color: 'text-error-600',
          bgColor: 'bg-error-100'
        }
      default:
        return {
          icon: Clock,
          color: 'text-gray-600',
          bgColor: 'bg-gray-100'
        }
    }
  }

  const formatTimestamp = (date: Date): string => {
    const now = new Date()
    const diff = now.getTime() - date.getTime()
    const minutes = Math.floor(diff / 60000)
    const hours = Math.floor(diff / 3600000)
    const days = Math.floor(diff / 86400000)

    if (minutes < 1) return 'Agora'
    if (minutes < 60) return `${minutes} min atrás`
    if (hours < 24) return `${hours}h atrás`
    if (days < 7) return `${days}d atrás`
    
    return date.toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    })
  }

  if (loading) {
    return (
      <Card className="shadow-md">
        <CardHeader title="Atividades Recentes" />
        <CardContent>
          <div className="space-y-4">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="flex items-center space-x-4">
                <div className="w-10 h-10 bg-gray-200 animate-pulse rounded-full" />
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-gray-200 animate-pulse rounded w-3/4" />
                  <div className="h-3 bg-gray-200 animate-pulse rounded w-1/2" />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.5 }}
    >
      <Card className="shadow-md hover:shadow-lg transition-shadow duration-300">
        <CardHeader
          title="Atividades Recentes"
          subtitle="Últimas ações realizadas no sistema"
        />
        <CardContent>
          {activities.length === 0 ? (
            <div className="text-center py-8">
              <Clock className="h-12 w-12 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-500">Nenhuma atividade recente</p>
            </div>
          ) : (
            <div className="space-y-4">
              {activities.map((activity, index) => {
                const config = getActivityConfig(activity.type)
                const Icon = config.icon

                return (
                  <motion.div
                    key={activity.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.3, delay: index * 0.1 }}
                    className="flex items-start space-x-4 p-3 rounded-lg hover:bg-gray-50 transition-colors duration-200"
                  >
                    <div className={`
                      w-10 h-10 ${config.bgColor} rounded-full 
                      flex items-center justify-center flex-shrink-0
                    `}>
                      <Icon className={`h-5 w-5 ${config.color}`} />
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900">
                        {activity.title}
                      </p>
                      <p className="text-xs text-gray-500 mt-1">
                        {activity.description}
                      </p>
                      <div className="flex items-center space-x-2 mt-2">
                        <span className="text-xs text-gray-400">
                          {activity.user}
                        </span>
                        <span className="text-xs text-gray-400">•</span>
                        <span className="text-xs text-gray-400">
                          {formatTimestamp(activity.timestamp)}
                        </span>
                      </div>
                    </div>
                  </motion.div>
                )
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  )
}










