'use client'

import React, { useState, useEffect } from 'react'
import { collection, getDocs, doc, updateDoc } from 'firebase/firestore'
import { db } from '@/lib/firebase'
import AuthGuard from '@/components/AuthGuard'
import RoleGuard from '@/components/RoleGuard'
import { PageHeader, Container } from '@/components/layout/LayoutWrapper'
import { Card, CardContent, CardHeader } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { 
  Users,
  Calendar,
  Briefcase,
  UserCheck,
  UserX,
  Shield,
  UserCog,
  Trash2
} from 'lucide-react'
import { motion } from 'framer-motion'
import { ConfirmDialog, useConfirmDialog } from '@/components/ui/ConfirmDialog'

interface ApprovedUser {
  id: string
  uid: string
  nomeCompleto: string
  email: string
  cargo: string
  perfil: 'funcionario' | 'administrador'
  dataCadastro: any
  dataAprovacao: any
  aprovadoPor: string
  deletado?: boolean
  dataExclusao?: any
  excluidoPor?: string
}

export default function UsersPage() {
  const [approvedUsers, setApprovedUsers] = useState<ApprovedUser[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [processing, setProcessing] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState<'approved' | 'deleted'>('approved')
  const [deletedUsers, setDeletedUsers] = useState<ApprovedUser[]>([])
  const confirmDialog = useConfirmDialog()

  useEffect(() => {
    loadUsers()
  }, [])

  const loadUsers = async () => {
    try {
      setLoading(true)
      setError('')
      console.log('🔍 Carregando todos os usuários...')
      // Carregar usuários aprovados
      const approvedSnapshot = await getDocs(collection(db, 'usuarios'))
      console.log('📊 Usuários aprovados encontrados:', approvedSnapshot.docs.length)
      
      const approvedUsers = approvedSnapshot.docs.map(doc => {
        const data = doc.data()
        return {
          id: doc.id,
          ...data
        }
      }) as ApprovedUser[]
      
      // Separar usuários ativos e deletados
      const activeUsers = approvedUsers.filter(user => !user.deletado)
      const deletedUsers = approvedUsers.filter(user => user.deletado)
      
      setApprovedUsers(activeUsers)
      setDeletedUsers(deletedUsers)
      
      console.log('✅ Usuários carregados:', {
        aprovados: activeUsers.length,
        deletados: deletedUsers.length
      })
      
    } catch (error: any) {
      console.error('❌ Erro ao carregar usuários:', error)
      
      if (error.code === 'permission-denied') {
        setError('Erro de permissão: Verifique as regras do Firestore')
      } else if (error.code === 'unavailable') {
        setError('Firebase indisponível: Verifique sua conexão')
      } else {
        setError(`Erro ao carregar usuários: ${error.message}`)
      }
    } finally {
      setLoading(false)
    }
  }


  const handleUpdatePermission = (userId: string, newPerfil: 'funcionario' | 'administrador') => {
    const user = approvedUsers.find(u => u.id === userId)
    if (!user) return

    const perfilText = newPerfil === 'administrador' ? 'Administrador' : 'Funcionário'
    
    confirmDialog.confirm({
      title: 'Confirmar Alteração de Permissão',
      message: `Tem certeza que deseja alterar as permissões de ${user.nomeCompleto} para ${perfilText}?\n\nEsta ação alterará o acesso do usuário ao sistema.`,
      variant: 'warning',
      confirmText: `Alterar para ${perfilText}`,
      cancelText: 'Cancelar',
      onConfirm: () => updateUserPermission(userId, newPerfil)
    })
  }

  const handleDeleteUser = (userId: string) => {
    const user = approvedUsers.find(u => u.id === userId)
    if (!user) return

    confirmDialog.confirm({
      title: 'Confirmar Exclusão',
      message: `Tem certeza que deseja excluir o usuário ${user.nomeCompleto}?\n\nEsta ação:\n• Removerá o usuário da lista de usuários ativos\n• Revogará todos os acessos ao sistema\n• O usuário não conseguirá mais fazer login\n`,
      variant: 'danger',
      confirmText: 'Excluir Usuário',
      cancelText: 'Cancelar',
      onConfirm: () => deleteUser(userId)
    })
  }

  const handleRestoreUser = (userId: string) => {
    const user = deletedUsers.find(u => u.id === userId)
    if (!user) return

    confirmDialog.confirm({
      title: 'Confirmar Reativação',
      message: `Tem certeza que deseja reativar o usuário ${user.nomeCompleto}?\n\nEsta ação:\n• Restaurará o acesso do usuário ao sistema\n• O usuário poderá fazer login novamente\n• Todas as permissões serão restauradas`,
      variant: 'success',
      confirmText: 'Reativar Usuário',
      cancelText: 'Cancelar',
      onConfirm: () => restoreUser(userId)
    })
  }

  

  const updateUserPermission = async (userId: string, newPerfil: 'funcionario' | 'administrador') => {
    try {
      setProcessing(userId)
      setError('')
      console.log('🔄 Atualizando permissão do usuário:', userId, 'para', newPerfil)
      
      // Atualizar na coleção usuarios
      const userRef = doc(db, 'usuarios', userId)
      await updateDoc(userRef, {
        perfil: newPerfil,
        dataAprovacao: new Date(),
        aprovadoPor: 'admin'
      })
      
      console.log('✅ Permissão atualizada na coleção usuarios')
      
      // Atualizar na lista local
      setApprovedUsers(prev => prev.map(user => 
        user.id === userId ? { ...user, perfil: newPerfil } : user
      ))
      
      console.log('🎉 Permissão atualizada com sucesso!')
      
    } catch (error: any) {
      console.error('❌ Erro ao atualizar permissão:', error)
      setError(`Erro ao atualizar permissão: ${error.message}`)
    } finally {
      setProcessing(null)
    }
  }

  const rejectUser = async (userId: string) => {
    // Função de rejeição removida — aprovação por autoatendimento está desativada.
    setError('A rejeição de solicitações foi desativada. Cadastros devem ser gerenciados diretamente.')
  }

  const deleteUser = async (userId: string) => {
    try {
      setProcessing(userId)
      setError('')
      console.log('🗑️ Marcando usuário como deletado:', userId)
      
      // Encontrar o usuário na lista
      const user = approvedUsers.find(u => u.id === userId)
      if (!user) {
        throw new Error('Usuário não encontrado na lista')
      }
      
      console.log('👤 Dados do usuário a ser marcado como deletado:', user)
      
      // Marcar como deletado na coleção usuarios (soft delete)
      const userRef = doc(db, 'usuarios', userId)
      console.log('📝 Marcando como deletado:', userRef.path)
      
      await updateDoc(userRef, {
        deletado: true,
        dataExclusao: new Date(),
        excluidoPor: 'admin' // TODO: Pegar do usuário logado
      })
      console.log('✅ Usuário marcado como deletado na coleção usuarios')

      // Remover da lista local
      setApprovedUsers(prev => prev.filter(u => u.id !== userId))
      console.log('✅ Usuário removido da lista local')
      
      console.log('🎉 Usuário marcado como deletado com sucesso!')
      console.log('⚠️ NOTA: O usuário ainda existe no Firebase Authentication, mas foi desabilitado no sistema.')
      
    } catch (error: any) {
      console.error('❌ Erro ao marcar usuário como deletado:', error)
      
      if (error.code === 'permission-denied') {
        setError('Erro de permissão: Verifique as regras do Firestore')
      } else if (error.code === 'not-found') {
        setError('Usuário não encontrado no sistema')
      } else if (error.message.includes('Usuário não encontrado')) {
        setError('Usuário não encontrado na lista')
      } else {
        setError(`Erro ao marcar usuário como deletado: ${error.message}`)
      }
    } finally {
      setProcessing(null)
    }
  }

  const restoreUser = async (userId: string) => {
    try {
      setProcessing(userId)
      setError('')
      console.log('🔄 Reativando usuário:', userId)
      
      // Encontrar o usuário na lista de deletados
      const user = deletedUsers.find(u => u.id === userId)
      if (!user) {
        throw new Error('Usuário não encontrado na lista de deletados')
      }
      
      console.log('👤 Dados do usuário a ser reativado:', user)
      
      // Remover flag de deletado na coleção usuarios
      const userRef = doc(db, 'usuarios', userId)
      console.log('📝 Reativando usuário:', userRef.path)
      
      await updateDoc(userRef, {
        deletado: false,
        dataReativacao: new Date(),
        reativadoPor: 'admin' // TODO: Pegar do usuário logado
      })
      console.log('✅ Usuário reativado na coleção usuarios')

      // Remover da lista de deletados e adicionar aos ativos
      setDeletedUsers(prev => prev.filter(u => u.id !== userId))
      setApprovedUsers(prev => [...prev, { ...user, deletado: false }])
      console.log('✅ Usuário movido para lista de ativos')
      
      console.log('🎉 Usuário reativado com sucesso!')
      
    } catch (error: any) {
      console.error('❌ Erro ao reativar usuário:', error)
      
      if (error.code === 'permission-denied') {
        setError('Erro de permissão: Verifique as regras do Firestore')
      } else if (error.code === 'not-found') {
        setError('Usuário não encontrado no sistema')
      } else if (error.message.includes('Usuário não encontrado')) {
        setError('Usuário não encontrado na lista de deletados')
      } else {
        setError(`Erro ao reativar usuário: ${error.message}`)
      }
    } finally {
      setProcessing(null)
    }
  }

  const formatDate = (date: any) => {
    if (!date) return 'N/A'
    const d = date.toDate ? date.toDate() : new Date(date)
    return d.toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  if (loading) {
    return (
      <AuthGuard>
        <RoleGuard allowedRoles={['administrador']}>
          <Container>
            <div className="flex justify-center items-center h-64">
              <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
                <p className="mt-4 text-gray-600">Carregando usuários pendentes...</p>
              </div>
            </div>
          </Container>
        </RoleGuard>
      </AuthGuard>
    )
  }

  return (
    <AuthGuard>
      <RoleGuard allowedRoles={['administrador']}>
        <Container>
          <PageHeader
            title="Usuários"
            subtitle="Gerencie usuários do sistema e solicitações de acesso"
          />

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
              <p className="text-red-600">{error}</p>
            </div>
          )}

          {/* Estatísticas */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
            >
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600 mb-1">Usuários Ativos</p>
                      <p className="text-3xl font-bold text-success-600">
                        {approvedUsers.length}
                      </p>
                    </div>
                    <div className="w-12 h-12 bg-success-100 rounded-xl flex items-center justify-center">
                      <UserCheck className="h-6 w-6 text-success-600" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600 mb-1">Administradores</p>
                      <p className="text-3xl font-bold text-primary-600">
                        {approvedUsers.filter(u => u.perfil === 'administrador').length}
                      </p>
                    </div>
                    <div className="w-12 h-12 bg-primary-100 rounded-xl flex items-center justify-center">
                      <Shield className="h-6 w-6 text-primary-600" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </div>

          {/* Abas */}
          <div className="mb-6">
            <div className="border-b border-gray-200">
              <nav className="-mb-px flex space-x-8">
                {/* Aba de solicitações pendentes removida (cadastro desativado) */}
                <button
                  onClick={() => setActiveTab('approved')}
                  className={`py-2 px-1 border-b-2 font-medium text-sm ${
                    activeTab === 'approved'
                      ? 'border-primary-500 text-primary-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <div className="flex items-center space-x-2">
                    <Users className="h-4 w-4" />
                    <span>Usuários Ativos ({approvedUsers.length})</span>
                  </div>
                </button>
                <button
                  onClick={() => setActiveTab('deleted')}
                  className={`py-2 px-1 border-b-2 font-medium text-sm ${
                    activeTab === 'deleted'
                      ? 'border-primary-500 text-primary-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <div className="flex items-center space-x-2">
                    <UserX className="h-4 w-4" />
                    <span>Usuários Excluídos ({deletedUsers.length})</span>
                  </div>
                </button>
              </nav>
            </div>
          </div>

          {/* Conteúdo das Abas */}

          {activeTab === 'approved' && (
            <>
              {/* Lista de Usuários Aprovados */}
              {approvedUsers.length === 0 ? (
                <Card>
                  <CardContent className="p-8 text-center">
                    <Users className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">
                      Nenhum usuário ativo
                    </h3>
                    <p className="text-gray-600">
                      Não há usuários aprovados no sistema ainda.
                    </p>
                  </CardContent>
                </Card>
              ) : (
                <div className="space-y-6">
                  {approvedUsers.map((user, index) => (
                    <motion.div
                      key={user.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                    >
                      <Card>
                        <CardContent className="p-6">
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <div className="flex items-center space-x-3 mb-4">
                                <div className="w-12 h-12 bg-success-100 rounded-full flex items-center justify-center">
                                  <UserCheck className="h-6 w-6 text-success-600" />
                                </div>
                                <div>
                                  <h3 className="text-lg font-semibold text-gray-900">
                                    {user.nomeCompleto}
                                  </h3>
                                  <p className="text-gray-600">{user.email}</p>
                                </div>
                              </div>

                              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                                <div className="flex items-center space-x-2 text-gray-600">
                                  <Briefcase className="h-4 w-4" />
                                  <span className="text-sm">{user.cargo}</span>
                                </div>
                                <div className="flex items-center space-x-2 text-gray-600">
                                  <Shield className="h-4 w-4" />
                                  <span className={`text-sm px-2 py-1 rounded-full ${
                                    user.perfil === 'administrador' 
                                      ? 'bg-primary-100 text-primary-800' 
                                      : 'bg-gray-100 text-gray-800'
                                  }`}>
                                    {user.perfil === 'administrador' ? 'Administrador' : 'Funcionário'}
                                  </span>
                                </div>
                                <div className="flex items-center space-x-2 text-gray-600">
                                  <Calendar className="h-4 w-4" />
                                  <span className="text-sm">
                                    Aprovado em {formatDate(user.dataAprovacao)}
                                  </span>
                                </div>
                              </div>
                            </div>

                            <div className="flex flex-col space-y-2">
                              <div className="flex space-x-2">
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => handleUpdatePermission(user.id, 'funcionario')}
                                  disabled={processing === user.id || user.perfil === 'funcionario'}
                                  className="text-gray-600 border-gray-600 hover:bg-gray-50"
                                >
                                  <UserCog className="h-4 w-4 mr-1" />
                                  Tornar Funcionário
                                </Button>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => handleUpdatePermission(user.id, 'administrador')}
                                  disabled={processing === user.id || user.perfil === 'administrador'}
                                  className="text-primary-600 border-primary-600 hover:bg-primary-50"
                                >
                                  <Shield className="h-4 w-4 mr-1" />
                                  Tornar Admin
                                </Button>
                              </div>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleDeleteUser(user.id)}
                                disabled={processing === user.id}
                                className="text-error-600 border-error-600 hover:bg-error-50"
                              >
                                <Trash2 className="h-4 w-4 mr-1" />
                                Excluir Usuário
                              </Button>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </motion.div>
                  ))}
                </div>
              )}
            </>
          )}

          {activeTab === 'deleted' && (
            <>
              {/* Lista de Usuários Deletados */}
              {deletedUsers.length === 0 ? (
                <Card>
                  <CardContent className="p-8 text-center">
                    <UserX className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">
                      Nenhum usuário excluído
                    </h3>
                    <p className="text-gray-600">
                      Não há usuários excluídos no momento.
                    </p>
                  </CardContent>
                </Card>
              ) : (
                <div className="space-y-6">
                  {deletedUsers.map((user, index) => (
                    <motion.div
                      key={user.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                    >
                      <Card className="border-error-200 bg-error-50">
                        <CardContent className="p-6">
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <div className="flex items-center space-x-3 mb-4">
                                <div className="w-12 h-12 bg-error-100 rounded-full flex items-center justify-center">
                                  <UserX className="h-6 w-6 text-error-600" />
                                </div>
                                <div>
                                  <h3 className="text-lg font-semibold text-gray-900">
                                    {user.nomeCompleto}
                                  </h3>
                                  <p className="text-gray-600">{user.email}</p>
                                </div>
                              </div>

                              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                                <div className="flex items-center space-x-2 text-gray-600">
                                  <Briefcase className="h-4 w-4" />
                                  <span className="text-sm">{user.cargo}</span>
                                </div>
                                <div className="flex items-center space-x-2 text-gray-600">
                                  <Shield className="h-4 w-4" />
                                  <span className={`text-sm px-2 py-1 rounded-full ${
                                    user.perfil === 'administrador' 
                                      ? 'bg-primary-100 text-primary-800' 
                                      : 'bg-gray-100 text-gray-800'
                                  }`}>
                                    {user.perfil === 'administrador' ? 'Administrador' : 'Funcionário'}
                                  </span>
                                </div>
                                <div className="flex items-center space-x-2 text-gray-600">
                                  <Calendar className="h-4 w-4" />
                                  <span className="text-sm">
                                    Excluído em {formatDate(user.dataExclusao)}
                                  </span>
                                </div>
                              </div>
                            </div>

                            <div className="flex flex-col space-y-2">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleRestoreUser(user.id)}
                                disabled={processing === user.id}
                                className="text-success-600 border-success-600 hover:bg-success-50"
                              >
                                <UserCheck className="h-4 w-4 mr-1" />
                                Reativar Usuário
                              </Button>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </motion.div>
                  ))}
                </div>
              )}
            </>
          )}
        </Container>

        {/* Dialog de Confirmação */}
        <ConfirmDialog
          isOpen={confirmDialog.isOpen}
          onClose={confirmDialog.close}
          onConfirm={confirmDialog.handleConfirm}
          title={confirmDialog.config?.title || ''}
          message={confirmDialog.config?.message || ''}
          variant={confirmDialog.config?.variant || 'default'}
          confirmText={confirmDialog.config?.confirmText || 'Confirmar'}
          cancelText={confirmDialog.config?.cancelText || 'Cancelar'}
          loading={processing !== null}
        />
      </RoleGuard>
    </AuthGuard>
  )
}
