'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import AuthGuard from '@/components/AuthGuard';
import RoleGuard from '@/components/RoleGuard';
import { useAuth } from '@/hooks/useAuth';
import { PageHeader, Container } from '@/components/layout/LayoutWrapper';
import { EnrollmentListService } from '@/lib/enrollment-list-service';
import { Enrollment, EnrollmentFilters, formatarData, calcularIdade } from '@/lib/enrollment-list-schemas';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Badge } from '@/components/ui/Badge';
import { STATUS_OPTIONS, ANO_LETIVO_OPTIONS } from '@/lib/enrollment-list-schemas';
import { CheckCircle, Clock, XCircle, Filter, X } from 'lucide-react';
import { ConfirmationModal } from '@/components/ConfirmationModal'
import toast from 'react-hot-toast';

// Interface estendida para incluir flag de rematrícula
interface EnrollmentWithReenrollFlag extends Enrollment {
  isReenrolledForYear?: boolean;
}

export default function RematriculasPage() {
  const router = useRouter();
  const { user } = useAuth();
  const [enrollments, setEnrollments] = useState<EnrollmentWithReenrollFlag[]>([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState<EnrollmentFilters>({
    status: 'confirmada'
  });
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear().toString());

  const loadEnrollments = useCallback(async () => {
    try {
      setLoading(true);
      // Buscar todas as matrículas confirmadas
      const filtersToApply: EnrollmentFilters = {
        ...filters,
      };
      
      // Se não há filtro de status, buscar apenas confirmadas
      if (!filtersToApply.status) {
        filtersToApply.status = 'confirmada';
      }
      
      // Remover filtro de ano letivo temporariamente para buscar todas
      // Vamos filtrar depois para mostrar apenas as que podem ser rematriculadas
      const anoLetivoFilter = filtersToApply.anoLetivo;
      delete filtersToApply.anoLetivo;
      
      const allEnrollments = await EnrollmentListService.getEnrollments(filtersToApply);
      
      // Buscar também todas as matrículas do ano selecionado para verificar rematrículas
      const reenrolledForYear = await EnrollmentListService.getEnrollments({
        anoLetivo: selectedYear,
        status: 'confirmada'
      });
      
      // Criar um mapa de alunos já rematriculados (por nome da criança + data de nascimento para maior precisão)
      const reenrolledMap = new Map<string, boolean>();
      reenrolledForYear.forEach(enrollment => {
        // Usar nome + data de nascimento como chave única
        const key = `${enrollment.nomeCrianca.toLowerCase().trim()}_${enrollment.dataNascimento}`;
        reenrolledMap.set(key, true);
      });
      
      // Filtrar matrículas
      const enrollmentsToShow = allEnrollments.filter(enrollment => {
        // Se tem filtro de ano letivo, aplicar
        if (anoLetivoFilter && enrollment.anoLetivo !== anoLetivoFilter) {
          return false;
        }
        
        // Não mostrar matrículas que já são do ano selecionado
        // (essas são as rematrículas, não as matrículas originais)
        if (enrollment.anoLetivo === selectedYear) {
          return false;
        }
        
        return true;
      });
      
      // Adicionar flag indicando se já foi rematriculado
      const enrollmentsWithFlag: EnrollmentWithReenrollFlag[] = enrollmentsToShow.map(enrollment => {
        // Verificar se já foi rematriculado pelo nome + data de nascimento
        const key = `${enrollment.nomeCrianca.toLowerCase().trim()}_${enrollment.dataNascimento}`;
        const isReenrolled = reenrolledMap.has(key);
        
        return {
          ...enrollment,
          isReenrolledForYear: isReenrolled
        };
      });
      
      setEnrollments(enrollmentsWithFlag);
    } catch (error) {
      toast.error('Erro ao carregar matrículas');
      console.error('Erro:', error);
    } finally {
      setLoading(false);
    }
  }, [filters, selectedYear]);

  useEffect(() => {
    loadEnrollments();
  }, [loadEnrollments]);

  const handleFilterChange = (field: keyof EnrollmentFilters, value: string) => {
    setFilters(prev => {
      const newFilters = { ...prev };
      if (value && value.trim() !== '') {
        newFilters[field] = value;
      } else {
        // Remove o filtro se o valor estiver vazio, mas mantém status como 'confirmada'
        if (field !== 'status') {
          delete newFilters[field];
        } else {
          newFilters[field] = 'confirmada';
        }
      }
      return newFilters;
    });
  };

  const handleReenrollment = (enrollmentId: string) => {
    // Perguntar confirmação antes de redirecionar para o formulário pré-preenchido
    setSelectedForReenroll(enrollmentId)
    setShowConfirm(true)
  };

  const [showConfirm, setShowConfirm] = useState(false)
  const [selectedForReenroll, setSelectedForReenroll] = useState<string | null>(null)

  const confirmReenroll = () => {
    if (!selectedForReenroll) return
    // acrescentar flag rematricula=1 para que o wizard saiba tratar como rematrícula
    router.push(`/matricula/new?prefillFrom=${selectedForReenroll}&rematricula=1`)
    setShowConfirm(false)
    setSelectedForReenroll(null)
  }

  const clearFilters = () => {
    setFilters({
      status: 'confirmada'
    });
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pendente_matricula':
        return <Badge variant="warning">Pendente</Badge>;
      case 'confirmada':
        return <Badge variant="success">Confirmada</Badge>;
      case 'cancelada':
        return <Badge variant="danger">Cancelada</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pendente_matricula':
        return <Clock className="w-4 h-4" />;
      case 'confirmada':
        return <CheckCircle className="w-4 h-4" />;
      case 'cancelada':
        return <XCircle className="w-4 h-4" />;
      default:
        return null;
    }
  };

  // Calcular estatísticas
  // Matrículas pendentes de rematrícula: não foram rematriculadas para o ano selecionado
  const pendentesRematricula = enrollments.filter(e => !e.isReenrolledForYear);
  
  // Matrículas já rematriculadas para o ano selecionado
  const rematriculadas = enrollments.filter(e => e.isReenrolledForYear);
  
  const stats = {
    total: enrollments.length,
    pendentes: pendentesRematricula.length,
    rematriculadas: rematriculadas.length
  };

  if (loading) {
    return (
      <AuthGuard>
        <RoleGuard allowedRoles={['funcionario', 'administrador']}>
          <Container>
            <div className="flex items-center justify-center min-h-screen">
              <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
                <p className="mt-4 text-gray-600">Carregando matrículas...</p>
              </div>
            </div>
          </Container>
        </RoleGuard>
      </AuthGuard>
    );
  }

  return (
    <AuthGuard>
      <RoleGuard allowedRoles={['funcionario', 'administrador']}>
        <Container>
          <PageHeader
            title="Sistema de Rematrículas"
            subtitle={`Gerencie as rematrículas dos alunos para o ano letivo ${selectedYear}`}
          />

          {/* Configuração do Ano Letivo */}
          <Card className="p-6 mb-6">
            <h2 className="text-lg font-semibold text-gray-800 mb-4">Configurações</h2>
            <div className="flex items-center space-x-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Ano Letivo</label>
                <Select
                  value={selectedYear}
                  onChange={(e) => setSelectedYear(e.target.value)}
                >
                  {ANO_LETIVO_OPTIONS.map(option => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </Select>
              </div>
            </div>
          </Card>
          {showConfirm && (
            <ConfirmationModal
              title="Rematricular Aluno"
              message="Deseja abrir o formulário de matrícula pré-preenchido para esta criança?"
              onConfirm={confirmReenroll}
              onCancel={() => { setShowConfirm(false); setSelectedForReenroll(null) }}
              confirmText="Continuar"
              cancelText="Cancelar"
              icon="info"
              confirmVariant="success"
            />
          )}

          {/* Filtros */}
          <Card className="p-6 mb-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-800">Filtros</h2>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Nome do Aluno</label>
                <Input
                  placeholder="Buscar por nome..."
                  value={filters.nome || ''}
                  onChange={(e) => handleFilterChange('nome', e.target.value)}
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Ano Letivo da Matrícula</label>
                <Select
                  value={filters.anoLetivo || ''}
                  onChange={(e) => handleFilterChange('anoLetivo', e.target.value)}
                >
                  <option value="">Todos</option>
                  {ANO_LETIVO_OPTIONS.map(option => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </Select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Série</label>
                <Select
                  value={filters.serie || ''}
                  onChange={(e) => handleFilterChange('serie', e.target.value)}
                >
                  <option value="">Todas</option>
                  <option value="Berçário I">Berçário I</option>
                  <option value="Berçário II">Berçário II</option>
                  <option value="Maternal I">Maternal I</option>
                  <option value="Maternal II">Maternal II</option>
                  <option value="Pré I">Pré I</option>
                  <option value="Pré II">Pré II</option>
                </Select>
              </div>
            </div>
            
            <div className="flex gap-4 mt-4">
              <Button variant="outline" size="sm" onClick={clearFilters}>
                <X className="w-4 h-4 mr-2" />
                Limpar Filtros
              </Button>
            </div>
          </Card>

          {/* Estatísticas */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
            <Card className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total de Matrículas</p>
                  <p className="text-2xl font-bold text-primary-600">{stats.total}</p>
                </div>
                <div className="p-3 bg-primary-100 rounded-full">
                  <CheckCircle className="w-6 h-6 text-primary-600" />
                </div>
              </div>
            </Card>
            <Card className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Pendentes de Rematrícula</p>
                  <p className="text-2xl font-bold text-yellow-600">{stats.pendentes}</p>
                </div>
                <div className="p-3 bg-yellow-100 rounded-full">
                  <Clock className="w-6 h-6 text-yellow-600" />
                </div>
              </div>
            </Card>
            <Card className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Rematriculadas ({selectedYear})</p>
                  <p className="text-2xl font-bold text-green-600">{stats.rematriculadas}</p>
                </div>
                <div className="p-3 bg-green-100 rounded-full">
                  <CheckCircle className="w-6 h-6 text-green-600" />
                </div>
              </div>
            </Card>
          </div>

          {/* Lista de Matrículas */}
          <Card className="p-6">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-3 px-4 font-semibold">Nome da Criança</th>
                    <th className="text-left py-3 px-4 font-semibold">Raça</th>
                    <th className="text-left py-3 px-4 font-semibold">Idade</th>
                    <th className="text-left py-3 px-4 font-semibold">Série</th>
                    <th className="text-left py-3 px-4 font-semibold">Ano Letivo</th>
                    <th className="text-left py-3 px-4 font-semibold">Responsável</th>
                    <th className="text-left py-3 px-4 font-semibold">Status</th>
                    <th className="text-left py-3 px-4 font-semibold">Ações</th>
                  </tr>
                </thead>
                <tbody>
                  {enrollments.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="text-center py-8 text-gray-500">
                        Nenhuma matrícula encontrada
                      </td>
                    </tr>
                  ) : (
                    enrollments.map((enrollment) => {
                      const isAlreadyReenrolled = enrollment.isReenrolledForYear || false;
                      const canReenroll = !isAlreadyReenrolled && enrollment.status === 'confirmada';
                      
                      return (
                        <tr key={enrollment.id} className="border-b hover:bg-gray-50">
                          <td className="py-3 px-4">
                            <div>
                              <p className="font-medium">{enrollment.nomeCrianca}</p>
                              <p className="text-sm text-gray-500">{enrollment.responsavelNome}</p>
                            </div>
                          </td>
                          <td className="py-3 px-4">{enrollment.raca}</td>
                          <td className="py-3 px-4">
                            {calcularIdade(enrollment.dataNascimento)} anos
                          </td>
                          <td className="py-3 px-4">{enrollment.serie || '-'}</td>
                          <td className="py-3 px-4">{enrollment.anoLetivo || '-'}</td>
                          <td className="py-3 px-4">
                            <div className="text-sm">
                              <p>{enrollment.responsavelNome}</p>
                              <p className="text-gray-500">{enrollment.responsavelContato}</p>
                            </div>
                          </td>
                          <td className="py-3 px-4">
                            <div className="flex items-center gap-2">
                              {getStatusIcon(enrollment.status)}
                              {getStatusBadge(enrollment.status)}
                            </div>
                          </td>
                          <td className="py-3 px-4">
                            {canReenroll && (
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleReenrollment(enrollment.id)}
                                className="text-primary-600 border-primary-600 hover:bg-primary-50"
                              >
                                Rematricular
                              </Button>
                            )}
                            {isAlreadyReenrolled && (
                              <span className="text-green-600 text-sm font-medium">Já rematriculado para {selectedYear}</span>
                            )}
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </Card>

        
        </Container>
      </RoleGuard>
    </AuthGuard>
  );
}

