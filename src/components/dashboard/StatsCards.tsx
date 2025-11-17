'use client'

import React from 'react'
import { motion } from 'framer-motion'
import CountUp from 'react-countup'
import { Card, CardContent } from '@/components/ui/Card'
import { 
  Users, 
  CheckCircle, 
  Clock, 
  XCircle, 
  AlertCircle,
  TrendingUp,
  TrendingDown,
  Minus
} from 'lucide-react'

export interface StatCard {
  id: string
  title: string
  value: number
  previousValue?: number
  icon: React.ComponentType<{ className?: string }>
  color: 'primary' | 'success' | 'warning' | 'error' | 'info'
  description?: string
}

interface StatsCardsProps {
  stats: StatCard[]
  loading?: boolean
}

export default function StatsCards({ stats, loading }: StatsCardsProps) {
  const getColorClasses = (color: StatCard['color']) => {
    switch (color) {
      case 'primary':
        return {
          bg: 'bg-primary-50',
          icon: 'text-primary-600',
          iconBg: 'bg-primary-100',
          gradient: 'from-primary-50 to-primary-100'
        }
      case 'success':
        return {
          bg: 'bg-success-50',
          icon: 'text-success-600',
          iconBg: 'bg-success-100',
          gradient: 'from-success-50 to-success-100'
        }
      case 'warning':
        return {
          bg: 'bg-warning-50',
          icon: 'text-warning-600',
          iconBg: 'bg-warning-100',
          gradient: 'from-warning-50 to-warning-100'
        }
      case 'error':
        return {
          bg: 'bg-error-50',
          icon: 'text-error-600',
          iconBg: 'bg-error-100',
          gradient: 'from-error-50 to-error-100'
        }
      case 'info':
        return {
          bg: 'bg-info-50',
          icon: 'text-info-600',
          iconBg: 'bg-info-100',
          gradient: 'from-info-50 to-info-100'
        }
      default:
        return {
          bg: 'bg-gray-50',
          icon: 'text-gray-600',
          iconBg: 'bg-gray-100',
          gradient: 'from-gray-50 to-gray-100'
        }
    }
  }

  const calculateVariation = (current: number, previous?: number): { value: number; type: 'up' | 'down' | 'neutral' } => {
    if (!previous || previous === 0) return { value: 0, type: 'neutral' }
    
    const variation = ((current - previous) / previous) * 100
    
    if (variation > 0) return { value: Math.abs(variation), type: 'up' }
    if (variation < 0) return { value: Math.abs(variation), type: 'down' }
    return { value: 0, type: 'neutral' }
  }

  const formatNumber = (value: number): string => {
    if (value >= 1000000) {
      return `${(value / 1000000).toFixed(1)}M`
    }
    if (value >= 1000) {
      return `${(value / 1000).toFixed(1)}K`
    }
    return value.toString()
  }

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <div key={i} className="h-32 bg-gray-200 animate-pulse rounded-2xl" />
        ))}
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {stats.map((stat, index) => {
        const colors = getColorClasses(stat.color)
        const Icon = stat.icon
        const variation = calculateVariation(stat.value, stat.previousValue)

        return (
          <motion.div
            key={stat.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: index * 0.1 }}
          >
            <Card 
              className={`
                hover:shadow-lg transition-all duration-300
                bg-gradient-to-br ${colors.gradient}
              `}
            >
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-600 mb-2">
                      {stat.title}
                    </p>
                    
                    <div className="flex items-baseline space-x-2 mb-2">
                      <p className="text-3xl font-bold text-gray-900">
                        <CountUp
                          end={stat.value}
                          duration={1.5}
                          separator="."
                          formattingFn={(value) => formatNumber(value)}
                        />
                      </p>
                      
                      {variation.type !== 'neutral' && stat.previousValue !== undefined && (
                        <div className={`
                          flex items-center space-x-1 text-xs font-medium
                          ${variation.type === 'up' ? 'text-success-600' : 'text-error-600'}
                        `}>
                          {variation.type === 'up' ? (
                            <TrendingUp className="h-3 w-3" />
                          ) : (
                            <TrendingDown className="h-3 w-3" />
                          )}
                          <span>{variation.value.toFixed(1)}%</span>
                        </div>
                      )}
                    </div>

                    {stat.description && (
                      <p className="text-xs text-gray-500">
                        {stat.description}
                      </p>
                    )}
                  </div>

                  <div className={`
                    w-12 h-12 ${colors.iconBg} rounded-xl 
                    flex items-center justify-center
                  `}>
                    <Icon className={`h-6 w-6 ${colors.icon}`} />
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )
      })}
    </div>
  )
}

