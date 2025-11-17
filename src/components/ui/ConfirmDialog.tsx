'use client'

import React, { useState, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Button } from './Button'
import { AlertCircle, CheckCircle, XCircle, Info } from 'lucide-react'

export interface ConfirmDialogConfig {
  title: string
  message: string
  variant?: 'default' | 'danger' | 'warning' | 'success' | 'info'
  confirmText?: string
  cancelText?: string
  onConfirm: () => void | Promise<void>
}

interface ConfirmDialogProps {
  isOpen: boolean
  onClose: () => void
  onConfirm: () => void | Promise<void>
  title: string
  message: string
  variant?: 'default' | 'danger' | 'warning' | 'success' | 'info'
  confirmText?: string
  cancelText?: string
  loading?: boolean
}

export function ConfirmDialog({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  variant = 'default',
  confirmText = 'Confirmar',
  cancelText = 'Cancelar',
  loading = false
}: ConfirmDialogProps) {
  const getVariantConfig = () => {
    switch (variant) {
      case 'danger':
        return {
          icon: <XCircle className="h-6 w-6 text-error-600" />,
          iconBg: 'bg-error-100',
          confirmButtonClass: 'bg-error-600 hover:bg-error-700 text-white'
        }
      case 'warning':
        return {
          icon: <AlertCircle className="h-6 w-6 text-warning-600" />,
          iconBg: 'bg-warning-100',
          confirmButtonClass: 'bg-warning-600 hover:bg-warning-700 text-white'
        }
      case 'success':
        return {
          icon: <CheckCircle className="h-6 w-6 text-success-600" />,
          iconBg: 'bg-success-100',
          confirmButtonClass: 'bg-success-600 hover:bg-success-700 text-white'
        }
      case 'info':
        return {
          icon: <Info className="h-6 w-6 text-info-600" />,
          iconBg: 'bg-info-100',
          confirmButtonClass: 'bg-info-600 hover:bg-info-700 text-white'
        }
      default:
        return {
          icon: <Info className="h-6 w-6 text-primary-600" />,
          iconBg: 'bg-primary-100',
          confirmButtonClass: 'bg-primary-600 hover:bg-primary-700 text-white'
        }
    }
  }

  const config = getVariantConfig()

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black bg-opacity-50 z-[100]"
          />

          {/* Dialog */}
          <div className="fixed inset-0 z-[101] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ duration: 0.2 }}
              className="bg-white rounded-2xl shadow-xl max-w-md w-full p-6"
            >
              {/* Icon */}
              <div className={`w-12 h-12 ${config.iconBg} rounded-full flex items-center justify-center mx-auto mb-4`}>
                {config.icon}
              </div>

              {/* Title */}
              <h3 className="text-xl font-bold text-gray-900 text-center mb-2">
                {title}
              </h3>

              {/* Message */}
              <p className="text-gray-600 text-center mb-6 whitespace-pre-line">
                {message}
              </p>

              {/* Actions */}
              <div className="flex gap-3">
                <Button
                  variant="outline"
                  onClick={onClose}
                  disabled={loading}
                  fullWidth
                >
                  {cancelText}
                </Button>
                <Button
                  onClick={onConfirm}
                  loading={loading}
                  fullWidth
                  className={config.confirmButtonClass}
                >
                  {confirmText}
                </Button>
              </div>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  )
}

/**
 * Hook para controlar o ConfirmDialog
 */
export function useConfirmDialog() {
  const [isOpen, setIsOpen] = useState(false)
  const [config, setConfig] = useState<ConfirmDialogConfig | null>(null)

  const confirm = useCallback((newConfig: ConfirmDialogConfig) => {
    setConfig(newConfig)
    setIsOpen(true)
  }, [])

  const close = useCallback(() => {
    setIsOpen(false)
    setTimeout(() => setConfig(null), 300) // Aguardar a animação de saída
  }, [])

  const handleConfirm = useCallback(async () => {
    if (config?.onConfirm) {
      await config.onConfirm()
      close()
    }
  }, [config, close])

  return {
    isOpen,
    config,
    confirm,
    close,
    handleConfirm
  }
}





