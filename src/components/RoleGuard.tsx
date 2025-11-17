'use client';

import { useAuth } from '@/hooks/useAuth';
import { ReactNode } from 'react';

interface RoleGuardProps {
  children: ReactNode;
  allowedRoles: ('funcionario' | 'administrador')[];
  fallback?: ReactNode;
}

export default function RoleGuard({ children, allowedRoles, fallback }: RoleGuardProps) {
  const { userProfile, loading, user } = useAuth();

  // Função para criar perfil padrão se necessário
  const createDefaultProfile = () => {
    if (user && !userProfile) {
      const defaultProfile = {
        uid: user.uid,
        email: user.email,
        nomeCompleto: user.email || 'Usuário',
        cpf: '',
        perfil: 'funcionario' as const
      };
      localStorage.setItem('userProfile', JSON.stringify(defaultProfile));
      window.location.reload(); // Recarregar para aplicar o perfil
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-32">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (!userProfile) {
    // Tentar criar perfil padrão se o usuário estiver logado
    if (user) {
      createDefaultProfile();
      return (
        <div className="flex justify-center items-center min-h-32">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Criando perfil...</p>
          </div>
        </div>
      );
    }
    
    return fallback || (
      <div className="text-center py-8">
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 max-w-md mx-auto">
          <div className="text-yellow-600 text-4xl mb-2">⚠️</div>
          <h3 className="text-lg font-semibold text-yellow-800 mb-2">Perfil Não Encontrado</h3>
          <p className="text-yellow-600 text-sm mb-4">
            Você precisa estar logado para acessar esta funcionalidade.
          </p>
          <p className="text-yellow-500 text-xs">
            Debug: userProfile = {JSON.stringify(userProfile)}
          </p>
          <button 
            onClick={() => window.location.href = '/'}
            className="mt-4 px-4 py-2 bg-primary-600 text-white rounded hover:bg-primary-700"
          >
            Ir para Login
          </button>
        </div>
      </div>
    );
  }

  if (!allowedRoles.includes(userProfile.perfil)) {
    return fallback || (
      <div className="text-center py-8">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 max-w-md mx-auto">
          <div className="text-red-600 text-4xl mb-2">🚫</div>
          <h3 className="text-lg font-semibold text-red-800 mb-2">Acesso Negado</h3>
          <p className="text-red-600 text-sm">
            Você não tem permissão para acessar esta funcionalidade.
          </p>
          <p className="text-red-500 text-xs mt-2">
            Perfil necessário: {allowedRoles.join(' ou ')}
          </p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}

