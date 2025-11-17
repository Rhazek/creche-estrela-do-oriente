'use client';

import { useState, useEffect, useCallback } from 'react';
import { collection, getDocs, query, orderBy } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import AuthGuard from '@/components/AuthGuard';
import RoleGuard from '@/components/RoleGuard';
import { useDebounce } from '@/hooks/usePerformance';
import { SecurityUtils } from '@/lib/security';
import { PageHeader, Container } from '@/components/layout/LayoutWrapper';

interface EnrollmentData {
  id: string;
  nomeCompleto?: string;
  nomeCrianca?: string;
  nome?: string;
  dataNascimento: string;
  cpf?: string;
  nomeResponsavel?: string;
  responsavelNome?: string;
  nomeResponsavel1?: string;
  telefone?: string;
  responsavelContato?: string;
  email?: string;
  endereco: string;
  numero?: string;
  bairro?: string;
  cidade?: string;
  racaCor?: string;
  raca?: string;
  corRaca?: string;
  faixaRenda?: string;
  rendaFamiliar?: string;
  rendaPerCapita?: number;
  numeroPessoasFamilia?: string;
  situacaoHabitacional?: string;
  possuiDeficiencia?: string;
  necessidadesEspeciais?: boolean;
  tipoDeficiencia?: string;
  serie?: string;
  dataCadastro?: any;
  criadoEm?: any;
  status: string;
}

export default function RelatoriosPage() {
  const [enrollments, setEnrollments] = useState<EnrollmentData[]>([]);
  const [filteredEnrollments, setFilteredEnrollments] = useState<EnrollmentData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Filtros
  const [filters, setFilters] = useState({
    idadeMin: '',
    idadeMax: '',
    racaCor: '',
    faixaRenda: '',
    situacaoHabitacional: '',
    serie: '',
    status: ''
  });

  // Debounce dos filtros para melhor performance
  const debouncedFilters = useDebounce(filters, 300);

  useEffect(() => {
    loadEnrollments();
  }, []);

  const applyFilters = useCallback(() => {
    if (!enrollments || enrollments.length === 0) return;
    
    let filtered = [...enrollments];

    // Filtro por idade
    if (debouncedFilters.idadeMin || debouncedFilters.idadeMax) {
      filtered = filtered.filter(enrollment => {
        const birthDate = new Date(enrollment.dataNascimento);
        const today = new Date();
        const age = today.getFullYear() - birthDate.getFullYear();
        const monthDiff = today.getMonth() - birthDate.getMonth();
        const actualAge = monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate()) ? age - 1 : age;
        
        const minAge = debouncedFilters.idadeMin ? parseInt(debouncedFilters.idadeMin) : 0;
        const maxAge = debouncedFilters.idadeMax ? parseInt(debouncedFilters.idadeMax) : 6;
        
        return actualAge >= minAge && actualAge <= maxAge;
      });
    }

    // Filtro por raça/cor
    if (debouncedFilters.racaCor) {
      filtered = filtered.filter(enrollment => {
        const raca = (enrollment.racaCor || enrollment.raca || '').toLowerCase();
        return raca === debouncedFilters.racaCor.toLowerCase() || raca.includes(debouncedFilters.racaCor.toLowerCase());
      });
    }

    // Filtro por faixa de renda
    if (debouncedFilters.faixaRenda) {
      filtered = filtered.filter(enrollment => {
        const renda = (enrollment.faixaRenda || enrollment.rendaFamiliar || '').toLowerCase();
        return renda === debouncedFilters.faixaRenda.toLowerCase() || renda.includes(debouncedFilters.faixaRenda.toLowerCase());
      });
    }

    // Filtro por situação habitacional
    if (debouncedFilters.situacaoHabitacional) {
      filtered = filtered.filter(enrollment => {
        const situacao = (enrollment.situacaoHabitacional || '').toLowerCase();
        return situacao === debouncedFilters.situacaoHabitacional.toLowerCase() || situacao.includes(debouncedFilters.situacaoHabitacional.toLowerCase());
      });
    }

    // Filtro por série/turma
    if (debouncedFilters.serie) {
      filtered = filtered.filter(enrollment => {
        const serie = (enrollment.serie || '').toLowerCase();
        return serie === debouncedFilters.serie.toLowerCase() || serie.includes(debouncedFilters.serie.toLowerCase());
      });
    }

    // Filtro por status
    if (debouncedFilters.status) {
      filtered = filtered.filter(enrollment => {
        const status = (enrollment.status || '').toLowerCase();
        return status === debouncedFilters.status.toLowerCase() || status.includes(debouncedFilters.status.toLowerCase());
      });
    }

    setFilteredEnrollments(filtered);
  }, [enrollments, debouncedFilters]);

  useEffect(() => {
    if (enrollments.length > 0) {
      applyFilters();
    }
  }, [applyFilters, enrollments.length]);

  const loadEnrollments = async () => {
    try {
      setLoading(true);
      setError('');
      
      console.log('Iniciando carregamento de matrículas...');
      
      // Tentar carregar do Firebase
      try {
        console.log('Tentando conectar ao Firebase...');
        const q = query(collection(db, 'enrollments'), orderBy('criadoEm', 'desc'));
        const querySnapshot = await getDocs(q);
        
        // Carregar dados principais e subcoleções
        const firebaseData = await Promise.all(querySnapshot.docs.map(async (doc) => {
          const data = doc.data();
          
          // Buscar primeiro responsável da subcollection
          let primeiroResponsavel = null;
          let primeiroTelefone = null;
          
          try {
            const guardiansSnapshot = await getDocs(collection(db, 'enrollments', doc.id, 'guardians'));
            if (!guardiansSnapshot.empty) {
              const primeiroGuardian = guardiansSnapshot.docs[0].data();
              primeiroResponsavel = primeiroGuardian.nome || primeiroGuardian.nomeCompleto || null;
              primeiroTelefone = primeiroGuardian.celular || primeiroGuardian.telefone || null;
            }
          } catch (error) {
            console.warn('Erro ao buscar responsáveis para matrícula', doc.id, error);
          }
          
          // Normalizar campos para compatibilidade
          const normalizedData: EnrollmentData = {
            id: doc.id,
            nomeCompleto: data.nomeCrianca || data.nome || data.nomeCompleto || '',
            nomeCrianca: data.nomeCrianca,
            nome: data.nome,
            dataNascimento: data.dataNascimento,
            cpf: data.cpfCrianca || data.cpf || '',
            nomeResponsavel: primeiroResponsavel || data.responsavelNome || data.nomeResponsavel || data.nomeResponsavel1 || '',
            responsavelNome: data.responsavelNome,
            telefone: primeiroTelefone || data.responsavelContato || data.telefone || '',
            responsavelContato: data.responsavelContato,
            email: data.email,
            endereco: data.logradouro || data.endereco || '',
            numero: data.numero,
            bairro: data.bairro,
            cidade: data.municipio || data.cidade || '',
            racaCor: data.corRaca || data.raca || data.racaCor || '',
            raca: data.raca || data.corRaca,
            faixaRenda: data.rendaFamiliar || data.faixaRenda || '',
            rendaFamiliar: data.rendaFamiliar,
            rendaPerCapita: data.rendaPerCapita,
            numeroPessoasFamilia: data.numeroPessoasFamilia?.toString() || '',
            situacaoHabitacional: data.tipoOcupacao || data.situacaoHabitacional || '',
            possuiDeficiencia: data.necessidadesEspeciais ? 'sim' : 'nao',
            necessidadesEspeciais: data.necessidadesEspeciais,
            tipoDeficiencia: data.tipoDeficiencia || data.descricaoNecessidade,
            serie: data.serie || '',
            dataCadastro: data.criadoEm,
            criadoEm: data.criadoEm,
            status: data.status || 'pendente'
          };
          
          return normalizedData;
        }));
        
        console.log('Dados carregados do Firebase:', firebaseData.length, 'registros');
        console.log('Primeiro registro:', firebaseData[0]);
        setEnrollments(firebaseData);
      } catch (firebaseError) {
        console.error('Erro ao carregar do Firebase:', firebaseError);
        setError('Erro ao carregar dados do Firebase');
      }
    } catch (error: any) {
      console.error('Erro ao carregar matrículas:', error);
      setError('Erro ao carregar matrículas: ' + error.message);
    } finally {
      console.log('Finalizando carregamento...');
      setLoading(false);
    }
  };

  const handleFilterChange = (field: string, value: string) => {
    // Sanitizar entrada do usuário
    const sanitizedValue = SecurityUtils.sanitizeInput(value);
    
    setFilters(prev => ({
      ...prev,
      [field]: sanitizedValue
    }));
  };

  const clearFilters = () => {
    setFilters({
      idadeMin: '',
      idadeMax: '',
      racaCor: '',
      faixaRenda: '',
      situacaoHabitacional: '',
      serie: '',
      status: ''
    });
  };

  const refreshData = () => {
    loadEnrollments();
  };

  const exportToCSV = async () => {
    const headers = [
      'Nome Completo',
      'Data de Nascimento',
      'Idade',
      'CPF',
      'Responsável',
      'Telefone',
      'Email',
      'Endereço Completo',
      'Bairro',
      'Cidade',
      'Raça/Cor',
      'Renda Familiar',
      'Renda Per Capita',
      'Pessoas na Família',
      'Situação Habitacional',
      'Possui Deficiência',
      'Tipo de Deficiência',
      'Turma/Série',
      'Data de Cadastro',
      'Status'
    ];

    // Buscar dados completos das subcoleções para a exportação
    const fullData = await Promise.all(filteredEnrollments.map(async (enrollment) => {
      const birthDate = new Date(enrollment.dataNascimento);
      const today = new Date();
      const age = today.getFullYear() - birthDate.getFullYear();
      const monthDiff = today.getMonth() - birthDate.getMonth();
      const actualAge = monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate()) ? age - 1 : age;

      return [
        enrollment.nomeCompleto || enrollment.nomeCrianca || enrollment.nome || '',
        enrollment.dataNascimento || '',
        isNaN(actualAge) ? '' : actualAge.toString(),
        enrollment.cpf || '',
        enrollment.nomeResponsavel || enrollment.responsavelNome || '',
        enrollment.telefone || enrollment.responsavelContato || '',
        enrollment.email || '',
        `${enrollment.endereco || ''}${enrollment.numero ? ', ' + enrollment.numero : ''}`.trim(),
        enrollment.bairro || '',
        enrollment.cidade || '',
        enrollment.racaCor || enrollment.raca || '',
        enrollment.faixaRenda || enrollment.rendaFamiliar || '',
        enrollment.rendaPerCapita ? `R$ ${enrollment.rendaPerCapita.toFixed(2)}` : '',
        enrollment.numeroPessoasFamilia || '',
        enrollment.situacaoHabitacional || '',
        enrollment.possuiDeficiencia || 'nao',
        enrollment.tipoDeficiencia || '',
        enrollment.serie || '',
        enrollment.criadoEm?.toDate?.()?.toLocaleDateString('pt-BR') || 
         (typeof enrollment.dataCadastro === 'string' ? new Date(enrollment.dataCadastro).toLocaleDateString('pt-BR') : 
          enrollment.dataCadastro?.toDate?.()?.toLocaleDateString('pt-BR') || ''),
        enrollment.status || ''
      ];
    }));

    const csvContent = [headers, ...fullData]
      .map(row => row.map(field => `"${String(field).replace(/"/g, '""')}"`).join(','))
      .join('\n');

    const blob = new Blob(['\ufeff' + csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `matriculas_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const getStatusBadge = (status: string) => {
    const statusClasses = {
      'pendente_matricula': 'bg-yellow-100 text-yellow-800',
      'confirmada': 'bg-green-100 text-green-800',
      'cancelada': 'bg-red-100 text-red-800',
      'pendente': 'bg-yellow-100 text-yellow-800',
      'aprovada': 'bg-green-100 text-green-800',
      'rejeitada': 'bg-red-100 text-red-800',
      'em_analise': 'bg-blue-100 text-blue-800'
    };
    
    const statusLabels = {
      'pendente_matricula': 'Pendente de Matrícula',
      'confirmada': 'Confirmada',
      'cancelada': 'Cancelada',
      'pendente': 'Pendente',
      'aprovada': 'Aprovada',
      'rejeitada': 'Rejeitada',
      'em_analise': 'Em Análise'
    };
    
    return (
      <span className={`px-2 py-1 text-xs font-medium rounded-full ${statusClasses[status as keyof typeof statusClasses] || 'bg-gray-100 text-gray-800'}`}>
        {statusLabels[status as keyof typeof statusLabels] || status}
      </span>
    );
  };

  if (loading) {
    return (
      <AuthGuard>
        <RoleGuard allowedRoles={['funcionario', 'administrador']}>
          <div className="min-h-screen bg-gray-50 py-8">
            <div className="max-w-7xl mx-auto px-4">
              <div className="flex flex-col items-center justify-center h-64 space-y-4">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
                <div className="text-lg text-gray-600">Carregando matrículas...</div>
                <div className="text-sm text-gray-500">Conectando ao Firebase...</div>
              </div>
            </div>
          </div>
        </RoleGuard>
      </AuthGuard>
    );
  }

  return (
    <AuthGuard>
      <RoleGuard allowedRoles={['funcionario', 'administrador']}>
        <Container>
          <PageHeader
            title="Relatórios de Matrículas"
            subtitle="Visualize e filtre todas as matrículas cadastradas no sistema"
          />

                {error && (
                  <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
                    <p className="text-red-600">{error}</p>
                    <button 
                      onClick={refreshData}
                      className="mt-2 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
                    >
                      Tentar Novamente
                    </button>
                  </div>
                )}

                {!loading && !error && enrollments.length === 0 && (
                  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
                    <p className="text-yellow-600">
                      Nenhuma matrícula encontrada. 
                      <a href="/matriculas" className="text-blue-600 hover:underline ml-1">
                        Clique aqui para cadastrar a primeira matrícula.
                      </a>
                    </p>
                  </div>
                )}

        {/* Filtros */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">Filtros</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Idade Mínima</label>
              <input
                type="number"
                min="0"
                max="6"
                value={filters.idadeMin}
                onChange={(e) => handleFilterChange('idadeMin', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Idade Máxima</label>
              <input
                type="number"
                min="0"
                max="6"
                value={filters.idadeMax}
                onChange={(e) => handleFilterChange('idadeMax', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Raça/Cor</label>
              <select
                value={filters.racaCor}
                onChange={(e) => handleFilterChange('racaCor', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500"
              >
                <option value="">Todas</option>
                <option value="branca">Branca</option>
                <option value="preta">Preta</option>
                <option value="parda">Parda</option>
                <option value="amarela">Amarela</option>
                <option value="indigena">Indígena</option>
                <option value="nao_informado">Não informado</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Faixa de Renda</label>
              <select
                value={filters.faixaRenda}
                onChange={(e) => handleFilterChange('faixaRenda', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500"
              >
                <option value="">Todas</option>
                <option value="ate_1_salario">Até 1 salário mínimo</option>
                <option value="1_a_2_salarios">1 a 2 salários mínimos</option>
                <option value="2_a_3_salarios">2 a 3 salários mínimos</option>
                <option value="3_a_5_salarios">3 a 5 salários mínimos</option>
                <option value="acima_5_salarios">Acima de 5 salários mínimos</option>
                <option value="nao_informado">Não informado</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Situação Habitacional</label>
              <select
                value={filters.situacaoHabitacional}
                onChange={(e) => handleFilterChange('situacaoHabitacional', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500"
              >
                <option value="">Todas</option>
                <option value="propria">Própria</option>
                <option value="alugada">Alugada</option>
                <option value="cedida">Cedida</option>
                <option value="financiada">Financiada</option>
                <option value="outro">Outro</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Turma/Série</label>
              <select
                value={filters.serie}
                onChange={(e) => handleFilterChange('serie', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500"
              >
                <option value="">Todas</option>
                <option value="berçário i">Berçário I</option>
                <option value="berçário ii">Berçário II</option>
                <option value="maternal i">Maternal I</option>
                <option value="maternal ii">Maternal II</option>
                <option value="pré i">Pré I</option>
                <option value="pré ii">Pré II</option>
                <option value="1º ano">1º Ano</option>
                <option value="2º ano">2º Ano</option>
                <option value="3º ano">3º Ano</option>
                <option value="4º ano">4º Ano</option>
                <option value="5º ano">5º Ano</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
              <select
                value={filters.status}
                onChange={(e) => handleFilterChange('status', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500"
              >
                <option value="">Todos</option>
                <option value="pendente_matricula">Pendente de Matrícula</option>
                <option value="confirmada">Confirmada</option>
                <option value="cancelada">Cancelada</option>
              </select>
            </div>
          </div>
          
          <div className="flex gap-4 mt-4">
            <button
              onClick={clearFilters}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 border border-gray-300 rounded-md hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
            >
              Limpar Filtros
            </button>
            <button
              onClick={exportToCSV}
              className="px-4 py-2 text-sm font-medium text-white bg-primary-600 border border-transparent rounded-md hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
            >
              Exportar CSV ({filteredEnrollments.length} registros)
            </button>
            <button
              onClick={refreshData}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 border border-gray-300 rounded-md hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
            >
              Atualizar Dados
            </button>
          </div>
        </div>

        {/* Lista de Matrículas */}
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-800">
              Matrículas ({filteredEnrollments.length} de {enrollments.length})
            </h2>
          </div>
          
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Aluno
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Idade
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Responsável
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Contato
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Raça/Cor
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Renda
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Data
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredEnrollments.map((enrollment) => {
                  const birthDate = new Date(enrollment.dataNascimento);
                  const today = new Date();
                  const age = today.getFullYear() - birthDate.getFullYear();
                  const monthDiff = today.getMonth() - birthDate.getMonth();
                  const actualAge = monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate()) ? age - 1 : age;

                  return (
                    <tr key={enrollment.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">
                          {enrollment.nomeCompleto || enrollment.nomeCrianca || enrollment.nome || 'Nome não informado'}
                        </div>
                        {enrollment.cpf && (
                          <div className="text-sm text-gray-500">
                            {enrollment.cpf}
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {isNaN(actualAge) ? '-' : `${actualAge} anos`}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          {enrollment.nomeResponsavel || enrollment.responsavelNome || '-'}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          {enrollment.telefone || enrollment.responsavelContato || '-'}
                        </div>
                        {enrollment.email && (
                          <div className="text-sm text-gray-500">
                            {enrollment.email}
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {enrollment.racaCor || enrollment.raca || '-'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {enrollment.faixaRenda || enrollment.rendaFamiliar || 
                         (enrollment.rendaPerCapita ? `R$ ${enrollment.rendaPerCapita.toFixed(2)}` : '-')}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {getStatusBadge(enrollment.status)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {enrollment.criadoEm?.toDate?.()?.toLocaleDateString('pt-BR') || 
                         (typeof enrollment.dataCadastro === 'string' ? new Date(enrollment.dataCadastro).toLocaleDateString('pt-BR') : 
                          enrollment.dataCadastro?.toDate?.()?.toLocaleDateString('pt-BR') || '-')}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          
          {filteredEnrollments.length === 0 && (
            <div className="text-center py-8">
              <p className="text-gray-500">Nenhuma matrícula encontrada com os filtros aplicados.</p>
            </div>
          )}
        </div>
        </Container>
      </RoleGuard>
    </AuthGuard>
  );
}

