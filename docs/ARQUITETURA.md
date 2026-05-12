# Arquitetura do Sistema

> **Documentação técnica da arquitetura, camadas e fluxo de dados do La Casa Di Frango**

---

## 📋 Índice

- [Visão Geral](#visão-geral)
- [Camadas da Aplicação](#camadas-da-aplicação)
- [Fluxo de Dados](#fluxo-de-dados)
- [Armazenamento em Camadas](#armazenamento-em-camadas)
- [Ciclo de Vida de um Expediente](#ciclo-de-vida-de-um-expediente)
- [Decisões de Arquitetura](#decisões-de-arquitetura)
- [Padrões de Código](#padrões-de-código)

---

## Visão Geral

O sistema é construído em **camadas bem definidas** que separam responsabilidades e permitem escalabilidade:

```
┌─────────────────────────────────────────────────────┐
│                   INTERFACE (UI)                     │
│         React Components + Screens                   │
└─────────────────────────────────────────────────────┘
                        ↓
┌─────────────────────────────────────────────────────┐
│            ESTADO GLOBAL (Context API)               │
│   ExpedienteContext + ToastContext                   │
└─────────────────────────────────────────────────────┘
                        ↓
┌─────────────────────────────────────────────────────┐
│          LÓGICA DE NEGÓCIO (Services)                │
│   expedienteService + validações                     │
└─────────────────────────────────────────────────────┘
                        ↓
┌─────────────────────────────────────────────────────┐
│       PERSISTÊNCIA (Storage Manager)                 │
│   Orquestra localStorage, IndexedDB, Supabase        │
└─────────────────────────────────────────────────────┘
```

---

## Camadas da Aplicação

### 1. Screens (Apresentação)

**Responsabilidade**: Renderizar UI e capturar interações do usuário

**Screens Principais**:

| Screen | Rota | Função |
|--------|------|--------|
| [Home](src/screens/Home.jsx) | `/` | Tela inicial com histórico e criação de expedientes |
| [StockEntry](src/screens/StockEntry.jsx) | `/estoque` | Formulário para iniciar novo expediente |
| [Dashboard](src/screens/Dashboard.jsx) | `/dashboard` | Expediente ativo — estoque, encomendas, vendas |
| [Encomenda](src/screens/Encomenda.jsx) | `/encomenda` | Registrar nova encomenda |
| [Venda](src/screens/Venda.jsx) | `/venda` | Registrar venda rápida |
| [ExpedienteHistorico](src/screens/ExpedienteHistorico.jsx) | `/historico` | Visualizar expediente passado |
| [Config](src/screens/Config.jsx) | `/config` | Backup, import, sincronização |

**Padrão**:
```javascript
// Toda screen segue este padrão:
export default function Screen() {
  const { expediente, ...actions } = useExpediente();
  const { mostrar } = useToast();
  const navigate = useNavigate();
  
  // lógica
  
  return (
    <div>
      {/* UI */}
    </div>
  );
}
```

### 2. Contexts (Estado Global)

Usamos **React Context API** para estado global compartilhado:

#### 📍 ExpedienteContext.jsx

**Responsabilidade**: Gerenciar estado do expediente ativo em toda a app

**Estado**:
```javascript
{
  expediente: Object | null,           // expediente atual ou null se não houver
  iniciarExpedienteComEstoque: Function,
  adicionarEncomenda: Function,
  adicionarVenda: Function,
  marcarRetirado: Function,
  encerrarExpediente: Function,
  verExpediente: Function,             // carrega expediente do histórico
  getHistorico: Function
}
```

**Resolução do Bug Principal**:
O contexto evita o bug clássico onde o Dashboard abriria com expediente antigo. Ao criar novo expediente, o estado é atualizado ANTES da navegação → Dashboard encontra sempre o expediente correto.

**Ciclo**:
```
Usuário clica em "Começar expediente"
  ↓
iniciarExpedienteComEstoque() cria novo expediente
  ↓
salva em banco
  ↓
setExpediente(novo) — atualiza estado global
  ↓
navigate("/dashboard")
  ↓
Dashboard lê contexto e encontra novo expediente
```

#### 📍 ToastContext.jsx

**Responsabilidade**: Sistema centralizado de notificações

**Métodos**:
```javascript
mostrar(mensagem, tipo)  // tipo: 'sucesso', 'erro', 'aviso', 'info'
```

**Exemplo**:
```javascript
const { mostrar } = useToast();
mostrar("Encomenda registrada com sucesso!", "sucesso");
mostrar("Sem estoque disponível", "erro");
```

### 3. Hooks Customizados

#### 📍 useExpediente.js

**Responsabilidade**: Acesso fácil ao contexto do expediente

```javascript
const { expediente, adicionarEncomenda, ... } = useExpediente();
```

Internamente, apenas chama `useContext(ExpedienteContext)`.

#### 📍 useBackupAutomatico.js

**Responsabilidade**: Disparar backup a cada 5 minutos e sincronizar ao voltar online

**Ciclo**:
1. Ao montar (em App.jsx), faz backup imediato
2. A cada 5 minutos (5 * 60 * 1000ms), faz novo backup
3. Registra listener de `online` event
4. Quando volta online, chama `sincronizarPendentes()`

```javascript
useEffect(() => {
  fazerBackupEmergencia(); // imediato
  
  const intervalo = setInterval(() => {
    fazerBackupEmergencia();
  }, 5 * 60 * 1000);
  
  iniciarSync((resultado) => {
    if (resultado.sincronizados > 0) {
      mostrar(`${resultado.sincronizados} sincronizados`);
    }
  });
  
  return () => clearInterval(intervalo);
}, [mostrar]);
```

#### 📍 useToast.js

Wrapper simples que exporta `useContext(ToastContext)`.

### 4. Services (Lógica de Negócio)

Services contêm **regras de negócio puras** — sem I/O, sem side effects.

#### 📍 expedienteService.js

Implementa toda a lógica de manipulação de expedientes:

| Método | Responsabilidade |
|--------|------------------|
| `criar(form)` | Criar novo expediente com estoque inicial |
| `temExpedienteAtivo()` | Verificar se há expediente ativo |
| `getTotalEncomendado(exp, chave)` | Calcular total encomendado de um produto |
| `getTotalVendido(exp, chave)` | Calcular total vendido de um produto |
| `getDisponivel(exp, chave)` | Calcular quantidade disponível (original - encomendado - vendido) |
| `getTempoAtivo(exp)` | Calcular tempo do expediente aberto |
| `adicionarEncomenda(exp, dados)` | Adicionar nova encomenda ao expediente |
| `adicionarVenda(exp, dados)` | Adicionar nova venda ao expediente |
| `marcarRetirado(exp, pedidoId)` | Marcar encomenda como retirada |
| `encerrar(exp)` | Encerrar expediente |

**Exemplo**:
```javascript
// Não faz I/O — retorna objeto novo
const atualizado = expedienteService.adicionarEncomenda(expediente, {
  nome: "João",
  telefone: "11987654321",
  itens: [
    { chave: "frangosComRecheio", quantidade: 2 }
  ]
});
// O caller é responsável por salvar em storage
```

#### 📍 storageManager.js

**Responsabilidade**: Orquestrador central que garante dados salvos em TODAS as camadas

```
localStorage (cache rápido)
    ↓
IndexedDB (persistência principal)
    ↓
Supabase (sync online)
    ↓
Backup emergência (recuperação)
```

**Métodos principais**:
```javascript
salvarExpediente(expediente)      // salva em todas as camadas
getExpedienteAtual()              // retorna do localStorage (síncrono)
getHistorico()                    // retorna todos do IndexedDB
fazerBackupEmergencia()           // backup no localStorage
```

### 5. Storage (Persistência)

#### 📍 storage/indexedDB.js

Implementa camada principal de persistência usando IndexedDB:

```javascript
abrirDB()                         // cria/abre banco
salvarExpedienteIDB(exp)         // salva/atualiza expediente
getTodosExpedientesIDB()         // retorna todos
getExpedientePorIdIDB(id)        // busca um específico
salvarMetaIDB(chave, valor)      // salva metadados
getMetaIDB(chave)                // retorna metadado
importarExpedientesIDB(array)    // batch import (for backup)
```

**Banco de Dados**:
```javascript
{
  name: "lacasadifrango_db",
  version: 1,
  stores: {
    expedientes: {
      keyPath: "id",
      indices: ["date", "status"]
    },
    meta: {
      keyPath: "chave"
    }
  }
}
```

#### 📍 storage/backupService.js

Responsável por exportar/importar dados em JSON:

```javascript
exportarJSON()        // download arquivo JSON com todos os expedientes
importarJSON(arquivo) // lê arquivo e importa para IndexedDB (faz merge)
```

#### 📍 storage/syncService.js

Sincroniza com Supabase usando **offline-first**:

```javascript
marcarPendente(expedienteId)      // marca para sync
getPendenteCount()                // conta pendentes
isOnline()                        // verifica conexão
sincronizarPendentes()            // envia pendentes para Supabase
iniciarSync(callback)             // listener de online event
```

**Fluxo**:
1. Expediente é criado/modificado
2. Salva localmente (localStorage + IndexedDB)
3. Marca como "pendente" no localStorage
4. Se online, tenta sincronizar
5. Se sync falha, item fica na fila
6. Tenta novamente quando volta online

#### 📍 storage/supabaseClient.js

Cliente Supabase com credenciais pré-configuradas:

```javascript
export const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);
export function supabaseAtivo() { return true; } // sempre ativo
```

---

## Fluxo de Dados

### Criar Novo Expediente

```
┌──────────────────────────────────────────────────────┐
│ Usuário entra na tela /estoque                        │
└──────────────────────────────────────────────────────┘
                    ↓
┌──────────────────────────────────────────────────────┐
│ Preenche formulário: Com Recheio, Sem Recheio, Meio  │
└──────────────────────────────────────────────────────┘
                    ↓
┌──────────────────────────────────────────────────────┐
│ Clica em "Começar Expediente"                         │
│ Chama: iniciarExpedienteComEstoque(form)             │
└──────────────────────────────────────────────────────┘
                    ↓
┌──────────────────────────────────────────────────────┐
│ expedienteService.criar(form)                         │
│ → Cria objeto com:                                    │
│   - id: "2026-05-11-1746123456"                      │
│   - date: "2026-05-11"                               │
│   - status: "active"                                 │
│   - isSunday: true/false                             │
│   - estoque: { frangosComRecheio: 50, ... }         │
│   - pedidos: []                                      │
│   - vendas: []                                       │
└──────────────────────────────────────────────────────┘
                    ↓
┌──────────────────────────────────────────────────────┐
│ storageManager.salvarExpediente(novo)                │
└──────────────────────────────────────────────────────┘
                    ↓
    ┌───────┬─────────────┬───────────┐
    ↓       ↓             ↓           ↓
localStorage IndexedDB supabase backup
    ✓       ✓             ✓           ✓
    ↓       ↓             ↓           ↓
    └───────┴─────────────┴───────────┘
                    ↓
┌──────────────────────────────────────────────────────┐
│ setExpediente(novo) — atualiza Context                │
│ Estado agora compartilhado com TODO app              │
└──────────────────────────────────────────────────────┘
                    ↓
┌──────────────────────────────────────────────────────┐
│ navigate("/dashboard")                                │
└──────────────────────────────────────────────────────┘
                    ↓
┌──────────────────────────────────────────────────────┐
│ Dashboard renderiza com novo expediente              │
│ Lê do contexto: const { expediente } = useExpediente()
└──────────────────────────────────────────────────────┘
```

### Adicionar Encomenda

```
┌──────────────────────────────────────────────────────┐
│ Usuário navega para /encomenda                        │
└──────────────────────────────────────────────────────┘
                    ↓
┌──────────────────────────────────────────────────────┐
│ Preenche: Nome, Telefone, Quantidade de cada produto │
└──────────────────────────────────────────────────────┘
                    ↓
┌──────────────────────────────────────────────────────┐
│ Clica em "Confirmar Encomenda"                        │
│ Chama: adicionarEncomenda({ nome, telefone, itens }) │
└──────────────────────────────────────────────────────┘
                    ↓
┌──────────────────────────────────────────────────────┐
│ expedienteService.adicionarEncomenda(expediente, ...) │
│ → Retorna novo objeto com pedido adicionado          │
└──────────────────────────────────────────────────────┘
                    ↓
┌──────────────────────────────────────────────────────┐
│ storageManager.atualizarExpediente(atualizado)        │
│ Salva em: localStorage, IndexedDB, marca para Supabase │
└──────────────────────────────────────────────────────┘
                    ↓
┌──────────────────────────────────────────────────────┐
│ setExpediente(atualizado) — atualiza Context          │
│ Todos os componentes que usam useExpediente() recebem │
└──────────────────────────────────────────────────────┘
                    ↓
┌──────────────────────────────────────────────────────┐
│ Dashboard re-renderiza:                               │
│ - Lista de encomendas atualizada                     │
│ - Disponível recalculado (original - encomendado)    │
│ - Toast de sucesso: "Encomenda registrada!"          │
└──────────────────────────────────────────────────────┘
```

### Sincronização Offline-First

```
┌──────────────────────────────────────────────────────┐
│ Usuário usa app sem internet (wifi desligada)        │
└──────────────────────────────────────────────────────┘
                    ↓
┌──────────────────────────────────────────────────────┐
│ Cria encomenda: adicionarEncomenda(...)              │
└──────────────────────────────────────────────────────┘
                    ↓
┌──────────────────────────────────────────────────────┐
│ storageManager.salvarExpediente():                    │
│   localStorage: ✓ SALVO                              │
│   IndexedDB:    ✓ SALVO                              │
│   Supabase:     ✗ SEM CONEXÃO → marca pendente       │
│   Backup:       ✓ SALVO                              │
└──────────────────────────────────────────────────────┘
                    ↓
┌──────────────────────────────────────────────────────┐
│ localStorage armazena:                                │
│   frango_sync_pendentes: ["2026-05-11-1746123456"]  │
└──────────────────────────────────────────────────────┘
                    ↓
┌──────────────────────────────────────────────────────┐
│ ... usuário continua usando o app ...               │
│ (todas mudanças salvam localmente normalmente)       │
└──────────────────────────────────────────────────────┘
                    ↓
┌──────────────────────────────────────────────────────┐
│ [Evento: Volta online]                                │
│ Navegador dispara "online" event                      │
└──────────────────────────────────────────────────────┘
                    ↓
┌──────────────────────────────────────────────────────┐
│ useBackupAutomatico() ouve "online"                   │
│ Chama: sincronizarPendentes()                         │
└──────────────────────────────────────────────────────┘
                    ↓
┌──────────────────────────────────────────────────────┐
│ Para cada ID na fila de pendentes:                    │
│   Busca expediente no IndexedDB                       │
│   Converte para formato Supabase                      │
│   Envia via supabase.from('expedientes').upsert()    │
│   Remove de pendentes se sucesso                      │
└──────────────────────────────────────────────────────┘
                    ↓
┌──────────────────────────────────────────────────────┐
│ Toast: "✓ 2 expedientes sincronizados com nuvem"    │
│ localStorage.frango_sync_pendentes = []              │
└──────────────────────────────────────────────────────┘
```

---

## Armazenamento em Camadas

Dados são salvos em **4 camadas** de forma hierárquica:

```
          Velocidade   Confiabilidade   Persistência
├─────────────────────────────────────────────────────┤
│ 1. localStorage        ████░░░░        ██░░░░░░░░    │
│    (cache rápido)      Rápido          Perda possível │
├─────────────────────────────────────────────────────┤
│ 2. IndexedDB           ██░░░░░░        ██████░░░░    │
│    (banco local)       Médio           Robusto        │
├─────────────────────────────────────────────────────┤
│ 3. Supabase            ░░░░░░░░████    ██████████    │
│    (nuvem)             Lento            100% seguro   │
├─────────────────────────────────────────────────────┤
│ 4. localStorage        ██░░░░░░        ████░░░░░░    │
│    backup emergência   Rápido          Fallback      │
└─────────────────────────────────────────────────────┘
```

### localStorage
- **O quê**: Expediente atual + metadados
- **Por quê**: Acesso instantâneo, síncrono
- **Risco**: Pode ser perdido se usuário limpar dados do navegador

### IndexedDB
- **O quê**: Todos os expedientes (histórico completo)
- **Por quê**: Suporta objetos grandes, transações seguras
- **Vantagem**: Persiste mesmo após fechar aba

### Supabase
- **O quê**: Cópia remota de todos os expedientes
- **Por quê**: Sincronização entre dispositivos
- **Quando**: Apenas quando online (offline-first)

### Backup Emergência
- **O quê**: Snapshot em localStorage a cada 5 minutos
- **Por quê**: Se IndexedDB falhar, recuperar do backup
- **Confiança**: 100% — dados reais em formato JSON

---

## Ciclo de Vida de um Expediente

```
┌─────────────────────────────────────────────────────┐
│ CRIADO (status: "active")                            │
│ • id gerado: 2026-05-11-1746123456                  │
│ • iniciadoEm: timestamp Unix                         │
│ • estoque: quantidade inicial                        │
│ • pedidos: []                                        │
│ • vendas: []                                         │
└─────────────────────────────────────────────────────┘
            ↓
    [Durante o dia...]
    ✓ Encomendas adicionadas
    ✓ Vendas registradas
    ✓ Backup a cada 5 min
    ✓ Sync quando online
            ↓
┌─────────────────────────────────────────────────────┐
│ ENCERRADO (status: "closed")                         │
│ • encerradoEm: timestamp Unix                        │
│ • Persiste no histórico                              │
│ • Não pode ser modificado                            │
│ • Permanece sincronizado com Supabase               │
└─────────────────────────────────────────────────────┘
            ↓
    [Próximo dia...]
    ✓ Novo expediente criado
    ✓ Anterior fica no histórico
    ✓ Filtro por data funciona
```

---

## Decisões de Arquitetura

### 1. Por que Context API em vez de Zustand/Redux?

| Critério | Context | Zustand | Redux |
|----------|---------|---------|-------|
| Bundle size | ✓ Nativo | ✓ 3KB | ✗ 50KB+ |
| Curva aprendizado | ✓ Fácil | ~ Médio | ✗ Difícil |
| Para projeto pequeno | ✓ Perfeito | ~ OK | ✗ Overhead |

**Decisão**: Context é suficiente para estado simples + diminui dependências.

### 2. Por que IndexedDB em vez de só localStorage?

| Aspecto | localStorage | IndexedDB |
|--------|-------------|-----------|
| Limite | 5-10MB | 50MB+ (browser) |
| Transações | ✗ Não | ✓ Sim |
| Tipos complexos | ✗ String | ✓ JSONB |
| Índices | ✗ Não | ✓ Sim |

**Decisão**: IndexedDB para histórico completo + performance em queries.

### 3. Por que offline-first?

**Cenário real**: Vendedor no iPad usando app no caixa durante dia. Wifi cai? App continua funcionando.

**Alternativas rejeitadas**:
- ❌ Online-only: Impraticável em negócio de balcão
- ❌ Sync obrigatório: Bloqueia UX se internet lenta

**Solução**: Offline-first permite:
- ✓ Funcionalidade 100% offline
- ✓ Sync automático quando voltar
- ✓ Nunca perde dados

### 4. Por que Supabase em vez de Firebase?

| Recurso | Supabase | Firebase |
|---------|----------|----------|
| Preço | ✓ Gratuito até 500MB | ✓ Gratuito |
| SQL | ✓ PostgreSQL | ✗ NoSQL |
| Controle dados | ✓ Total | ✗ Vendor lock-in |
| Self-host | ✓ Possível | ✗ Não |

**Decisão**: Supabase oferece flexibilidade sem lock-in.

### 5. Por que React Context não re-renderiza tudo?

Separamos:
- **ExpedienteContext** — estado que muda frequentemente
- **ToastContext** — estado independente

Cada context renderiza apenas seus subscribers → performance otimizada.

---

## Padrões de Código

### Padrão: Service + Hook + Context

```javascript
// 1. Service (lógica pura, sem I/O)
export const expedienteService = {
  criar(form) { /* retorna novo objeto */ }
};

// 2. Context (estado global)
export function ExpedienteProvider({ children }) {
  const [expediente, setExpediente] = useState(null);
  
  async function iniciar(form) {
    const novo = expedienteService.criar(form);
    await salvarExpediente(novo);  // I/O aqui
    setExpediente(novo);
  }
  
  return <Context.Provider value={{ expediente, iniciar }}>
    {children}
  </Context.Provider>;
}

// 3. Hook (acesso fácil)
export function useExpediente() {
  return useContext(ExpedienteContext);
}

// 4. Uso em componente
function Screen() {
  const { expediente, iniciar } = useExpediente();
  // ...
}
```

### Padrão: Immutability (Sem Mutações)

```javascript
// ❌ ERRADO — muta objeto
expediente.pedidos.push(novo);
setExpediente(expediente);

// ✓ CORRETO — cria novo objeto
const atualizado = {
  ...expediente,
  pedidos: [...expediente.pedidos, novo]
};
setExpediente(atualizado);
```

### Padrão: Tratamento de Erros

```javascript
try {
  await salvarExpediente(novo);
  mostrar("Salvo com sucesso!", "sucesso");
} catch (err) {
  console.error("Erro ao salvar:", err);
  mostrar("Erro ao salvar — dados locais preservados", "erro");
  // Dados continuam em localStorage/IndexedDB mesmo se Supabase falhar
}
```

---

## 🔗 Relacionados

- [REGRAS_DE_NEGOCIO.md](REGRAS_DE_NEGOCIO.md) — Regras implementadas aqui
- [BANCO_DE_DADOS.md](BANCO_DE_DADOS.md) — Estrutura de dados
- [src/services/expedienteService.js](../src/services/expedienteService.js) — Implementação
- [src/services/storageManager.js](../src/services/storageManager.js) — Orquestração
