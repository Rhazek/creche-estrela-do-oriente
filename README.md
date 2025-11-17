git clone https://github.com/Rhazek/creche-escola.git
docker-compose -f docker-compose.dev.yml up -d
docker-compose up -d
git clone https://github.com/Rhazek/creche-escola.git
# 🎓 Creche Estrela do Oriente — Sistema de Gestão

Sistema de gestão escolar para creches públicas, desenvolvido com Next.js 14, TypeScript, Firebase e TailwindCSS. Pronto para desenvolvimento local, deploy em Vercel e execução com Docker.

## 🚀 Tecnologias

- Next.js 14 (App Router)
- TypeScript
- Firebase (Auth, Firestore, Storage)
- TailwindCSS
- React Hook Form + Zod
- Lucide React (ícones)
- Docker (opcional)

## 📋 Principais funcionalidades

- Autenticação (Firebase Auth) e autorização por perfil (funcionário / administrador)
- Fluxos de pré-matrícula e matrícula (wizard em múltiplas etapas)
- Aprovação de usuários e gestão de permissões
- Dashboard com relatórios e filtros
- Exportação básica em PDF
- Suporte a rascunhos e salvamento local quando o Firebase não estiver disponível

## 📸 Screenshots

Imagens e capturas estão em `public/` e no histórico do repositório. As imagens usadas no README são apenas representativas.

## 🛠️ Instalação (Desenvolvimento)

1. Clone o repositório:

```bash
git clone https://github.com/Rhazek/creche-escola.git
cd creche-escola
```

2. Instale dependências:

```bash
npm install
```

3. Configure variáveis de ambiente:

```bash
cp .env.example .env.local
# Edite .env.local com suas credenciais do Firebase
```

Exemplo mínimo (.env.local):

```ini
NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_auth_domain
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_storage_bucket
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
```

4. Rodar em modo de desenvolvimento:

```bash
npm run dev
# Acesse: http://localhost:3000
```

## 🐳 Docker (opcional)

Desenvolvimento com Docker (hot-reload):

```bash
docker-compose -f docker-compose.dev.yml up --build
```

Produção (com imagem otimizada):

```bash
docker-compose -f docker-compose.yml up -d --build
```

## 🚀 Deploy (Vercel)

1. Push do código para GitHub.
2. Conecte o repositório no Vercel e defina as variáveis de ambiente equivalentes às do `.env.local` no painel do projeto.
3. Vercel detecta Next.js e fará deploy automático a cada push.

Alternativamente, usar a CLI do Vercel:

```bash
npm i -g vercel
vercel login
vercel --prod
```

## 🔐 Firebase — configuração rápida

- Colections principais usadas: `usuarios`, `pre-matriculas`, `matriculas` (nomes internos podem variar conforme o código).
- Regras de segurança do Firestore estão em `firestore.rules` e devem ser publicadas no Console do Firebase.

## 📁 Estrutura resumida do projeto

```
src/
 ├─ app/                # Rotas (Next.js App Router)
 ├─ components/         # Componentes React (forms, UI, layout)
 ├─ lib/                # Serviços (firebase, serviços de matrícula, utils)
 └─ hooks/              # Hooks customizados (useAuth, etc.)
```

## ⚙️ Scripts úteis

```bash
npm run dev        # Desenvolvimento
npm run build      # Build de produção
npm run start      # Inicia app de produção
npm run lint       # ESLint
npm run docker:dev # Helper para docker dev
npm run docker:prod# Helper para docker prod
```

## ✅ Checklist antes do deploy

- Rodar `npm run build` e confirmar que compila sem erros
- Garantir que `.env.local` NÃO está sendo committed
- Configurar variáveis de ambiente no Vercel/servidor
- Conferir regras do Firestore e Storage

## 🔎 Observações de segurança

- Removi logs que expunham dados sensíveis no console do navegador. Mantemos `console.error()` para erro crítico.
- Variáveis com `NEXT_PUBLIC_` são expostas ao cliente — evite colocar segredos nelas.

## 🙋 Contribuição

Abra uma issue ou envie um Pull Request. Inclua passos para reproduzir e a versão do Node.js utilizada.

## 📄 Licença

MIT — veja o arquivo `LICENSE`.

---

Desenvolvido com ❤️ para a Creche Estrela do Oriente

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