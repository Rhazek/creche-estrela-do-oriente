'use client'

import React from 'react'
import { Card, CardContent, CardHeader } from '@/components/ui/Card'
import { motion } from 'framer-motion'
import {
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts'

export interface ChartData {
  name: string
  value: number
  [key: string]: string | number
}

export interface ChartConfig {
  type: 'bar' | 'pie' | 'line' | 'area'
  data: ChartData[]
  dataKey: string
  colors?: string[]
  title: string
  description?: string
  height?: number
}

interface DashboardChartProps {
  config: ChartConfig
  loading?: boolean
}

const COLORS = [
  '#0d833a', // primary-600
  '#10b981', // success-500
  '#f59e0b', // warning-500
  '#ef4444', // error-500
  '#3b82f6', // info-500
  '#8b5cf6', // purple-500
  '#ec4899', // pink-500
  '#14b8a6', // teal-500
]

export default function DashboardChart({ config, loading }: DashboardChartProps) {
  const renderChart = () => {
    if (loading) {
      return (
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600" />
        </div>
      )
    }

    switch (config.type) {
      case 'bar':
        return (
          <ResponsiveContainer width="100%" height={config.height || 300}>
            <BarChart data={config.data}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis 
                dataKey="name" 
                stroke="#6b7280"
                style={{ fontSize: '12px' }}
              />
              <YAxis 
                stroke="#6b7280"
                style={{ fontSize: '12px' }}
              />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: '#fff',
                  border: '1px solid #e5e7eb',
                  borderRadius: '8px',
                  boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                }}
              />
              <Legend />
              <Bar 
                dataKey={config.dataKey} 
                fill={config.colors?.[0] || COLORS[0]}
                radius={[8, 8, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        )

      case 'pie':
        return (
          <ResponsiveContainer width="100%" height={config.height || 300}>
            <PieChart>
              <Pie
                data={config.data}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name}: ${(Number(percent) * 100).toFixed(0)}%`}
                outerRadius={100}
                fill="#8884d8"
                dataKey={config.dataKey}
              >
                {config.data.map((entry, index) => (
                  <Cell 
                    key={`cell-${index}`} 
                    fill={config.colors?.[index] || COLORS[index % COLORS.length]} 
                  />
                ))}
              </Pie>
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: '#fff',
                  border: '1px solid #e5e7eb',
                  borderRadius: '8px',
                  boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                }}
              />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        )

      case 'line':
        return (
          <ResponsiveContainer width="100%" height={config.height || 300}>
            <LineChart data={config.data}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis 
                dataKey="name" 
                stroke="#6b7280"
                style={{ fontSize: '12px' }}
              />
              <YAxis 
                stroke="#6b7280"
                style={{ fontSize: '12px' }}
              />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: '#fff',
                  border: '1px solid #e5e7eb',
                  borderRadius: '8px',
                  boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                }}
              />
              <Legend />
              <Line 
                type="monotone" 
                dataKey={config.dataKey} 
                stroke={config.colors?.[0] || COLORS[0]}
                strokeWidth={2}
                dot={{ fill: config.colors?.[0] || COLORS[0], r: 4 }}
                activeDot={{ r: 6 }}
              />
            </LineChart>
          </ResponsiveContainer>
        )

      case 'area':
        return (
          <ResponsiveContainer width="100%" height={config.height || 300}>
            <LineChart data={config.data}>
              <defs>
                <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={config.colors?.[0] || COLORS[0]} stopOpacity={0.8}/>
                  <stop offset="95%" stopColor={config.colors?.[0] || COLORS[0]} stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis 
                dataKey="name" 
                stroke="#6b7280"
                style={{ fontSize: '12px' }}
              />
              <YAxis 
                stroke="#6b7280"
                style={{ fontSize: '12px' }}
              />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: '#fff',
                  border: '1px solid #e5e7eb',
                  borderRadius: '8px',
                  boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                }}
              />
              <Legend />
              <Line 
                type="monotone" 
                dataKey={config.dataKey} 
                stroke={config.colors?.[0] || COLORS[0]}
                strokeWidth={2}
                fill="url(#colorValue)"
                dot={{ fill: config.colors?.[0] || COLORS[0], r: 4 }}
                activeDot={{ r: 6 }}
              />
            </LineChart>
          </ResponsiveContainer>
        )

      default:
        return null
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <Card className="shadow-md hover:shadow-lg transition-shadow duration-300">
        <CardHeader
          title={config.title}
          subtitle={config.description}
        />
        <CardContent>
          {renderChart()}
        </CardContent>
      </Card>
    </motion.div>
  )
}










