# La Casa Di Frango — Sistema de Gestão de Expedientes

> **Sistema profissional de controle de estoque e vendas para gestão de expedientes de frango assado**

---

## 📋 Índice

- [Sobre o Projeto](#sobre-o-projeto)
- [Funcionalidades](#funcionalidades)
- [Tecnologias Utilizadas](#tecnologias-utilizadas)
- [Como Rodar o Projeto](#como-rodar-o-projeto)
- [Estrutura do Projeto](#estrutura-do-projeto)
- [Documentação Completa](#documentação-completa)
- [Deploy como PWA](#deploy-como-pwa)
- [Configuração do Supabase](#configuração-do-supabase)
- [Rodar os Testes](#rodar-os-testes)

---

## Sobre o Projeto

**La Casa Di Frango** é um sistema web moderno e responsivo desenvolvido para **gestão interna de expedientes** de um negócio de frango assado. O sistema resolve o problema de controlar em tempo real:

- Estoque diário de frangos (com recheio, sem recheio, meio frango)
- Encomendas de clientes (com rastreamento de retirada)
- Vendas balcão/rápidas
- Produto especial de domingo (maionese e costela)
- Sincronização automática entre múltiplos dispositivos (iPad, celular, computador)
- Backup automático e manual dos dados

### Para Quem É

- Proprietários e gerentes de negócios de frango assado
- Equipes de balcão que precisam registrar vendas em tempo real
- Gerência que quer visualizar histórico e métricas de vendas
- Qualquer um que precisa sincronizar dados entre múltiplos dispositivos sem perder informações

### Diferenciais

✅ **Offline-first**: funciona sem internet e sincroniza quando volta online  
✅ **PWA instalável**: use como um app nativo no iPad e celular  
✅ **Sem login obrigatório**: pronto para usar imediatamente  
✅ **Backup automático**: a cada 5 minutos, sem ação do usuário  
✅ **Suporte a múltiplos dispositivos**: todos compartilham os mesmos dados via Supabase  

---

## Funcionalidades

### ✨ Gestão de Expedientes

- **Criar novo expediente** — Iniciar um novo dia de vendas registrando estoque inicial
- **Visualizar expediente ativo** — Dashboard com estoque, encomendas e vendas em tempo real
- **Encerrar expediente** — Fechar o dia de vendas (irreversível)
- **Histórico de expedientes** — Consultar expedientes passados com filtro por data
- **Modo domingo** — Ativa produtos especiais: maionese (2 tamanhos) e costela

### 📦 Controle de Estoque

- **Visualizar disponibilidade** — Quantidade original, encomendado, vendido, disponível
- **Estimativa em tempo real** — Atualiza conforme encomendas e vendas são registradas
- **Nunca fica negativo** — Sistema impede sobrevenda

### 🛍️ Encomendas

- **Registrar encomenda** — Nome, telefone e itens solicitados
- **Marcar como retirado** — Quando cliente busca a encomenda (irreversível)
- **Buscar encomenda** — Por nome ou telefone
- **Lista visual** — Rápido acesso a todas as encomendas do dia com status

### 💰 Vendas Rápidas

- **Venda sem cliente** — Para clientes anônimos ou balcão
- **Desconta do estoque** — Funciona igual às encomendas
- **Sem rastreamento** — Não requer nome ou telefone

### 💾 Backup e Sincronização

- **Backup automático** — A cada 5 minutos no localStorage (emergência)
- **Backup manual** — Exportar todos os dados em JSON para download
- **Importação de backup** — Restaurar dados de um arquivo JSON anterior
- **Sync com Supabase** — Quando online, envia dados para servidor (offline-first)
- **Sincronização entre dispositivos** — Todos os aparelhos compartilham os dados
- **Status de conexão** — Indicador visual se está online/offline e dados pendentes

---

## Tecnologias Utilizadas

| Camada | Tecnologia | Descrição |
|--------|-----------|-----------|
| **Frontend** | React 19 | UI interativa com hooks |
| | Vite | Build rápido e dev server |
| | Tailwind CSS 4 | Estilização moderna |
| | React Router 7 | Navegação entre telas |
| **Persistência** | IndexedDB | Banco local principal |
| | localStorage | Cache rápido + backup |
| | Supabase | Sync online com servidor |
| **Notificações** | React Toastify | Mensagens ao usuário |
| **PWA** | vite-plugin-pwa | Instalar como app |
| **Testes** | Vitest | Testes unitários |
| | React Testing Library | Testes de componentes |
| | fake-indexeddb | Mock do IndexedDB |
| **Code Quality** | ESLint | Linting de código |
| | PostCSS | Transformação CSS |

---

## Como Rodar o Projeto

### Pré-requisitos

- **Node.js** 18+ ([baixar aqui](https://nodejs.org))
- **npm** (vem com Node.js)
- **git** (opcional, se clonar do repositório)

### Passo 1: Clonar ou Descompactar

```bash
# Se tiver git:
git clone <seu-repositorio>
cd la-casa-di-frango

# Ou descompactar o arquivo ZIP
unzip la-casa-di-frango.zip
cd la-casa-di-frango
```

### Passo 2: Instalar Dependências

```bash
npm install
```

### Passo 3: Rodar em Desenvolvimento

```bash
npm run dev
```

O app abre automaticamente em `http://localhost:5173`. Se não abrir, copie e cole a URL no navegador.

### Passo 4: Fazer Build para Produção

```bash
npm run build
```

Gera pasta `dist/` pronta para deploy.

### Passo 5: Preview do Build

```bash
npm run preview
```

Visualiza como ficará o app em produção localmente.

### Passo 6: Rodar os Testes

```bash
npm test                  # Modo watch (re-roda a cada mudança)
npm run test:ui          # Com interface visual
npm run test:coverage    # Com cobertura de testes
```

---

## Estrutura do Projeto

```
la-casa-di-frango/
├── public/                    # Assets estáticos
│   └── site.webmanifest      # Manifesto da PWA
├── src/
│   ├── __tests__/            # Testes automatizados
│   │   ├── components/       # Testes de componentes
│   │   ├── hooks/            # Testes de hooks
│   │   ├── integration/      # Testes de integração (e2e)
│   │   └── services/         # Testes de serviços
│   ├── assets/               # Imagens, ícones, logos
│   │   ├── icons/
│   │   ├── images/
│   │   └── logos/
│   ├── components/           # Componentes React reutilizáveis
│   │   ├── Cards/            # Cards (EncomendaCard, etc)
│   │   ├── Forms/            # Formulários
│   │   ├── Header/           # Headers
│   │   ├── Layout/           # Layouts (Lista, Carrosel, etc)
│   │   ├── Modals/           # Modais
│   │   └── Ui/               # Componentes UI isolados
│   ├── constants/            # Constantes da aplicação
│   ├── contexts/             # React Contexts (estado global)
│   │   ├── ExpedienteContext.jsx  # Estado do expediente ativo
│   │   └── ToastContext.jsx       # Sistema de notificações
│   ├── hooks/                # Hooks customizados
│   │   ├── useExpediente.js      # Hook do contexto
│   │   ├── useBackupAutomatico.js # Backup a cada 5min
│   │   └── useToast.js           # Hook de notificações
│   ├── screens/              # Telas da aplicação
│   │   ├── Home.jsx          # Tela inicial com histórico
│   │   ├── Dashboard.jsx     # Expediente ativo
│   │   ├── StockEntry.jsx    # Criar novo expediente
│   │   ├── Encomenda.jsx     # Registrar encomenda
│   │   ├── Venda.jsx         # Registrar venda rápida
│   │   ├── ExpedienteHistorico.jsx # Visualizar histórico
│   │   └── Config.jsx        # Configurações e backup
│   ├── services/             # Lógica de negócio
│   │   ├── expedienteService.js    # Operações em expedientes
│   │   ├── storageManager.js       # Orquestração de armazenamento
│   │   ├── toastService.js         # Templates de mensagens
│   │   └── storage/
│   │       ├── indexedDB.js        # Banco local
│   │       ├── backupService.js    # Backup JSON
│   │       ├── syncService.js      # Sync com Supabase
│   │       └── supabaseClient.js   # Cliente Supabase
│   ├── App.jsx               # Componente raiz
│   ├── main.jsx              # Entry point
│   ├── App.css               # Estilos globais
│   └── index.css             # Reset CSS
├── docs/                      # Documentação
│   ├── ARQUITETURA.md        # Arquitetura técnica
│   ├── REGRAS_DE_NEGOCIO.md  # Regras de negócio
│   ├── GUIA_DO_USUARIO.md    # Manual do usuário
│   ├── BANCO_DE_DADOS.md     # Estrutura de dados
│   └── TESTES.md             # Documentação de testes
├── vite.config.js            # Configuração Vite
├── vitest.config.js          # Configuração Vitest
├── vitest.setup.js           # Setup de testes
├── tailwind.config.js        # Configuração Tailwind
├── postcss.config.js         # Configuração PostCSS
├── eslint.config.js          # Configuração ESLint
├── package.json              # Dependências e scripts
└── README.md                 # Este arquivo
```

---

## Documentação Completa

Para entender completamente o projeto, consulte:

| Documento | Conteúdo |
|-----------|----------|
| 📐 [ARQUITETURA.md](docs/ARQUITETURA.md) | Visão técnica das camadas, fluxo de dados, decisões de design |
| 📋 [REGRAS_DE_NEGOCIO.md](docs/REGRAS_DE_NEGOCIO.md) | Todas as regras do sistema: expedientes, estoque, encomendas, modo domingo |
| 👤 [GUIA_DO_USUARIO.md](docs/GUIA_DO_USUARIO.md) | Manual passo a passo para usar o app (instalação, operação, FAQ) |
| 🗄️ [BANCO_DE_DADOS.md](docs/BANCO_DE_DADOS.md) | Estrutura dos dados, modelos de objetos, persistência |
| 🧪 [TESTES.md](docs/TESTES.md) | Como rodar e entender os testes automatizados |

---

## Configuração do Supabase

O app já vem com credenciais Supabase pré-configuradas e funcionando. Mas se você quer configurar seu próprio projeto:

### 1. Criar Projeto no Supabase

1. Acesse [supabase.com](https://supabase.com)
2. Clique em "New project"
3. Preencha os dados (nome, senha, região)
4. Aguarde a criação (2-5 minutos)

### 2. Criar a Tabela SQL

Vá em **SQL Editor** → **New query** e copie/cola:

```sql
create table if not exists expedientes (
  id text primary key,
  date text not null,
  status text not null default 'active',
  is_sunday boolean default false,
  iniciado_em bigint,
  encerrado_em bigint,
  estoque jsonb default '{}',
  pedidos jsonb default '[]',
  vendas jsonb default '[]',
  updated_at bigint default extract(epoch from now()) * 1000,
  created_at timestamp default now()
);

create index if not exists idx_expedientes_date on expedientes(date);
create index if not exists idx_expedientes_status on expedientes(status);
```

### 3. Obter Credenciais

Vá em **Settings** → **API** e copie:
- `Project URL` → use como `SUPABASE_URL`
- `anon public` → use como `SUPABASE_KEY`

### 4. Configurar no App

Edite [src/services/storage/supabaseClient.js](src/services/storage/supabaseClient.js):

```javascript
const SUPABASE_URL = "https://seu-projeto.supabase.co";
const SUPABASE_KEY = "sua-chave-aqui";
```

### 5. Ativar Row Level Security (opcional)

Para segurança em produção, configure RLS policies no Supabase console.

---

## Deploy como PWA

O app já é uma Progressive Web App (PWA). Para instalar em iPad ou celular:

### No iPad (Safari)

1. Abra o app no Safari
2. Toque no ícone de compartilhar (↑)
3. Selecione "Add to Home Screen"
4. Nomeie como "Frango" ou "La Casa Di Frango"
5. Toque "Add"

### No Android (Chrome)

1. Abra o app no Chrome
2. Toque no menu (⋮) → "Install app"
3. Confirme

### No Computador (Chrome/Edge)

1. Abra o app no navegador
2. Toque no ícone de instalação (canto superior direito)
3. Confirme

O app funciona 100% offline após instalado. As mudanças sincronizam quando volta online.

---

## Rodar os Testes

### Modo Watch (Recomendado para Desenvolvimento)

```bash
npm test
```

O Vitest fica observando alterações e re-roda os testes automaticamente.

### Rodar Uma Vez

```bash
npm run test:ui
```

Abre uma interface visual mostrando todos os testes e resultados.

### Cobertura de Testes

```bash
npm run test:coverage
```

Gera relatório HTML em `coverage/` mostrando quais linhas estão cobertas.

### Entender os Resultados

```
 ✓ src/components/EncomendaCard.test.jsx (3)
 ✓ src/services/expedienteService.test.js (8)
 ✗ src/services/storage.test.js (1)
   └─ falha ao calcular total
```

- ✓ = passou
- ✗ = falhou
- O número indica quantos testes tem naquele arquivo

---

## 🛠️ Desenvolvimento

### Scripts Disponíveis

| Comando | Descrição |
|---------|-----------|
| `npm run dev` | Inicia servidor de desenvolvimento |
| `npm run build` | Faz build para produção |
| `npm run preview` | Visualiza build localmente |
| `npm test` | Roda testes em modo watch |
| `npm run test:ui` | Abre interface visual de testes |
| `npm run test:coverage` | Gera relatório de cobertura |
| `npm run lint` | Verifica código com ESLint |

### Adicionar Novas Dependências

```bash
npm install pacote-novo
```

### Remover Dependências

```bash
npm uninstall pacote
```

---

## 📱 Compatibilidade

| Navegador | Suporte |
|-----------|---------|
| Chrome / Edge | ✅ Total |
| Safari (iOS) | ✅ Total |
| Firefox | ✅ Total |
| Internet Explorer | ❌ Não suportado |

### Resolução Mínima

- **Desktop**: 1024px (adaptável a 768px)
- **Tablet**: 600px (iPad mini e acima)
- **Celular**: 360px (testado em iPhone SE e maiores)

---

## 🐛 Solução de Problemas

### "Erro: expediente não encontrado"

**Causa**: Expediente foi encerrado ou o app foi resetado

**Solução**: Crie um novo expediente em "Começar expediente"

### "Dados sumiram ou não sincronizam"

**Causa**: IndexedDB corrompido ou Supabase indisponível

**Solução**: Faça backup/import de um arquivo JSON anterior em Configurações

### "App fica lento ou congelado"

**Causa**: Muitos expedientes no histórico

**Solução**: Limpe dados antigos ou divida em múltiplos backups

### "Não consegue instalar como PWA"

**Causa**: App não está em HTTPS em produção

**Solução**: Deploy em Vercel, Netlify ou outro host HTTPS

---

## 📄 Licença

Este projeto é de uso interno. Propriedade de La Casa Di Frango.

---

## 👥 Contribuidores

Desenvolvido com ❤️ para melhorar a gestão de vendas de frango assado.

**Versão**: 1.0.0  
**Última atualização**: 11 de maio de 2026  
**Status**: ✅ Produção

---

## 📞 Suporte

Para dúvidas ou problemas:

1. Consulte [GUIA_DO_USUARIO.md](docs/GUIA_DO_USUARIO.md)
2. Verifique [FAQ na documentação](docs/GUIA_DO_USUARIO.md#perguntas-frequentes)
3. Consulte logs do navegador (F12 → Console)
