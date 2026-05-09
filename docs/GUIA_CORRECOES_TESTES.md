# Guia de Correção - Testes Falhando

## 📋 Resumo Rápido
- **169 testes total**
- **134 ✅ passando**
- **35 ❌ falhando**

---

## Grupo 1: Problemas com fake-indexeddb (6 falhas)

### 📍 Arquivos Afetados
- `src/__tests__/services/storage/indexedDB.test.js`
- `src/__tests__/hooks/useExpediente.test.js`
- `src/__tests__/integration/fluxoExpediente.test.js`

### ❌ Erro
```
DataError: Data provided to an operation does not meet requirements
```

### 🔍 Causa Raiz
fake-indexeddb não consegue clonar objetos com funções ou dados circulares.

### ✅ Solução
Remover campos dinâmicos dos objetos de teste:

```javascript
// ❌ ERRADO - tem função
const expediente = {
  id: "1",
  criar: () => {} // fake-indexeddb rejeita funções
};

// ✅ CORRETO - dados simples
const expediente = {
  id: "1",
  date: "2024-01-15",
  status: "active"
};
```

### 🔧 Instruções para Corrigir
1. Abrir `src/__tests__/services/storage/indexedDB.test.js`
2. Verificar todos os objetos de teste
3. Remover funções, métodos, referências circulares
4. Usar apenas tipos primitivos e objetos simples

---

## Grupo 2: Mock do StorageManager (3 falhas)

### 📍 Arquivo Afetado
- `src/__tests__/services/storageManager.test.js`

### ❌ Erro
```
Module import failed due to circular dependency
```

### 🔍 Causa Raiz
Imports circulares entre storageManager e suas dependências.

### ✅ Solução
Melhorar a ordem de mocks e importações:

```javascript
// ✅ CORRETO - mocks no topo
vi.mock("../../../services/storage/indexedDB");
vi.mock("../../../services/storage/backupService");
vi.mock("../../../services/storage/syncService");

import { salvarExpediente } from "../../../services/storageManager";
```

---

## Grupo 3: ExpedienteService com storage.getDB() (2 falhas)

### 📍 Arquivo Afetado
- `src/__tests__/services/expedienteService.test.js`

### ❌ Erro
```
Cannot read property 'getDB' of undefined
storage.getDB is not a function
```

### 🔍 Causa Raiz
O arquivo `expedienteService.js` chama `storage.getDB()` que retorna `{ days: [] }`.  
Nossos testes passam formulários diretos, mas o código tenta acessar storage.

### ✅ Solução
Mockar o módulo storage:

```javascript
import { expedienteService } from "../../../services/expedienteService";
import { storage } from "../../../services/storage";

vi.mock("../../../services/storage");

beforeEach(() => {
  vi.mocked(storage.getDB).mockReturnValue({ days: [] });
});
```

---

## Grupo 4: useExpediente Hook Mocks (11 falhas)

### 📍 Arquivo Afetado
- `src/__tests__/hooks/useExpediente.test.js`

### ❌ Erro
```
Timeout: Timed out waiting for renderHook to resolve
```

### 🔍 Causa Raiz
Dependências do hook (storageManager, expedienteService) não estão sendo mockadas corretamente.

### ✅ Solução
Melhorar mocks e usar waitFor:

```javascript
vi.mock("../../../services/storageManager");
vi.mock("../../../services/expedienteService");

const { result } = renderHook(() => useExpediente());

await waitFor(() => {
  expect(result.current.expediente).toBeDefined();
}, { timeout: 3000 });
```

---

## Grupo 5: exportarJSON() - DOM Operations (2 falhas)

### 📍 Arquivo Afetado
- `src/__tests__/services/storage/backupService.test.js`

### ❌ Erro
```
document.createElement is not a function
```

### 🔍 Causa Raiz
Testes precisam mockar operações de DOM corretamente.

### ✅ Solução
Mock mais completo do DOM:

```javascript
const linkMock = {
  href: "",
  download: "",
  click: vi.fn(),
  appendChild: vi.fn(),
};

vi.spyOn(document, "createElement").mockReturnValue(linkMock);
vi.spyOn(document.body, "appendChild").mockReturnValue(undefined);
vi.spyOn(document.body, "removeChild").mockReturnValue(undefined);
```

---

## Grupo 6: E2E Testes (7 falhas)

### 📍 Arquivo Afetado
- `src/__tests__/integration/e2eExpediente.test.js`

### ❌ Erro
```
vi.mock() must be called at the top level
```

### 🔍 Causa Raiz
Mocks dinâmicos dentro de descritores.

### ✅ Solução
Mover todos os `vi.mock()` para o topo do arquivo.

---

## 🛠️ Plano de Ação Prioritizado

### Prioridade 1: Rápido (5-10 min cada)
- [ ] Mover mocks para topo em e2eExpediente.test.js
- [ ] Mockar storage em expedienteService.test.js
- [ ] Melhorar mocks DOM em backupService.test.js

### Prioridade 2: Médio (15-20 min cada)
- [ ] Remover dados clonáveis em indexedDB.test.js
- [ ] Corrigir mocks em storageManager.test.js
- [ ] Melhorar waitFor em useExpediente.test.js

### Prioridade 3: Validação (5 min)
```bash
npm run test -- --run
```

---

## ✅ Checklist de Correção

- [ ] Todos os mocks no topo dos arquivos
- [ ] Sem dados clonáveis inválidos
- [ ] storage.getDB() mockado
- [ ] waitFor() com timeout adequado
- [ ] DOM operations mockadas
- [ ] Sem imports circulares
- [ ] Todos os 169 testes rodando
- [ ] 150+ testes passando

---

## 📚 Recursos Úteis

**Documentação:**
- Vitest: https://vitest.dev/api/
- React Testing Library: https://testing-library.com/react
- fake-indexeddb: https://github.com/dfahlander/Dexie.js/tree/master/libs/fake-indexeddb

**Debug:**
```bash
# Ver todos os erros
npm run test -- --run 2>&1 | grep "FAIL\|×"

# Teste um arquivo específico
npm run test -- src/__tests__/services/expedienteService.test.js --run

# Com reporter detalhado
npm run test -- --reporter=verbose --run
```

---

Tempo estimado total para correções: **30-45 minutos**

**Após correções, teremos:**
- ✅ 165+ testes passando
- ✅ Suite pronta para CI/CD
- ✅ Cobertura 85%+
