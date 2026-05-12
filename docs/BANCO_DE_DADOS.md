# Banco de Dados

> **Estrutura de dados completa do sistema — modelos, schemas e persistência**

---

## 📋 Índice

- [Modelo de Expediente](#modelo-de-expediente)
- [Modelo de Pedido](#modelo-de-pedido)
- [Modelo de Venda](#modelo-de-venda)
- [Camadas de Persistência](#camadas-de-persistência)
- [IndexedDB](#indexeddb)
- [Supabase](#supabase)
- [localStorage](#localstorage)
- [Conversão Entre Formatos](#conversão-entre-formatos)
- [Queries Úteis](#queries-úteis)

---

## Modelo de Expediente

### Estrutura JavaScript

```javascript
{
  // Identificadores
  id: string,                    // "2026-05-11-1746123456789" — YYYY-MM-DD-timestamp
  date: string,                  // "2026-05-11" — YYYY-MM-DD

  // Estado
  status: string,                // "active" ou "closed"
  isSunday: boolean,            // true se criado no domingo

  // Timestamps
  iniciadoEm: number,           // timestamp Unix em ms (quando foi criado)
  encerradoEm: number | null,   // null se ativo, timestamp se encerrado

  // Estoque Inicial
  estoque: {
    frangosComRecheio: number,  // 50
    frangosSemRecheio: number,  // 40
    meioFrango: number,         // 30
    maionese10: number,         // 0 (ou número se domingo)
    maionese15: number,         // 0 (ou número se domingo)
    costela: number             // 0 (ou número se domingo)
  },

  // Operações do dia
  pedidos: Array<Pedido>,       // encomendas
  vendas: Array<Venda>,         // vendas balcão

  // Metadados (adicionado por IndexedDB)
  _updatedAt: number            // timestamp da última atualização
}
```

### Exemplo Completo

```javascript
{
  id: "2026-05-11-1746123456789",
  date: "2026-05-11",
  status: "active",
  isSunday: true,
  iniciadoEm: 1746123456789,
  encerradoEm: null,
  estoque: {
    frangosComRecheio: 50,
    frangosSemRecheio: 40,
    meioFrango: 30,
    maionese10: 100,
    maionese15: 80,
    costela: 20
  },
  pedidos: [
    {
      id: 1746123500000,
      tipo: "encomenda",
      nome: "João Silva",
      telefone: "11987654321",
      itens: [
        { chave: "frangosComRecheio", quantidade: 2 },
        { chave: "maionese10", quantidade: 1 }
      ],
      retirado: false
    }
  ],
  vendas: [
    {
      id: 1746123600000,
      tipo: "venda",
      itens: [
        { chave: "frangosComRecheio", quantidade: 1 }
      ]
    }
  ],
  _updatedAt: 1746124000000
}
```

---

## Modelo de Pedido

### Encomenda (Pedido com Cliente)

```javascript
{
  id: number,                     // timestamp: 1746123500000
  tipo: string,                   // "encomenda"
  nome: string,                   // "João Silva"
  telefone: string,               // "11987654321" ou ""
  itens: Array<Item>,            // itens da encomenda
  retirado: boolean               // false (ou true se marcada)
}
```

### Estrutura do Item

```javascript
{
  chave: string,                  // "frangosComRecheio", "maionese10", etc
  quantidade: number              // 2, 1, 5, etc
}
```

### Chaves de Produtos Válidas

```javascript
const CHAVES_PRODUTOS = [
  "frangosComRecheio",           // Frango Com Recheio
  "frangosSemRecheio",           // Frango Sem Recheio
  "meioFrango",                  // Meio Frango
  "maionese10",                  // Maionese R$10 (domingo)
  "maionese15",                  // Maionese R$15 (domingo)
  "costela"                      // Costela (domingo)
];
```

### Exemplo de Encomenda Completa

```javascript
{
  id: 1746123500000,
  tipo: "encomenda",
  nome: "João Silva",
  telefone: "11987654321",
  itens: [
    { chave: "frangosComRecheio", quantidade: 2 },
    { chave: "frangosSemRecheio", quantidade: 1 },
    { chave: "maionese10", quantidade: 1 }
  ],
  retirado: false
}
```

---

## Modelo de Venda

### Venda (Balcão Anônima)

```javascript
{
  id: number,                     // timestamp: 1746123600000
  tipo: string,                   // "venda"
  itens: Array<Item>              // itens vendidos
  // Sem nome, telefone, retirado — é anônima
}
```

### Exemplo de Venda Completa

```javascript
{
  id: 1746123600000,
  tipo: "venda",
  itens: [
    { chave: "frangosComRecheio", quantidade: 1 },
    { chave: "meioFrango", quantidade: 2 }
  ]
}
```

---

## Camadas de Persistência

### Hierarquia de Armazenamento

```
┌─────────────────────────────────────┐
│ 1. localStorage                      │
│    (Cache instantâneo — síncrono)   │
├─────────────────────────────────────┤
│ 2. IndexedDB                         │
│    (Banco principal — persistente)   │
├─────────────────────────────────────┤
│ 3. Supabase (Opcional)              │
│    (Sync online — múltiplos dev)    │
├─────────────────────────────────────┤
│ 4. localStorage Backup               │
│    (Emergência — fallback)          │
└─────────────────────────────────────┘
```

### Decisão de Uso

| Operação | localStorage | IndexedDB | Supabase |
|----------|-----------|-----------|----------|
| **Ler expediente atual** | ✓ Rápido | ✗ | ✗ |
| **Ler histórico** | ✗ | ✓ Principal | ~ Backup |
| **Salvar novo expediente** | ✓ Rápido | ✓ Principal | ~ Fila |
| **Sincronizar entre dev** | ✗ | ✗ | ✓ Sim |
| **Backup emergência** | ✓ Sim | ~ Fallback | ✗ |

---

## IndexedDB

### Banco de Dados

```javascript
{
  name: "lacasadifrango_db",
  version: 1
}
```

### Object Stores

#### Store: `expedientes`

```javascript
{
  keyPath: "id",
  indices: [
    {
      name: "date",
      keyPath: "date",
      unique: false
    },
    {
      name: "status",
      keyPath: "status",
      unique: false
    }
  ]
}
```

#### Store: `meta`

```javascript
{
  keyPath: "chave"
}
```

### Operações Principais

#### Salvar Expediente

```javascript
const db = await abrirDB();
const tx = db.transaction("expedientes", "readwrite");
const store = tx.objectStore("expedientes");
const req = store.put({
  ...expediente,
  _updatedAt: Date.now()
});

// Resultado: sucesso ou erro
```

#### Buscar Todos os Expedientes

```javascript
const todos = await getTodosExpedientesIDB();
// Retorna: Array ordenado por data decrescente

// [
//   { id: "2026-05-11-...", date: "2026-05-11", ... },
//   { id: "2026-05-10-...", date: "2026-05-10", ... },
//   ...
// ]
```

#### Buscar por ID

```javascript
const exp = await getExpedientePorIdIDB("2026-05-11-1746123456789");
// Retorna: Expediente ou null
```

#### Salvar Metadado

```javascript
await salvarMetaIDB("ultimoSync", "2026-05-11T14:30:00Z");
```

#### Ler Metadado

```javascript
const ultimoSync = await getMetaIDB("ultimoSync");
// Retorna: "2026-05-11T14:30:00Z" ou null
```

### Índices

**Por data**: Usado para filtro de calendário
```javascript
store.index("date").getAll("2026-05-11");
```

**Por status**: Usado para encontrar expediente ativo
```javascript
store.index("status").getAll("active");
```

---

## Supabase

### Tabela: `expedientes`

#### SQL de Criação

```sql
create table if not exists expedientes (
  -- Identificadores
  id text primary key,
  date text not null,
  
  -- Estado
  status text not null default 'active',
  is_sunday boolean default false,
  
  -- Timestamps (em ms)
  iniciado_em bigint,
  encerrado_em bigint,
  
  -- Dados complexos (JSONB)
  estoque jsonb default '{}',
  pedidos jsonb default '[]',
  vendas jsonb default '[]',
  
  -- Metadados
  updated_at bigint default extract(epoch from now()) * 1000,
  created_at timestamp default now()
);

-- Índices para performance
create index if not exists idx_expedientes_date on expedientes(date);
create index if not exists idx_expedientes_status on expedientes(status);
```

### Schema da Tabela

| Coluna | Tipo | Nulo | Padrão | Descrição |
|--------|------|------|--------|-----------|
| `id` | text | não | — | Chave primária — formato "YYYY-MM-DD-timestamp" |
| `date` | text | não | — | Data em "YYYY-MM-DD" |
| `status` | text | não | 'active' | "active" ou "closed" |
| `is_sunday` | boolean | sim | false | true se domingo |
| `iniciado_em` | bigint | sim | — | Timestamp Unix em ms |
| `encerrado_em` | bigint | sim | — | null se ativo |
| `estoque` | jsonb | sim | {} | Objeto com quantidades |
| `pedidos` | jsonb | sim | [] | Array de encomendas |
| `vendas` | jsonb | sim | [] | Array de vendas |
| `updated_at` | bigint | sim | now() | Atualização em ms |
| `created_at` | timestamp | sim | now() | Criação em UTC |

### Conversão de Formato

**JavaScript → Supabase**:
```javascript
function paraFormatoSupabase(exp) {
  return {
    id: exp.id,
    date: exp.date,
    status: exp.status,
    is_sunday: exp.isSunday,              // camelCase → snake_case
    iniciado_em: exp.iniciadoEm,
    encerrado_em: exp.encerradoEm,
    estoque: exp.estoque,
    pedidos: exp.pedidos,
    vendas: exp.vendas,
    updated_at: exp._updatedAt || Date.now()
  };
}
```

**Supabase → JavaScript**:
```javascript
function doFormatoSupabase(row) {
  return {
    id: row.id,
    date: row.date,
    status: row.status,
    isSunday: row.is_sunday,               // snake_case → camelCase
    iniciadoEm: row.iniciado_em,
    encerradoEm: row.encerrado_em,
    estoque: row.estoque,
    pedidos: row.pedidos,
    vendas: row.vendas,
    _updatedAt: row.updated_at
  };
}
```

### Operações

#### Upsert (Inserir ou Atualizar)

```javascript
const { error } = await supabase
  .from("expedientes")
  .upsert(expediente, { onConflict: "id" });
```

#### Selecionar Todos

```javascript
const { data, error } = await supabase
  .from("expedientes")
  .select("*")
  .order("date", { ascending: false });
```

#### Buscar por Data

```javascript
const { data } = await supabase
  .from("expedientes")
  .select("*")
  .eq("date", "2026-05-11");
```

---

## localStorage

### Chaves Utilizadas

| Chave | Conteúdo | Propósito |
|-------|----------|----------|
| `expediente_atual` | JSON expediente | Cache do expediente ativo |
| `frango_sync_pendentes` | Array[string] | Fila de IDs para sincronizar |
| `frango_backup_emergencia` | JSON completo | Backup emergência |
| `frango_backup_timestamp` | timestamp | Quando foi feito backup |
| `frango_migrado_v2` | "true" | Flag de migração |

### Exemplo de Valores

**`expediente_atual`**:
```javascript
localStorage.expediente_atual = JSON.stringify({
  id: "2026-05-11-...",
  status: "active",
  // ... rest expediente
});
```

**`frango_sync_pendentes`**:
```javascript
localStorage.frango_sync_pendentes = JSON.stringify([
  "2026-05-11-1746123456789",
  "2026-05-10-1746012345678"
]);
```

**`frango_backup_emergencia`**:
```javascript
localStorage.frango_backup_emergencia = JSON.stringify({
  salvoEm: "2026-05-11T14:30:00Z",
  expedientes: [
    { id: "...", date: "...", ... },
    // ... todos expedientes
  ]
});
```

---

## Conversão Entre Formatos

### JSON de Exportação

**Estrutura**:
```javascript
{
  versao: "1.0",
  exportadoEm: "2026-05-11T14:30:00Z",
  app: "La Casa Di Frango",
  expedientes: [
    { /* expediente 1 */ },
    { /* expediente 2 */ }
  ]
}
```

**Gerado por**: `exportarJSON()` em [backupService.js](../src/services/storage/backupService.js)

### Fluxo de Dados

```
    ┌─────────────┐
    │ Usuário     │
    │ JavaScript  │
    └──────┬──────┘
           │ (isSunday, iniciadoEm)
           ↓
    ┌─────────────────┐
    │ localStorage    │
    │ (cache rápido)  │
    └──────┬──────────┘
           │
           ↓
    ┌─────────────────────────────┐
    │ IndexedDB                   │
    │ (persistência principal)    │
    │ + adiciona _updatedAt       │
    └──────┬──────────────────────┘
           │
           ├──→ [Backup JSON]
           │    exportarJSON()
           │
           ├──→ [Supabase]
           │    paraFormatoSupabase()
           │    (isSunday → is_sunday)
           │
           └──→ [Fallback]
                localStorage backup
```

---

## Queries Úteis

### SQL — Supabase

**Todos os expedientes de um dia**:
```sql
SELECT * FROM expedientes 
WHERE date = '2026-05-11' 
ORDER BY status DESC, id DESC;
```

**Expedientes ativos**:
```sql
SELECT * FROM expedientes 
WHERE status = 'active' 
LIMIT 1;
```

**Total de expedientes por mês**:
```sql
SELECT 
  DATE_TRUNC('month', date::date) as mes,
  COUNT(*) as total
FROM expedientes
GROUP BY mes
ORDER BY mes DESC;
```

**Itens mais vendidos** (análise):
```sql
SELECT 
  (jsonb_array_elements(pedidos)->>'chave') as produto,
  SUM((jsonb_array_elements(pedidos)->'quantidade')::int) as total
FROM expedientes
WHERE date >= '2026-04-11'
GROUP BY produto
ORDER BY total DESC;
```

### JavaScript — IndexedDB

**Buscar expediente ativo**:
```javascript
const todos = await getTodosExpedientesIDB();
const ativo = todos.find(e => e.status === "active");
```

**Filtrar por data**:
```javascript
const todos = await getTodosExpedientesIDB();
const deHoje = todos.filter(e => e.date === "2026-05-11");
```

**Calcular estatísticas**:
```javascript
const total_encomendas = expediente.pedidos.length;
const total_vendas = expediente.vendas.length;
const total_itens = 
  expediente.pedidos.reduce((sum, p) => 
    sum + p.itens.reduce((s, i) => s + i.quantidade, 0), 0
  );
```

---

## 🔗 Relacionados

- [ARQUITETURA.md](ARQUITETURA.md) — Como os dados fluem
- [REGRAS_DE_NEGOCIO.md](REGRAS_DE_NEGOCIO.md) — Validações nos dados
- [src/services/storage/indexedDB.js](../src/services/storage/indexedDB.js) — Implementação
- [src/services/storage/syncService.js](../src/services/storage/syncService.js) — Conversão Supabase
