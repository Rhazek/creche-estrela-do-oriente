'use client'

import { Button } from '@/components/ui/Button'
import { AlertTriangle, CheckCircle, XCircle, Info } from 'lucide-react'

interface ConfirmationModalProps {
  title: string
  message: string
  onConfirm: () => void
  onCancel: () => void
  loading?: boolean
  confirmText?: string
  cancelText?: string
  confirmVariant?: 'default' | 'success' | 'danger' | 'warning'
  icon?: 'warning' | 'success' | 'danger' | 'info'
}

export function ConfirmationModal({
  title,
  message,
  onConfirm,
  onCancel,
  loading = false,
  confirmText = 'Confirmar',
  cancelText = 'Cancelar',
  confirmVariant = 'default',
  icon = 'warning'
}: ConfirmationModalProps) {
  const getIcon = () => {
    switch (icon) {
      case 'success':
        return <CheckCircle className="w-6 h-6 text-green-600" />
      case 'danger':
        return <XCircle className="w-6 h-6 text-red-600" />
      case 'info':
        return <Info className="w-6 h-6 text-blue-600" />
      default:
        return <AlertTriangle className="w-6 h-6 text-yellow-600" />
    }
  }

  const getConfirmButtonVariant = () => {
    switch (confirmVariant) {
      case 'success':
        return 'bg-green-600 hover:bg-green-700 text-white'
      case 'danger':
        return 'bg-red-600 hover:bg-red-700 text-white'
      case 'warning':
        return 'bg-yellow-600 hover:bg-yellow-700 text-white'
      default:
        return 'bg-primary-600 hover:bg-primary-700 text-white'
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg max-w-md w-full p-6">
        <div className="flex items-center gap-3 mb-4">
          {getIcon()}
          <h3 className="text-lg font-semibold">{title}</h3>
        </div>
        
        <p className="text-gray-600 mb-6">{message}</p>
        
        <div className="flex items-center justify-end gap-2">
          <Button
            variant="outline"
            onClick={onCancel}
            disabled={loading}
          >
            {cancelText}
          </Button>
          <Button
            className={getConfirmButtonVariant()}
            onClick={onConfirm}
            loading={loading}
          >
            {confirmText}
          </Button>
        </div>
      </div>
    </div>
  )
}









