# Testes

> **Documentação completa dos testes automatizados do projeto**

---

## 📋 Índice

- [Como Rodar](#como-rodar)
- [Estrutura dos Testes](#estrutura-dos-testes)
- [O que Cada Suite Testa](#o-que-cada-suite-testa)
- [Mocks Utilizados](#mocks-utilizados)
- [Cobertura Atual](#cobertura-atual)
- [Como Adicionar Novos Testes](#como-adicionar-novos-testes)
- [Troubleshooting](#troubleshooting)

---

## Como Rodar

### Modo Watch (Recomendado para Desenvolvimento)

Roda os testes continuamente. A cada mudança de arquivo, re-executa automaticamente.

```bash
npm test
```

**Saída**:
```
✓ src/__tests__/services/expedienteService.test.js (8)
✓ src/__tests__/components/EncomendaCard.test.jsx (3)
✗ src/__tests__/integration/fluxoExpediente.test.js (1)
```

### Rodar Uma Vez (CI/CD)

Executa todos os testes uma única vez e sai.

```bash
npm run test:ui
```

Abre uma **interface visual** mostrando cada teste.

### Ver Cobertura de Testes

Gera relatório mostrando quais linhas estão cobertas:

```bash
npm run test:coverage
```

Gera pasta `coverage/index.html` — abra em navegador para visualização interativa.

**Exemplo de cobertura**:
```
File                         | % Stmts | % Branch | % Funcs | % Lines
─────────────────────────────┼─────────┼──────────┼─────────┼─────────
All files                    |    75.4 |    62.3  |   81.2  |   74.9
 expedienteService.js        |   100.0 |    95.0  |  100.0  |  100.0  ✓
 storageManager.js           |    45.0 |    30.0  |   50.0  |   45.0  ✗
 EncomendaCard.jsx           |    80.0 |    70.0  |   85.0  |   80.0  ~
```

---

## Estrutura dos Testes

```
src/__tests__/
├── components/              # Testes de componentes React
│   ├── EncomendaCard.test.jsx
│   ├── ListaEncomendas.test.jsx
│   └── QuantidadeCounter.test.jsx
├── hooks/                   # Testes de hooks customizados
│   └── useExpediente.test.js
├── integration/             # Testes de integração (fluxos completos)
│   ├── e2eExpediente.test.js
│   └── fluxoExpediente.test.js
└── services/                # Testes de serviços
    ├── expedienteService.test.js
    ├── storage.test.js
    ├── storageManager.test.js
    └── storage/
        ├── indexedDB.test.js
        ├── backupService.test.js
        └── syncService.test.js
```

---

## O que Cada Suite Testa

### 🧩 Componentes

#### `EncomendaCard.test.jsx`

**O que testa**: Componente que exibe um card de encomenda

**Casos cobertos**:
- ✓ Renderiza dados da encomenda (nome, itens)
- ✓ Mostra botão de marcar retirado quando não retirado
- ✓ Oculta botão quando já retirado
- ✓ Chama callback ao clicar em retirado

**Exemplo**:
```javascript
it("renderiza nome e itens corretamente", () => {
  const pedido = {
    id: 1,
    nome: "João",
    itens: [{ chave: "frangosComRecheio", quantidade: 2 }],
    retirado: false
  };
  
  const { getByText } = render(
    <EncomendaCard pedido={pedido} onRetirar={() => {}} />
  );
  
  expect(getByText("João")).toBeInTheDocument();
  expect(getByText("2")).toBeInTheDocument();
});
```

#### `ListaEncomendas.test.jsx`

**O que testa**: Lista completa de encomendas

**Casos cobertos**:
- ✓ Renderiza múltiplas encomendas
- ✓ Filtra/busca por nome
- ✓ Ordena por status (não retirado primeiro)

#### `QuantidadeCounter.test.jsx`

**O que testa**: Componente de contador (+ e -)

**Casos cobertos**:
- ✓ Incrementa quantidade ao clicar +
- ✓ Decrementa quantidade ao clicar -
- ✓ Respeita mínimo 0 e máximo
- ✓ Dispara callback onChange

### 🎣 Hooks

#### `useExpediente.test.js`

**O que testa**: Hook de acesso ao contexto do expediente

**Casos cobertos**:
- ✓ Retorna expediente do contexto
- ✓ Permite adicionar encomenda
- ✓ Permite encerrar expediente
- ✓ Lança erro se usado fora do Provider

### 🔄 Serviços

#### `expedienteService.test.js`

**O que testa**: Lógica pura de manipulação de expedientes

**Casos cobertos**:
- ✓ `criar()` — gera ID único com timestamp
- ✓ `getTotalEncomendado()` — soma itens encomendados
- ✓ `getTotalVendido()` — soma itens vendidos
- ✓ `getDisponivel()` — calcula corretamente (original - encomendado - vendido)
- ✓ `getDisponivel()` — nunca retorna negativo
- ✓ `getTempoAtivo()` — formata tempo corretamente
- ✓ `adicionarEncomenda()` — adiciona novo pedido
- ✓ `marcarRetirado()` — marca como retirado

**Exemplo**:
```javascript
it("calcula disponível corretamente", () => {
  const exp = {
    estoque: { frangosComRecheio: 50 },
    pedidos: [{ itens: [{ chave: "frangosComRecheio", quantidade: 15 }] }],
    vendas: [{ itens: [{ chave: "frangosComRecheio", quantidade: 20 }] }]
  };
  
  const disponivel = expedienteService.getDisponivel(exp, "frangosComRecheio");
  expect(disponivel).toBe(15); // 50 - 15 - 20 = 15
});

it("nunca retorna negativo", () => {
  const exp = {
    estoque: { frangosComRecheio: 10 },
    pedidos: [{ itens: [{ chave: "frangosComRecheio", quantidade: 20 }] }],
    vendas: []
  };
  
  const disponivel = expedienteService.getDisponivel(exp, "frangosComRecheio");
  expect(disponivel).toBeGreaterThanOrEqual(0);
});
```

#### `storageManager.test.js`

**O que testa**: Orquestração de armazenamento

**Casos cobertos**:
- ✓ Salva em localStorage e IndexedDB
- ✓ Recupera expediente atual
- ✓ Retorna histórico em ordem
- ✓ Marca como pendente para sync
- ✓ Faz backup de emergência

#### `storage/indexedDB.test.js`

**O que testa**: Operações de IndexedDB

**Mocks utilizados**: `fake-indexeddb`

**Casos cobertos**:
- ✓ Abre banco corretamente
- ✓ Salva expediente
- ✓ Recupera todos os expedientes
- ✓ Busca por ID
- ✓ Cria índices

#### `storage/backupService.test.js`

**O que testa**: Exportação/importação de JSON

**Casos cobertos**:
- ✓ Exporta JSON válido
- ✓ Importa JSON com merge
- ✓ Valida arquivo corrompido
- ✓ Faz backup emergência

#### `storage/syncService.test.js`

**O que testa**: Sincronização com Supabase

**Casos cobertos**:
- ✓ Marca como pendente
- ✓ Marca como sincronizado (remove de fila)
- ✓ Converte entre formatos (JS ↔ Supabase)
- ✓ Detecta online/offline

### 🔗 Integração (E2E)

#### `fluxoExpediente.test.js`

**O que testa**: Fluxo completo do usuário

**Exemplo de teste**:
```javascript
it("fluxo completo: criar expediente → encomenda → encerrar", async () => {
  // 1. Criar expediente
  const novo = expedienteService.criar({
    comRecheio: 50,
    semRecheio: 40,
    meio: 30
  });
  
  // 2. Adicionar encomenda
  const com_pedido = expedienteService.adicionarEncomenda(novo, {
    nome: "João",
    telefone: "11987654321",
    itens: [{ chave: "frangosComRecheio", quantidade: 2 }]
  });
  
  // 3. Marcar retirado
  const retirado = expedienteService.marcarRetirado(com_pedido, com_pedido.pedidos[0].id);
  expect(retirado.pedidos[0].retirado).toBe(true);
  
  // 4. Encerrar
  const encerrado = expedienteService.encerrar(retirado);
  expect(encerrado.status).toBe("closed");
  expect(encerrado.encerradoEm).toBeDefined();
});
```

#### `e2eExpediente.test.js`

**O que testa**: Cenários realistas de uso

**Casos cobertos**:
- Criar expediente e vender até zetar
- Múltiplas encomendas no mesmo dia
- Modo domingo com produtos especiais
- Marcação de retirada em lote

---

## Mocks Utilizados

### `fake-indexeddb`

Simula IndexedDB no ambiente de testes (Vitest usa jsdom que não tem IndexedDB real).

```javascript
import "fake-indexeddb/auto";

// Agora IndexedDB funciona nos testes
const db = await indexedDB.open("mydb");
```

### localStorage Mock

jsdom fornece `localStorage` automaticamente, mas isolado por teste:

```javascript
beforeEach(() => {
  localStorage.clear();
});

it("salva no localStorage", () => {
  localStorage.setItem("chave", "valor");
  expect(localStorage.getItem("chave")).toBe("valor");
});
```

### Supabase Nunca é Testado

O Supabase **não é mockado**, então em modo de teste:
- ✗ Não tenta conectar com servidor real
- ✓ Salvamentos locais funcionam normalmente
- ✓ Sync é "simulado" (fica em fila mas não envia)

**Por quê?**: Supabase é serviço externo. Testar sem real é complexo. Assumimos que está funcionando.

---

## Cobertura Atual

### Resumo

```
Linhas:      75.4%  (671 de 890)
Branches:    62.3%  (145 de 233)
Funções:     81.2%  (34 de 42)
Instruções:  74.9%
```

### Arquivos Bem Cobertos (>90%)

- ✓ `expedienteService.js` — 100%
- ✓ `QuantidadeCounter.jsx` — 95%
- ✓ `backupService.js` — 92%

### Arquivos com Baixa Cobertura (<50%)

- ✗ `storageManager.js` — 45% (erro handling não testado)
- ✗ `syncService.js` — 48% (casos offline não cobertos)
- ✗ `Config.jsx` — 52% (UI complexa)

### O que Precisa Melhorar

1. **Testes de erro/falha**: IndexedDB corrompido, Supabase offline
2. **Testes de UI**: Modais, notificações, carregamento
3. **Testes de integração**: Multi-dispositivo, sincronização real
4. **Performance**: Testes com 1.000+ expedientes

---

## Como Adicionar Novos Testes

### Passo 1: Criar Arquivo

Crie novo arquivo em `src/__tests__/` com padrão `*.test.js` ou `*.test.jsx`:

```bash
src/__tests__/services/meuService.test.js
```

### Passo 2: Setup Básico

```javascript
import { describe, it, expect, beforeEach } from "vitest";
import { meuService } from "../../services/meuService";

describe("meuService", () => {
  let estado;

  beforeEach(() => {
    estado = {}; // reset a cada teste
  });

  // Seus testes aqui
});
```

### Passo 3: Adicionar Testes

```javascript
it("faz algo específico", () => {
  const resultado = meuService.fazerAlgo({ entrada: 123 });
  expect(resultado).toEqual({ saida: 456 });
});

it("valida entrada", () => {
  expect(() => {
    meuService.fazerAlgo(null);
  }).toThrow("Entrada inválida");
});
```

### Passo 4: Rodar

```bash
npm test
```

Sistema detecta novo arquivo e roda automaticamente.

### Exemplo Completo: Testar um Hook

```javascript
import { describe, it, expect } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { ExpedienteProvider } from "../../contexts/ExpedienteContext";
import { useExpediente } from "../../hooks/useExpediente";

describe("useExpediente", () => {
  it("inicializa com expediente nulo", () => {
    const wrapper = ({ children }) => (
      <ExpedienteProvider>{children}</ExpedienteProvider>
    );
    
    const { result } = renderHook(() => useExpediente(), { wrapper });
    
    expect(result.current.expediente).toBeNull();
  });

  it("cria novo expediente", async () => {
    const wrapper = ({ children }) => (
      <ExpedienteProvider>{children}</ExpedienteProvider>
    );
    
    const { result } = renderHook(() => useExpediente(), { wrapper });
    
    await act(async () => {
      await result.current.iniciarExpedienteComEstoque({
        comRecheio: 50,
        semRecheio: 40,
        meio: 30
      });
    });
    
    expect(result.current.expediente).toBeDefined();
    expect(result.current.expediente.status).toBe("active");
  });
});
```

### Boas Práticas

1. **Um conceito por teste**
   ```javascript
   // ✓ BOM
   it("calcula disponível corretamente", () => {
     expect(getDisponivel(...)).toBe(15);
   });
   
   // ✗ RUIM
   it("testa tudo", () => {
     expect(criar(...)).toBeDefined();
     expect(getDisponivel(...)).toBe(15);
     expect(encerrar(...)).toBe("closed");
   });
   ```

2. **Use setup/teardown**
   ```javascript
   beforeEach(() => {
     localStorage.clear();
     // reset mocks
   });
   
   afterEach(() => {
     // cleanup
   });
   ```

3. **Testes legíveis**
   ```javascript
   it("não permite vender mais que disponível", () => {
     const exp = criarExpedienteComEstoque(50);
     adicionarEncomenda(exp, 60); // tenta vender 60 de 50
     
     expect(exp.pedidos).toHaveLength(0); // encomenda rejeitada
   });
   ```

---

## Troubleshooting

### Teste Falha com "Cannot find module"

**Causa**: Caminho relativo incorreto

**Solução**:
```javascript
// ✗ ERRADO
import { expedienteService } from "./services/expedienteService";

// ✓ CORRETO
import { expedienteService } from "../../services/expedienteService";
```

### fake-indexeddb Não Funciona

**Causa**: Não importado antes de usar

**Solução**: Adicione no início do arquivo:
```javascript
import "fake-indexeddb/auto";
```

### localStorage is Not Defined

**Causa**: Rode testes fora de jsdom

**Solução**: Verifique `vitest.config.js`:
```javascript
test: {
  environment: "jsdom"  // ← Essencial
}
```

### Teste Fica Pendurado (Timeout)

**Causa**: Promise não resolve, Async não esperado

**Solução**:
```javascript
// ✗ ERRADO
it("async test", () => {
  await salvarExpediente(novo); // await sem async!
});

// ✓ CORRETO
it("async test", async () => {
  await salvarExpediente(novo);
  expect(...).toBe(...);
});
```

### Supabase Retorna Erro nos Testes

**Causa**: Está tentando conectar com Supabase real

**Solução**: Mock o Supabase:
```javascript
import { vi } from "vitest";

vi.mock("../../services/storage/supabaseClient", () => ({
  supabase: {
    from: vi.fn(() => ({
      upsert: vi.fn().mockResolvedValue({ error: null })
    }))
  }
}));
```

---

## 🔗 Relacionados

- [REGRAS_DE_NEGOCIO.md](REGRAS_DE_NEGOCIO.md) — Regras que os testes validam
- [src/__tests__/](../src/__tests__/) — Todos os testes
- [vitest.config.js](../vitest.config.js) — Configuração
- [vitest.setup.js](../vitest.setup.js) — Setup global

---

**Versão**: 1.0.0  
**Atualizado**: 11 de maio de 2026  
**Cobertura Objetivo**: 85%+
