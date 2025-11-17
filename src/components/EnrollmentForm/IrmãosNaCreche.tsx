'use client'

import React, { useEffect, useState, useCallback } from 'react'
import { useFieldArray, Control } from 'react-hook-form'
import { Input } from './FormField'
import { Button } from '@/components/ui/Button'
import { Plus, X } from 'lucide-react'
import { ChildInfo } from '@/lib/enrollment-schemas'
import { enrollmentEnrollmentService } from '@/lib/enrollment-enrollment-service'

interface IrmaoNaCreche {
  nomeCompleto: string
  idEnrollment: string
}

interface IrmaosNaCrecheProps {
  control: Control<ChildInfo>
  temIrmaosNaCreche: boolean
}

export function IrmaosNaCreche({ control, temIrmaosNaCreche }: IrmaosNaCrecheProps) {
  const [enrolledStudents, setEnrolledStudents] = useState<Array<{id: string, nome: string}>>([])
  const [loading, setLoading] = useState(false)

  const { fields, append, remove } = useFieldArray({
    control,
    name: 'irmaosNaCreche'
  })

  const loadEnrolledStudents = useCallback(async () => {
    setLoading(true)
    try {
      const students = await enrollmentEnrollmentService.getEnrolledStudents()
      setEnrolledStudents(students)
    } catch (error) {
      console.error('Erro ao carregar alunos:', error)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    if (temIrmaosNaCreche && enrolledStudents.length === 0) {
      loadEnrolledStudents()
    }
  }, [temIrmaosNaCreche, enrolledStudents.length, loadEnrolledStudents])

  const handleAddIrmao = () => {
    append({ nomeCompleto: '', idEnrollment: '' })
  }

  const handleRemoveIrmao = (index: number) => {
    remove(index)
  }

  const handleStudentSelect = (index: number, studentId: string) => {
    const student = enrolledStudents.find(s => s.id === studentId)
    if (student) {
      const currentFields = fields as Array<IrmaoNaCreche>
      const updatedField = {
        ...currentFields[index],
        nomeCompleto: student.nome,
        idEnrollment: studentId
      }
      // Atualizar o campo usando setValue do react-hook-form
    }
  }

  if (!temIrmaosNaCreche) return null

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <label className="block text-sm font-medium text-gray-700">
          Irmãos na Creche
        </label>
        <Button
          type="button"
          size="sm"
          variant="outline"
          onClick={handleAddIrmao}
          icon={<Plus className="h-4 w-4" />}
        >
          Adicionar Irmão
        </Button>
      </div>

      {fields.map((field, index) => (
        <div key={field.id} className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg">
          <select
            className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
            defaultValue=""
          >
            <option value="">Selecione o irmão</option>
            {loading ? (
              <option disabled>Carregando...</option>
            ) : (
              enrolledStudents.map(student => (
                <option key={student.id} value={student.id}>
                  {student.nome}
                </option>
              ))
            )}
          </select>
          
          <Button
            type="button"
            size="sm"
            variant="ghost"
            onClick={() => handleRemoveIrmao(index)}
            className="text-error-600 hover:text-error-700"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      ))}

      {fields.length === 0 && (
        <p className="text-sm text-gray-500">
          Clique em &quot;Adicionar Irmão&quot; para vincular um irmão que já está matriculado na creche.
        </p>
      )}
    </div>
  )
}

