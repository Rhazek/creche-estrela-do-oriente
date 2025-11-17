# 🎓 Creche-Escola - Sistema de Gestão

Sistema completo de gestão para creche-escola desenvolvido com **Next.js 14**, **Firebase** e **TailwindCSS**. Pronto para deploy em Vercel com suporte a Docker.

## 🚀 Tecnologias

- **Next.js 14** (App Router) - Framework React moderno
- **TypeScript** - Type safety
- **Firebase** - Authentication, Firestore, Storage
- **TailwindCSS** - Estilização responsiva
- **React Hook Form** + **Zod** - Validação de formulários
- **Lucide React** - Ícones modernos
- **Docker** - Containerização
- **Vercel** - Deploy automático

## 📋 Funcionalidades

### 🔐 Autenticação e Autorização
- ✅ Sistema de login e cadastro seguro
- ✅ Aprovação de usuários por administradores
- ✅ Controle de acesso baseado em perfis (Admin, Diretor, Secretária)
- ✅ Firebase Authentication

### 📝 Módulos Principais

#### 1. **Pré-Matrículas**
- Cadastro de solicitações de pré-matrícula
- Dashboard com estatísticas (Em Análise, Aprovadas, Rejeitadas)
- Aprovação/Rejeição de solicitações
- Filtros avançados
- Edição de pré-matrículas

#### 2. **Matrículas**
- Listagem completa com filtros
- Integração automática com pré-matrículas aprovadas
- Formulário completo em 7 etapas
- Gestão de responsáveis, endereço, documentos
- Composição familiar
- Informações de saúde
- Edição de matrículas existentes

#### 3. **Rematrícula**
- Fluxo otimizado para rematrícula
- Prefill automático de dados
- Formulário pré-preenchido

#### 4. **Usuários & Aprovação**
- Gerenciamento de usuários do sistema
- Aprovação de novos cadastros
- Edição de permissões
- Dashboard de aprovações

#### 5. **Relatórios & Dashboard**
- Dashboard com gráficos e estatísticas
- Distribuição por idade
- Exportação de dados em PDF
- Visualização de dados consolidados

## 📖 Documentação Rápida

### Desenvolvimento Local

```bash
# 1. Clonar repositório
git clone https://github.com/Rhazek/creche-escola.git
cd creche-escola

# 2. Instalar dependências
npm install

# 3. Configurar variáveis de ambiente
cp .env.example .env.local
# Edite .env.local com suas credenciais Firebase

# 4. Rodar servidor de desenvolvimento
npm run dev
# Acesse: http://localhost:3000
```

### Docker (Dev)

```bash
npm run docker:dev
# ou
docker-compose -f docker-compose.dev.yml up -d
```

### Docker (Produção)

```bash
npm run docker:prod
# ou
docker-compose up -d
```

### Deploy Vercel

```bash
npm install -g vercel
vercel login
vercel link
# Configure variáveis de ambiente no dashboard Vercel
vercel --prod
```

## 🔧 Configuração Detalhada

### Variáveis de Ambiente

Copie `.env.example` para `.env.local`:

```bash
cp .env.example .env.local
```

Preencha com suas credenciais do Firebase (encontre em: Firebase Console > Project Settings > General):

```env
NEXT_PUBLIC_FIREBASE_API_KEY=AIzaSyD...
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=creche-escola.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=creche-escola
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=creche-escola.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=12345...
NEXT_PUBLIC_FIREBASE_APP_ID=1:12345:web:abc...
NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID=G-XXXXX
```

> **Nota**: Essas variáveis serão enviadas ao navegador (prefixo `NEXT_PUBLIC_`). Para senhas e tokens sensíveis, use Firebase Security Rules.

## 🔥 Firebase Setup

### Firestore Collections Necessárias

- `users` - Usuários do sistema
- `pre_enrollments` - Pré-matrículas
- `enrollments` - Matrículas

### Security Rules

As regras de segurança estão em `firestore.rules`. Para aplicar:

1. Firebase Console > Firestore Database > Rules
2. Cole o conteúdo de `firestore.rules`
3. Clique em "Publicar"

### Storage Rules

As regras estão em `storage.rules`:

1. Firebase Console > Storage > Rules
2. Cole o conteúdo de `storage.rules`
3. Clique em "Publicar"

## 📦 Estrutura do Projeto

```
creche-escola/
├── src/
│   ├── app/                      # Rotas Next.js (App Router)
│   │   ├── dashboard/           # Dashboard com gráficos
│   │   ├── matricula/           # Gestão de matrículas
│   │   ├── pre-matriculas/      # Gestão de pré-matrículas
│   │   ├── rematriculas/        # Fluxo de rematrícula
│   │   ├── aprovacao/           # Aprovação de cadastros
│   │   ├── relatorios/          # Relatórios
│   │   ├── login/               # Autenticação
│   │   └── layout.tsx           # Layout principal
│   ├── components/              # Componentes React
│   │   ├── ui/                 # Componentes base (Input, Button, etc)
│   │   ├── EnrollmentForm/     # Wizard de 7 etapas
│   │   ├── dashboard/          # Componentes de dashboard
│   │   └── layout/             # Navbar, Sidebar
│   ├── lib/                    # Lógica compartilhada
│   │   ├── firebase.ts         # Configuração Firebase
│   │   ├── enrollment-service.ts
│   │   ├── pre-enrollment-service.ts
│   │   ├── enrollment-schemas.ts  # Validação Zod
│   │   ├── dashboard-service.ts
│   │   └── utils.ts
│   ├── hooks/                  # Custom hooks (useAuth, etc)
│   └── utils/                  # Funções utilitárias
├── public/                     # Assets estáticos
├── .github/                    # CI/CD (opcional)
├── docker-compose.yml          # Produção
├── docker-compose.dev.yml      # Desenvolvimento
├── Dockerfile                  # Build produção
├── Dockerfile.dev              # Build desenvolvimento
├── .env.example                # Template de variáveis
├── .dockerignore               # Arquivos a ignorar no Docker
├── vercel.json                 # Configuração Vercel (opcional)
├── next.config.js              # Configuração Next.js
├── tailwind.config.js          # Configuração Tailwind
├── tsconfig.json               # Configuração TypeScript
└── README.md                   # Este arquivo
```

## 🔐 Sistema de Autenticação

- **Firebase Authentication**: Segurança de nível enterprise
- **Role-Based Access**: Admin, Diretor, Secretária
- **AuthGuard & RoleGuard**: Proteção de rotas
- **Automático**: Redirecionamento para login se não autenticado

## 📚 Scripts Disponíveis

```bash
npm run dev              # Servidor de desenvolvimento (hot-reload)
npm run build            # Build otimizado para produção
npm run start            # Inicia servidor de produção
npm run lint             # Valida código (ESLint)

npm run docker:dev       # Docker com hot-reload (dev)
npm run docker:prod      # Docker para produção
npm run docker:down      # Para todos os containers
```

## 🌐 Deploy Vercel

### Método 1: GitHub + Vercel (Recomendado)

1. **Push para GitHub**:
```bash
git remote add origin https://github.com/seu-usuario/creche-escola.git
git branch -M main
git push -u origin main
```

2. **Conectar no Vercel**:
   - Acesse [https://vercel.com](https://vercel.com)
   - Clique "New Project"
   - Selecione seu repositório GitHub
   - Vercel detecta automaticamente como Next.js

3. **Configurar Variáveis de Ambiente**:
   - No painel do Vercel: **Settings > Environment Variables**
   - Adicione cada variável do `.env.local`:
     - `NEXT_PUBLIC_FIREBASE_API_KEY`
     - `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN`
     - `NEXT_PUBLIC_FIREBASE_PROJECT_ID`
     - (... e todas as outras)

4. **Deploy Automático**:
   - Toda vez que fizer push para `main`, Vercel redeploya automaticamente

### Método 2: Deploy Manual

```bash
npm install -g vercel
vercel login
vercel link                    # Conecta ao projeto Vercel
vercel env pull               # Puxa variáveis do Vercel
vercel --prod                 # Deploy para produção
```

## 🔒 Considerações de Segurança

### Dados Firestore

✅ **Seus dados originais são mantidos intactos**:
- O sistema conecta ao mesmo projeto Firebase
- Usa as mesmas collections (users, pre_enrollments, enrollments)
- As Security Rules continuam válidas

### Variáveis de Ambiente

⚠️ **Proteja suas credenciais**:
- Nunca commite `.env.local` (está no `.gitignore`)
- Configure variáveis sensíveis apenas no painel de cada plataforma
- Use `NEXT_PUBLIC_*` apenas para dados que podem ser expostos

## 🐳 Docker - Deep Dive

### Desenvolvimento Local

```bash
docker-compose -f docker-compose.dev.yml up -d
# - Hot-reload habilitado
# - Volumes sincronizados
# - Logs visíveis em tempo real
```

Ver logs:
```bash
docker-compose -f docker-compose.dev.yml logs -f nextjs-app
```

### Produção

```bash
docker-compose up -d
# - Imagem otimizada (multi-stage build)
# - Node.js apenas (sem dev dependencies)
# - Porta 3000 exposta
```

### Docker Hub (Opcional)

Para compartilhar imagem:

```bash
docker build -t seu-usuario/creche-escola:latest .
docker push seu-usuario/creche-escola:latest
```

## 🔄 Workflow de Desenvolvimento

```
1. Clone local
   ↓
2. npm install + .env.local setup
   ↓
3. npm run dev (ou docker:dev)
   ↓
4. Faça mudanças
   ↓
5. npm run build (valida)
   ↓
6. git add . && git commit && git push
   ↓
7. Vercel redeploya automaticamente
```

## ✅ Checklist Pre-Deploy

Antes de fazer push para GitHub/Vercel:

- [ ] `npm run build` executa sem erros
- [ ] `npm run lint` sem warnings críticos
- [ ] `.env.local` contém todas as variáveis corretas
- [ ] `.gitignore` contém `.env.local` e `.env*.local`
- [ ] Testou localmente: `npm run dev`
- [ ] Configurou variáveis no painel Vercel
- [ ] Firebase Security Rules estão ativas
- [ ] Firestore foi acessado com as credenciais (confirma conexão)

## 🆘 Troubleshooting

### "Module not found: Cannot find module 'firebase'"

```bash
npm install firebase
```

### Build falha: "Environment variables not found"

Verifique se configurou as variáveis no painel **Vercel Settings > Environment Variables**

### "Cannot connect to Firebase" em produção

1. Confirme que as variáveis `NEXT_PUBLIC_FIREBASE_*` estão corretas
2. Verifique as Security Rules em `firestore.rules`
3. Confirme que o projeto Firebase está ativo

### Docker: "Cannot find dependency"

```bash
docker-compose down -v
docker-compose -f docker-compose.dev.yml build --no-cache
docker-compose -f docker-compose.dev.yml up -d
```

### Dados não aparecem após deploy

1. Verifique se está usando o mesmo projeto Firebase
2. Confirme que `NEXT_PUBLIC_FIREBASE_PROJECT_ID` é o mesmo
3. Acesse Firebase Console > Firestore > Data e confirme que as collections existem

## 📊 Performance & Optimization

✅ **Já otimizado**:
- Next.js 14 com App Router
- Image optimization automática
- Code splitting automático
- CSS purging com Tailwind
- Multi-stage Docker build

## 📞 Suporte & Dúvidas

1. Consulte a documentação:
   - [Next.js Docs](https://nextjs.org/docs)
   - [Firebase Docs](https://firebase.google.com/docs)
   - [Vercel Docs](https://vercel.com/docs)

2. Abra uma issue no GitHub com:
   - Versão do Node.js
   - Erros do console
   - Passos para reproduzir

---

## 🚀 Quick Start (TL;DR)

```bash
# Clone, setup, dev
git clone https://github.com/Rhazek/creche-escola.git
cd creche-escola
npm install
cp .env.example .env.local
# Edite .env.local com Firebase config
npm run dev

# Push para GitHub + Vercel
git push origin main
# Configure vars no Vercel > Settings > Environment Variables
# Deploy automático acontece!
```

---

**Última atualização**: 16/11/2025
Essa garante que o sistema funcione mesmo sem configuração do Firebase.

## 🧪 Validações Implementadas

- **CPF**: Algoritmo completo de validação
- **Email**: Validação de formato
- **Idade**: Verificação de 2-5 anos para creche
- **Formatação automática**: CPF, telefone, CEP
- **Campos obrigatórios**: Validação em tempo real

## 🎯 Funcionalidades Futuras

- [ ] Notificações por email
- [ ] Sistema de fila de espera
- [ ] Integração com sistemas governamentais
- [ ] Analytics avançado
- [ ] API REST para terceiros

## 🤝 Contribuição

1. Faça um fork do projeto
2. Crie uma branch para sua feature (`git checkout -b feature/AmazingFeature`)
3. Commit suas mudanças (`git commit -m 'Add some AmazingFeature'`)
4. Push para a branch (`git push origin feature/AmazingFeature`)
5. Abra um Pull Request

## 📝 Licença

Este projeto está sob a licença MIT. Veja o arquivo LICENSE para mais detalhes.

---

⭐ **Se este projeto foi útil para você, considere dar uma estrela!**