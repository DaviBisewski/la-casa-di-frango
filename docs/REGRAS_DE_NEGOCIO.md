# Regras de Negócio

> **Todas as regras implementadas no sistema — como o negócio funciona**

---

## 📋 Índice

- [Expediente](#expediente)
- [Estoque](#estoque)
- [Encomendas](#encomendas)
- [Vendas Rápidas](#vendas-rápidas)
- [Modo Domingo](#modo-domingo)
- [Sincronização](#sincronização)
- [Backup e Recuperação](#backup-e-recuperação)
- [Validações](#validações)

---

## Expediente

### O que é um Expediente?

Um **expediente** é um "dia de venda" — um período do dia em que a loja está aberta vendendo frango assado. Cada expediente:

- Tem data única (só um expediente por dia pode estar ativo)
- Começa com estoque inicial definido pelo usuário
- Acumula encomendas e vendas durante o dia
- Termina quando o usuário clica em "Encerrar"
- Fica no histórico forever (nunca é deletado)

### Criação de Expediente

**Regra**: Só pode existir UM expediente ativo por vez

```javascript
if (expedienteService.temExpedienteAtivo()) {
  // Já existe um ativo — redireciona para Dashboard
  return null;
}
```

**Sequência**:
1. Usuário navega para `/estoque`
2. Preenche quantidades: Com Recheio, Sem Recheio, Meio Frango
3. Se for domingo, também preenche: Maionese P, Maionese G, Costela
4. Clica "Começar Expediente"
5. Sistema cria novo expediente com:
   - `id`: gerado como `YYYY-MM-DD-timestamp` para garantir unicidade
   - `date`: data formatada `YYYY-MM-DD`
   - `status`: "active"
   - `isSunday`: true/false detectado via `new Date().getDay() === 0`
   - `iniciadoEm`: timestamp Unix em ms
   - `estoque`: objeto com quantidades iniciais
   - `pedidos`: array vazio `[]`
   - `vendas`: array vazio `[]`

**Exemplo de ID**:
```
2026-05-11-1746123456789
└─────┬─────┘ └────┬────┘
   data      timestamp
```

### Modificação Durante o Dia

**O que pode ser modificado**:
- ✓ Adicionar encomendas
- ✓ Adicionar vendas
- ✓ Marcar encomenda como retirada
- ✓ Visualizar métricas

**O que NÃO pode ser modificado**:
- ✗ Estoque inicial (travado após criação)
- ✗ Data do expediente
- ✗ Horário de abertura

### Encerramento

**Regra**: Irreversível. Uma vez encerrado, o expediente fica "congelado"

**O que acontece**:
1. Status muda para "closed"
2. `encerradoEm` preenchido com timestamp
3. Expediente move para histórico (não aparece mais em "Ativo")
4. Não pode mais adicionar encomendas/vendas
5. Pode ser visualizado mas não modificado

**Código**:
```javascript
export const encerrar = (expediente) => ({
  ...expediente,
  status: "closed",
  encerradoEm: Date.now()
});
```

### Visualização de Histórico

**Ordenação**: Ativo primeiro (se houver), depois por data decrescente

```javascript
const ordenado = dados.sort((a, b) => {
  if (a.status === "active" && b.status !== "active") return -1;
  if (b.status === "active" && a.status !== "active") return 1;
  return b.date.localeCompare(a.date);
});
```

---

## Estoque

### Conceito de Disponibilidade

**Fórmula**: `Disponível = Estoque Original - Encomendado - Vendido`

```javascript
getDisponivel(expediente, chave) {
  const original    = expediente.estoque[chave];
  const encomendado = getTotalEncomendado(expediente, chave);
  const vendido     = getTotalVendido(expediente, chave);
  return original - encomendado - vendido;
}
```

**Exemplo**:
```
Frango Com Recheio:
├─ Original:      50 unidades
├─ Encomendado:   15 unidades (3 encomendas)
├─ Vendido:       20 unidades (venda balcão)
└─ Disponível:    15 unidades
```

### Garantia: Nunca Negativo

**Regra**: Sistema previne que disponibilidade fique negativa

Se usuário tenta registrar quantidade que excede disponível, o campo:
- ✓ Ativa máximo no input: `max={disponivel}`
- ✓ Botão "Confirmar" fica desabilitado se ultrapassar
- ✓ Toast de erro se tentar confirmar inválido

### Produtos Disponíveis

#### Dias Normais (seg-sab)
- Frango Com Recheio
- Frango Sem Recheio
- Meio Frango

#### Domingo (modo especial)
- Frango Com Recheio
- Frango Sem Recheio
- Meio Frango
- Maionese R$10,00
- Maionese R$15,00
- Costela

**Detecção de Domingo**:
```javascript
const isSunday = new Date().getDay() === 0;  // 0 = domingo
```

---

## Encomendas

### O que é uma Encomenda?

Uma **encomenda** é um pedido de cliente (por telefone, WhatsApp, etc.) que será retirado no futuro.

**Diferenças de Venda**:
| Aspecto | Encomenda | Venda |
|--------|-----------|-------|
| Cliente | ✓ Obrigatório (nome) | ✗ Anônima |
| Telefone | ~ Opcional | — |
| Rastreamento | ✓ Sim (retirado/não) | ✗ Não |
| Marcação | ✓ Sim | ✗ Não |

### Registrando Encomenda

**Dados necessários**:
```javascript
{
  nome: string,          // obrigatório
  telefone: string,      // opcional (vazio = "")
  itens: Array[
    {
      chave: string,     // identificador do produto
      quantidade: number // quantidade solicitada
    }
  ]
}
```

**Validações**:
- ✓ Nome não vazio
- ✓ Pelo menos um item com quantidade > 0
- ✓ Quantidade não pode ser maior que disponível

**Criação**:
```javascript
{
  id: Date.now(),           // ID único baseado em timestamp
  tipo: "encomenda",
  nome: "João Silva",
  telefone: "11987654321",
  itens: [
    { chave: "frangosComRecheio", quantidade: 2 }
  ],
  retirado: false           // começa como não retirado
}
```

### Buscando Encomenda

**Busca por**: Nome OU Telefone

**Case-insensitive**: "joão" encontra "JOÃO"

```javascript
const encontrados = pedidos.filter(p =>
  p.nome.toLowerCase().includes(busca.toLowerCase()) ||
  p.telefone.includes(busca)
);
```

### Marcando Como Retirado

**Regra**: Irreversível (só funciona uma vez)

```javascript
if (pedido.retirado) {
  mostrar("Já estava retirado", "aviso");
  return;
}

// Marca como retirado
const atualizado = expedienteService.marcarRetirado(exp, pedidoId);
```

**Efeito visual**:
- Ícone verde circular ao lado da encomenda
- Fica "destacado" ou "esmaecido"

---

## Vendas Rápidas

### O que é uma Venda Rápida?

Uma **venda** é um registro de venda de balcão — sem cliente identificado. Usada para:

- Vendas a clientes anônimos
- Balcão drop-in
- Vendas rápidas sem registro

### Registrando Venda

**Dados necessários**:
```javascript
{
  itens: Array[
    {
      chave: string,
      quantidade: number
    }
  ]
}
```

**Validações**:
- ✓ Pelo menos um item
- ✓ Quantidade > 0
- ✓ Quantidade ≤ disponível

**Criação**:
```javascript
{
  id: Date.now(),
  tipo: "venda",
  itens: [
    { chave: "frangosComRecheio", quantidade: 1 }
  ]
  // Sem nome, telefone, retirado
}
```

### Diferença em Cálculos

Vendas contam para:
- ✓ `getTotalVendido()`
- ✓ Reduz disponibilidade igual a encomendas
- ✓ Aparecem no relatório final

---

## Modo Domingo

### Ativação Automática

**Detectado por**:
```javascript
const isSunday = new Date().getDay() === 0;
```

**Efeito**:
- ✓ Formulário de criação mostra campos extras
- ✓ Estoque inicial pode incluir Maionese e Costela
- ✓ Dashboard mostra filtro de categorias
- ✓ Flag `isSunday: true` salva no expediente

### Produtos de Domingo

```javascript
const categoriaDomingo = {
  frangos: [/* normais */],
  maioneses: [
    "Maionese P (R$10)",
    "Maionese G (R$15)"
  ],
  costela: ["Costela"]
};
```

### Uso em Telas

**Encomenda.jsx**:
```javascript
if (isSunday) {
  // mostra guia "Maioneses" e "Costela"
  <GuiaMaioneses />
  <GuiaCostela />
}
```

**Dashboard.jsx**:
```javascript
{isSunday && (
  <EstoqueFiltros filtros={FILTROS_CATEGORIA} />
)}
```

### Histórico

Se um expediente é criado no domingo com `isSunday: true`, quando visualizado no histórico, mostra os produtos domingo mesmo que estejamos em outro dia.

---

## Sincronização

### Arquitetura Offline-First

```
Usuário executa ação
  ↓
Salva localmente (localStorage + IndexedDB) — IMEDIATO
  ↓
Se online: Marca para sync com Supabase
Se offline: Fica na fila local
  ↓
Quando volta online: Sincroniza automaticamente
```

### Fila de Pendentes

**Armazenamento**: localStorage sob chave `frango_sync_pendentes`

```javascript
localStorage.frango_sync_pendentes = JSON.stringify([
  "2026-05-11-1746123456",
  "2026-05-10-1746012345"
]);
```

**Quando item vai para fila**:
- Novo expediente criado
- Encomenda adicionada
- Venda registrada
- Qualquer mudança durante offline

**Quando é sincronizado**:
- Automaticamente 2s após voltar online
- Ou manualmente via botão em Configurações

### Sincronização Manual

**Tela**: Config → "Sincronizar com Nuvem"

```javascript
async function handleSincronizar() {
  setSyncLoading(true);
  const resultado = await sincronizarPendentes();
  
  if (resultado.sincronizados > 0) {
    mostrar(`✓ ${resultado.sincronizados} sincronizados`, "sucesso");
  }
  if (resultado.erros > 0) {
    mostrar(`✗ ${resultado.erros} erros`, "aviso");
  }
  setSyncLoading(false);
}
```

### Conflitos e Upsert

**Regra**: Supabase usa `upsert` → insere se novo, atualiza se existe

```javascript
await supabase
  .from("expedientes")
  .upsert(expediente, { onConflict: "id" })
```

**Resolução de Conflitos**:
- ✓ ID é chave única → nunca duplica
- ✓ Sempre sobrescreve com dados locais (o mais recente)
- ✓ Timestamp (`updated_at`) indica qual é mais novo

---

## Backup e Recuperação

### Backup Automático

**Frequência**: A cada 5 minutos

**O que salva**: Todos os expedientes do IndexedDB

**Onde**: localStorage sob chave `frango_backup_emergencia`

**Usado para**: Recuperação se IndexedDB falhar

```javascript
// Chamado automaticamente por useBackupAutomatico
export async function fazerBackupEmergencia() {
  const todos = await getTodosExpedientesIDB();
  salvarBackupEmergencia(todos);
  console.log("💾 Backup automático realizado");
}
```

### Exportar Backup Manual

**Tela**: Config → "Exportar Dados"

**O que gera**: Arquivo JSON com todos os dados

**Nome**: `frango_backup_YYYY-MM-DD.json`

**Formato**:
```json
{
  "versao": "1.0",
  "exportadoEm": "2026-05-11T14:30:00Z",
  "app": "La Casa Di Frango",
  "expedientes": [
    { /* expediente 1 */ },
    { /* expediente 2 */ }
  ]
}
```

**Uso**: Salvar arquivo em lugar seguro, nuvem pessoal, etc.

### Importar Backup Manual

**Tela**: Config → "Importar Dados"

**Seleção**: Choose file → seleciona arquivo JSON

**Operação**: MERGE (não deleta dados existentes)

```javascript
export async function importarJSON(arquivo) {
  const dados = JSON.parse(arquivo);
  // Para cada expediente:
  // - Se não existe: cria
  // - Se existe com mesmo ID: atualiza
  await importarExpedientesIDB(dados.expedientes);
  return { importados: dados.length, erro: null };
}
```

**Segurança**: Nunca deleta dados. Se arquivo está corrompido, dados locais prevalecem.

### Recuperação de Emergência

**Cenário**: IndexedDB falhou, usuário perdeu dados.

**Solução automática**:
1. Sistema detecta falha ao tentar ler IndexedDB
2. Carrega backup de emergência do localStorage
3. Continua funcionando com dados salvos
4. Avisa ao usuário: "Usando backup local — sincronize assim que possível"

```javascript
export async function getHistorico() {
  try {
    return await getTodosExpedientesIDB();
  } catch {
    console.warn("IndexedDB falhou — usando backup");
    const backup = getBackupEmergencia();
    return backup?.expedientes || [];
  }
}
```

---

## Validações

### Validações de Entrada

| Campo | Validação | Erro |
|-------|-----------|------|
| Nome cliente | Não vazio | "Nome obrigatório" |
| Quantidade | > 0 | "Quantidade deve ser > 0" |
| Quantidade | ≤ disponível | "Sem estoque suficiente" |
| Telefone | Opcional | — |
| Estoque inicial | ≥ 0 | "Quantidade não pode ser negativa" |

### Validações de Lógica

| Cenário | Validação | Ação |
|---------|-----------|------|
| Usuário tenta criar expediente já ativo | Existe ativo? | Rejeita e redireciona para Dashboard |
| Usuário tenta marcar retirado 2x | Já retirado? | Ignora segunda tentativa |
| Usuário tenta vender mais que disponível | Quantidade > max? | Input fica desabilitado, botão cinzento |
| Arquivo JSON corrompido | Parse falha? | "Arquivo inválido ou corrompido" |

### Validação de Sincronização

**Antes de enviar para Supabase**:
- ✓ ID está preenchido
- ✓ Data está preenchida
- ✓ Status é "active" ou "closed"
- ✓ Estrutura é válida (sem campos extras)

**Se validação falha**:
- Erro logado no console
- Item permanece na fila
- Tenta novamente na próxima sync

---

## 🔗 Relacionados

- [GUIA_DO_USUARIO.md](GUIA_DO_USUARIO.md) — Como usar essas regras
- [BANCO_DE_DADOS.md](BANCO_DE_DADOS.md) — Estrutura que persiste essas regras
- [src/services/expedienteService.js](../src/services/expedienteService.js) — Implementação das regras
