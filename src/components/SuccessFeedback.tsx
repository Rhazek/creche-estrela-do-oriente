'use client'

import React from 'react'
import { Card, CardContent } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { CheckCircle, ArrowRight } from 'lucide-react'

interface SuccessFeedbackProps {
  title: string
  message: string
  buttonText: string
  onButtonClick: () => void
  icon?: React.ReactNode
  buttonIcon?: React.ReactNode
}

export function SuccessFeedback({
  title,
  message,
  buttonText,
  onButtonClick,
  icon,
  buttonIcon
}: SuccessFeedbackProps) {
  return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <Card className="max-w-md w-full">
        <CardContent className="p-8 text-center">
          <div className="flex justify-center mb-6">
            <div className="w-20 h-20 bg-success-100 rounded-full flex items-center justify-center">
              {icon || <CheckCircle className="h-10 w-10 text-success-600" />}
            </div>
          </div>
          
          <h2 className="text-2xl font-bold text-gray-900 mb-3">
            {title}
          </h2>
          
          <p className="text-gray-600 mb-8 text-lg">
            {message}
          </p>
          
          <Button
            onClick={onButtonClick}
            icon={buttonIcon || <ArrowRight className="h-4 w-4" />}
            fullWidth
            size="lg"
          >
            {buttonText}
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}

