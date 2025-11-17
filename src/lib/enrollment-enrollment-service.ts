import { collection, query, getDocs, where, orderBy } from 'firebase/firestore'
import { db } from './firebase'

export interface EnrolledStudent {
  id: string
  nome: string
  nomeCrianca: string
  serie?: string
  anoLetivo?: string
  status?: string
}

class EnrollmentEnrollmentService {
  /**
   * Busca todos os alunos matriculados na creche
   */
  async getEnrolledStudents(): Promise<EnrolledStudent[]> {
    try {
      const q = query(
        collection(db, 'enrollments'),
        orderBy('nome', 'asc')
      )
      
      const snapshot = await getDocs(q)
      
      return snapshot.docs
        .filter(doc => {
          const data = doc.data()
          // Incluir alunos com status confirmada
          return data.status === 'confirmada'
        })
        .map(doc => ({
          id: doc.id,
          nome: doc.data().nome || doc.data().nomeCrianca || '',
          nomeCrianca: doc.data().nomeCrianca || doc.data().nome || '',
          serie: doc.data().serie,
          anoLetivo: doc.data().anoLetivo,
          status: doc.data().status
        }))
    } catch (error) {
      console.error('Erro ao buscar alunos matriculados:', error)
      return []
    }
  }
}

export const enrollmentEnrollmentService = new EnrollmentEnrollmentService()

