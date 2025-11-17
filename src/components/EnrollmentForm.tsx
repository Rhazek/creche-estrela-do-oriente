'use client';

import { useState } from 'react';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { validateCPF, formatCPF, formatPhone, formatCEP, validateEmail, validateBirthDate } from '@/utils/validation';

interface EnrollmentData {
  // Dados básicos do aluno
  nomeCompleto: string;
  dataNascimento: string;
  cpf: string;
  rg: string;
  
  // Dados do responsável
  nomeResponsavel: string;
  parentesco: string;
  cpfResponsavel: string;
  telefone: string;
  email: string;
  
  // Endereço
  endereco: string;
  numero: string;
  complemento: string;
  bairro: string;
  cidade: string;
  cep: string;
  
  // Dados socioeconômicos
  racaCor: string;
  faixaRenda: string;
  numeroPessoasFamilia: string;
  situacaoHabitacional: string;
  possuiDeficiencia: string;
  tipoDeficiencia?: string;
  
  // Informações adicionais
  observacoes: string;
  dataMatricula: string;
}

export default function EnrollmentForm() {
  const [formData, setFormData] = useState<EnrollmentData>({
    nomeCompleto: '',
    dataNascimento: '',
    cpf: '',
    rg: '',
    nomeResponsavel: '',
    parentesco: '',
    cpfResponsavel: '',
    telefone: '',
    email: '',
    endereco: '',
    numero: '',
    complemento: '',
    bairro: '',
    cidade: '',
    cep: '',
    racaCor: '',
    faixaRenda: '',
    numeroPessoasFamilia: '',
    situacaoHabitacional: '',
    possuiDeficiencia: '',
    tipoDeficiencia: '',
    observacoes: '',
    dataMatricula: new Date().toISOString().split('T')[0]
  });

  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');
  const [savedLocally, setSavedLocally] = useState(false);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    let formattedValue = value;
    
    // Aplicar formatação baseada no campo
    switch (name) {
      case 'cpf':
      case 'cpfResponsavel':
        formattedValue = formatCPF(value);
        break;
      case 'telefone':
        formattedValue = formatPhone(value);
        break;
      case 'cep':
        formattedValue = formatCEP(value);
        break;
    }
    
    setFormData(prev => ({
      ...prev,
      [name]: formattedValue
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    // Validações
    if (!validateCPF(formData.cpf)) {
      setError('CPF do aluno inválido');
      setLoading(false);
      return;
    }

    if (!validateCPF(formData.cpfResponsavel)) {
      setError('CPF do responsável inválido');
      setLoading(false);
      return;
    }

    if (formData.email && !validateEmail(formData.email)) {
      setError('E-mail inválido');
      setLoading(false);
      return;
    }

    if (!validateBirthDate(formData.dataNascimento)) {
      setError('Data de nascimento inválida. A criança deve ter entre 0 e 6 anos para matrícula na creche');
      setLoading(false);
      return;
    }

    try {
      // Tentar salvar no Firestore primeiro
      const docRef = await addDoc(collection(db, 'matriculas'), {
        ...formData,
        dataCadastro: serverTimestamp(),
        status: 'pendente',
        timestamp: new Date().toISOString()
      });
      
      // Enrollment saved successfully
      
      setSuccess(true);
      // Reset form
      setFormData({
        nomeCompleto: '',
        dataNascimento: '',
        cpf: '',
        rg: '',
        nomeResponsavel: '',
        parentesco: '',
        cpfResponsavel: '',
        telefone: '',
        email: '',
        endereco: '',
        numero: '',
        complemento: '',
        bairro: '',
        cidade: '',
        cep: '',
        racaCor: '',
        faixaRenda: '',
        numeroPessoasFamilia: '',
        situacaoHabitacional: '',
        possuiDeficiencia: '',
        tipoDeficiencia: '',
        observacoes: '',
        dataMatricula: new Date().toISOString().split('T')[0]
      });
    } catch (error: any) {
      console.error('Error saving enrollment:', error);
      
      // Fallback: save locally if Firebase fails
      try {
        const enrollmentData = {
          ...formData,
          dataCadastro: new Date().toISOString(),
          status: 'pendente',
          id: 'local_' + Date.now()
        };
        
        // Salvar no localStorage como backup
        const existingEnrollments = JSON.parse(localStorage.getItem('matriculas') || '[]');
        existingEnrollments.push(enrollmentData);
        localStorage.setItem('matriculas', JSON.stringify(existingEnrollments));
        
        // Enrollment saved locally as backup
        setSavedLocally(true);
        setSuccess(true);
        
        // Reset form
        setFormData({
          nomeCompleto: '',
          dataNascimento: '',
          cpf: '',
          rg: '',
          nomeResponsavel: '',
          parentesco: '',
          cpfResponsavel: '',
          telefone: '',
          email: '',
          endereco: '',
          numero: '',
          complemento: '',
          bairro: '',
          cidade: '',
          cep: '',
          racaCor: '',
          faixaRenda: '',
          numeroPessoasFamilia: '',
          situacaoHabitacional: '',
          possuiDeficiencia: '',
          tipoDeficiencia: '',
          observacoes: '',
          dataMatricula: new Date().toISOString().split('T')[0]
        });
        
      } catch (localError) {
        console.error('Error saving locally:', localError);
        
        // Specific Firebase error handling
        if (error.code === 'permission-denied') {
          setError('Erro de permissão. Verifique as configurações do Firebase.');
        } else if (error.code === 'unavailable') {
          setError('Serviço temporariamente indisponível. Tente novamente em alguns minutos.');
        } else if (error.code === 'invalid-argument') {
          setError('Dados inválidos. Verifique se todos os campos estão preenchidos corretamente.');
        } else {
          setError('Erro ao cadastrar matrícula: ' + (error.message || 'Erro desconhecido'));
        }
      }
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="bg-white p-8 rounded-lg shadow-md text-center">
        <div className="text-green-600 text-6xl mb-4">✓</div>
        <h2 className="text-2xl font-bold text-gray-800 mb-4">Matrícula Cadastrada com Sucesso!</h2>
        <p className="text-gray-600 mb-6">
          {savedLocally 
            ? "A matrícula foi salva localmente. Os dados serão sincronizados quando a conexão com o servidor for restabelecida."
            : "A matrícula foi registrada com sucesso no sistema."
          }
        </p>
        <button
          onClick={() => {
            setSuccess(false);
            setSavedLocally(false);
          }}
          className="bg-primary-600 text-white px-6 py-2 rounded-md hover:bg-primary-700 transition-colors"
        >
          Nova Matrícula
        </button>
      </div>
    );
  }

  return (
    <div className="bg-white p-8 rounded-lg shadow-md">
      <h2 className="text-2xl font-bold text-center mb-8 text-gray-800">
        Cadastro de Matrícula
      </h2>
      
      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Dados do Aluno */}
        <div className="border-b pb-6">
          <h3 className="text-lg font-semibold text-gray-700 mb-4">Dados do Aluno</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <label htmlFor="nomeCompleto" className="block text-sm font-medium text-gray-700 mb-1">
                Nome Completo *
              </label>
              <input
                type="text"
                id="nomeCompleto"
                name="nomeCompleto"
                value={formData.nomeCompleto}
                onChange={handleInputChange}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
              />
            </div>
            
            <div>
              <label htmlFor="dataNascimento" className="block text-sm font-medium text-gray-700 mb-1">
                Data de Nascimento *
              </label>
              <input
                type="date"
                id="dataNascimento"
                name="dataNascimento"
                value={formData.dataNascimento}
                onChange={handleInputChange}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
              />
            </div>
            
            <div>
              <label htmlFor="cpf" className="block text-sm font-medium text-gray-700 mb-1">
                CPF *
              </label>
              <input
                type="text"
                id="cpf"
                name="cpf"
                value={formData.cpf}
                onChange={handleInputChange}
                required
                placeholder="000.000.000-00"
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
              />
            </div>
            
            <div>
              <label htmlFor="rg" className="block text-sm font-medium text-gray-700 mb-1">
                RG *
              </label>
              <input
                type="text"
                id="rg"
                name="rg"
                value={formData.rg}
                onChange={handleInputChange}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
              />
            </div>
          </div>
        </div>

        {/* Dados do Responsável */}
        <div className="border-b pb-6">
          <h3 className="text-lg font-semibold text-gray-700 mb-4">Dados do Responsável</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <label htmlFor="nomeResponsavel" className="block text-sm font-medium text-gray-700 mb-1">
                Nome do Responsável *
              </label>
              <input
                type="text"
                id="nomeResponsavel"
                name="nomeResponsavel"
                value={formData.nomeResponsavel}
                onChange={handleInputChange}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
              />
            </div>
            
            <div>
              <label htmlFor="parentesco" className="block text-sm font-medium text-gray-700 mb-1">
                Parentesco *
              </label>
              <select
                id="parentesco"
                name="parentesco"
                value={formData.parentesco}
                onChange={handleInputChange}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
              >
                <option value="">Selecione</option>
                <option value="pai">Pai</option>
                <option value="mae">Mãe</option>
                <option value="avo">Avô/Avó</option>
                <option value="tio">Tio/Tia</option>
                <option value="irmao">Irmão/Irmã</option>
                <option value="outro">Outro</option>
              </select>
            </div>
            
            <div>
              <label htmlFor="cpfResponsavel" className="block text-sm font-medium text-gray-700 mb-1">
                CPF do Responsável *
              </label>
              <input
                type="text"
                id="cpfResponsavel"
                name="cpfResponsavel"
                value={formData.cpfResponsavel}
                onChange={handleInputChange}
                required
                placeholder="000.000.000-00"
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
              />
            </div>
            
            <div>
              <label htmlFor="telefone" className="block text-sm font-medium text-gray-700 mb-1">
                Telefone *
              </label>
              <input
                type="tel"
                id="telefone"
                name="telefone"
                value={formData.telefone}
                onChange={handleInputChange}
                required
                placeholder="(00) 00000-0000"
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
              />
            </div>
            
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                E-mail
              </label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
              />
            </div>
          </div>
        </div>

        {/* Endereço */}
        <div className="border-b pb-6">
          <h3 className="text-lg font-semibold text-gray-700 mb-4">Endereço</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <label htmlFor="endereco" className="block text-sm font-medium text-gray-700 mb-1">
                Logradouro *
              </label>
              <input
                type="text"
                id="endereco"
                name="endereco"
                value={formData.endereco}
                onChange={handleInputChange}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
              />
            </div>
            
            <div>
              <label htmlFor="numero" className="block text-sm font-medium text-gray-700 mb-1">
                Número *
              </label>
              <input
                type="text"
                id="numero"
                name="numero"
                value={formData.numero}
                onChange={handleInputChange}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
              />
            </div>
            
            <div>
              <label htmlFor="complemento" className="block text-sm font-medium text-gray-700 mb-1">
                Complemento
              </label>
              <input
                type="text"
                id="complemento"
                name="complemento"
                value={formData.complemento}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
              />
            </div>
            
            <div>
              <label htmlFor="bairro" className="block text-sm font-medium text-gray-700 mb-1">
                Bairro *
              </label>
              <input
                type="text"
                id="bairro"
                name="bairro"
                value={formData.bairro}
                onChange={handleInputChange}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
              />
            </div>
            
            <div>
              <label htmlFor="cidade" className="block text-sm font-medium text-gray-700 mb-1">
                Cidade *
              </label>
              <input
                type="text"
                id="cidade"
                name="cidade"
                value={formData.cidade}
                onChange={handleInputChange}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
              />
            </div>
            
            <div>
              <label htmlFor="cep" className="block text-sm font-medium text-gray-700 mb-1">
                CEP *
              </label>
              <input
                type="text"
                id="cep"
                name="cep"
                value={formData.cep}
                onChange={handleInputChange}
                required
                placeholder="00000-000"
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
              />
            </div>
          </div>
        </div>

        {/* Dados Socioeconômicos */}
        <div className="border-b pb-6">
          <h3 className="text-lg font-semibold text-gray-700 mb-4">Dados Socioeconômicos</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="racaCor" className="block text-sm font-medium text-gray-700 mb-1">
                Raça/Cor (Autodeclarada) *
              </label>
              <select
                id="racaCor"
                name="racaCor"
                value={formData.racaCor}
                onChange={handleInputChange}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
              >
                <option value="">Selecione</option>
                <option value="branca">Branca</option>
                <option value="preta">Preta</option>
                <option value="parda">Parda</option>
                <option value="amarela">Amarela</option>
                <option value="indigena">Indígena</option>
                <option value="nao_informado">Não informado</option>
              </select>
            </div>
            
            <div>
              <label htmlFor="faixaRenda" className="block text-sm font-medium text-gray-700 mb-1">
                Faixa de Renda Familiar *
              </label>
              <select
                id="faixaRenda"
                name="faixaRenda"
                value={formData.faixaRenda}
                onChange={handleInputChange}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
              >
                <option value="">Selecione</option>
                <option value="ate_1_salario">Até 1 salário mínimo</option>
                <option value="1_a_2_salarios">1 a 2 salários mínimos</option>
                <option value="2_a_3_salarios">2 a 3 salários mínimos</option>
                <option value="3_a_5_salarios">3 a 5 salários mínimos</option>
                <option value="acima_5_salarios">Acima de 5 salários mínimos</option>
                <option value="nao_informado">Não informado</option>
              </select>
            </div>
            
            <div>
              <label htmlFor="numeroPessoasFamilia" className="block text-sm font-medium text-gray-700 mb-1">
                Número de Pessoas na Família *
              </label>
              <select
                id="numeroPessoasFamilia"
                name="numeroPessoasFamilia"
                value={formData.numeroPessoasFamilia}
                onChange={handleInputChange}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
              >
                <option value="">Selecione</option>
                <option value="1">1 pessoa</option>
                <option value="2">2 pessoas</option>
                <option value="3">3 pessoas</option>
                <option value="4">4 pessoas</option>
                <option value="5">5 pessoas</option>
                <option value="6_ou_mais">6 ou mais pessoas</option>
              </select>
            </div>
            
            <div>
              <label htmlFor="situacaoHabitacional" className="block text-sm font-medium text-gray-700 mb-1">
                Situação Habitacional *
              </label>
              <select
                id="situacaoHabitacional"
                name="situacaoHabitacional"
                value={formData.situacaoHabitacional}
                onChange={handleInputChange}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
              >
                <option value="">Selecione</option>
                <option value="propria">Própria</option>
                <option value="alugada">Alugada</option>
                <option value="cedida">Cedida</option>
                <option value="financiada">Financiada</option>
                <option value="outro">Outro</option>
              </select>
            </div>
            
            <div>
              <label htmlFor="possuiDeficiencia" className="block text-sm font-medium text-gray-700 mb-1">
                Possui Deficiência? *
              </label>
              <select
                id="possuiDeficiencia"
                name="possuiDeficiencia"
                value={formData.possuiDeficiencia}
                onChange={handleInputChange}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
              >
                <option value="">Selecione</option>
                <option value="nao">Não</option>
                <option value="sim">Sim</option>
              </select>
            </div>
            
            {formData.possuiDeficiencia === 'sim' && (
              <div>
                <label htmlFor="tipoDeficiencia" className="block text-sm font-medium text-gray-700 mb-1">
                  Tipo de Deficiência
                </label>
                <input
                  type="text"
                  id="tipoDeficiencia"
                  name="tipoDeficiencia"
                  value={formData.tipoDeficiencia}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                />
              </div>
            )}
          </div>
        </div>

        {/* Observações */}
        <div>
          <label htmlFor="observacoes" className="block text-sm font-medium text-gray-700 mb-1">
            Observações
          </label>
          <textarea
            id="observacoes"
            name="observacoes"
            value={formData.observacoes}
            onChange={handleInputChange}
            rows={4}
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
            placeholder="Informações adicionais relevantes..."
          />
        </div>

        {error && (
          <div className="text-red-600 text-sm text-center bg-red-50 p-3 rounded-md">
            {error}
          </div>
        )}

        <button
          type="submit"
          disabled={loading}
          className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? 'Cadastrando...' : 'Cadastrar Matrícula'}
        </button>
      </form>
    </div>
  );
}
