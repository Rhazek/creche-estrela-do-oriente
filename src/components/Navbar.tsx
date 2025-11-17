'use client';

import { useAuth } from '@/hooks/useAuth';
import { signOut } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function Navbar() {
  const { user, userProfile, isAdmin } = useAuth();
  const router = useRouter();

  const handleLogout = async () => {
    try {
      await signOut(auth);
      // Limpar dados do usuário do localStorage
      localStorage.removeItem('userProfile');
      router.push('/');
    } catch (error) {
      console.error('Erro ao fazer logout:', error);
    }
  };

  return (
    <nav className="bg-primary-600 text-white p-4">
      <div className="container mx-auto flex justify-between items-center">
        <Link href="/" className="text-xl font-bold">
          Creche-Escola
        </Link>
        
        <div className="flex items-center space-x-4">
          {user && (
            <>
              <Link href="/matriculas" className="hover:text-primary-200">
                Matrículas
              </Link>
              <Link href="/rematriculas" className="hover:text-primary-200">
                Rematrículas
              </Link>
              <Link href="/relatorios" className="hover:text-primary-200">
                Relatórios
              </Link>
              {isAdmin() && (
                <Link href="/dashboard" className="hover:text-primary-200">
                  Dashboard
                </Link>
              )}
            </>
          )}
          
          {user ? (
            <div className="flex items-center space-x-4">
              <div className="text-right">
                <div className="text-sm font-medium">
                  {userProfile?.nomeCompleto || user.email}
                </div>
                <div className="text-xs text-primary-200">
                  {userProfile?.perfil === 'administrador' ? 'Administrador' : 'Funcionário'}
                </div>
              </div>
              <button
                onClick={handleLogout}
                className="bg-primary-700 hover:bg-primary-800 px-3 py-1 rounded text-sm"
              >
                Sair
              </button>
            </div>
          ) : (
            <>
              <Link href="/login" className="hover:text-primary-200">
                Entrar
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}
