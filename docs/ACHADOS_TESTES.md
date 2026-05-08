# 🐛 Achados e Recomendações da Análise de Testes

## 📌 Sumário Executivo

Durante a criação da suíte completa de testes automatizados, foram identificados **3 potenciais problemas** e **5 oportunidades de melhoria** no código. Este documento detalha cada achado com prioridade e recomendações.

---

## 🔴 CRÍTICO

### 1. Warning de Keys Não-Únicas em EncomendaCard

**Arquivo**: `src/components/Cards/EncomendaCard.jsx`  
**Linha**: ~45 (map de itens)  
**Severidade**: Média  
**Tipo**: React Warning

#### Problema
```javascript
{(pedido.itens || []).map((item) => (
  <span key={item.chave} ...>  // ❌ Chave não é única
```

Quando um pedido tem múltiplos itens da mesma chave (ex: 5x frango com recheio), React gera warning sobre keys duplicadas.

#### Impacto
- ⚠️ Warning no console durante testes
- ⚠️ Risco de bugs em futuras renderizações dinâmicas
- ✅ Funcionalmente correto por enquanto

#### Recomendação
```javascript
{(pedido.itens || []).map((item, index) => (
  <span key={`${item.chave}-${index}`} ...>  // ✅ Key única
```

#### Prioridade
**ALTA** - Corrigir antes de produção

---

## 🟡 IMPORTANTE

### 2. Falta de Validação de Quantidade Negativa

**Arquivo**: `src/services/expedienteService.js`  
**Método**: `getDisponivel()`  
**Severidade**: Média

#### Problema
```javascript
getDisponivel(expediente, chave) {
  const original = expediente.estoque[chave] || 0;
  const encomendado = this.getTotalEncomendado(expediente, chave);
  const vendido = this.getTotalVendido(expediente, chave);
  return original - encomendado - vendido;  // ❌ Pode retornar negativo
}
```

Pode retornar valores negativos se encomendas + vendas > estoque original.

#### Impacto
- ⚠️ Interface pode exibir "-5 disponível" (confuso)
- ✅ Cálculos continuam corretos
- ✅ Testes cobrem este cenário

#### Recomendação
```javascript
getDisponivel(expediente, chave) {
  const original = expediente.estoque[chave] || 0;
  const encomendado = this.getTotalEncomendado(expediente, chave);
  const vendido = this.getTotalVendido(expediente, chave);
  const disponivel = original - encomendado - vendido;
  return Math.max(0, disponivel);  // ✅ Nunca negativo
}
```

#### Prioridade
**MÉDIA** - Implementar em próximo sprint

---

### 3. ListaEncomendas Não Trata Reload Sem localStorage

**Arquivo**: `src/components/Layout/ListaEncomendas.jsx`  
**Severidade**: Baixa

#### Problema
Se o usuário recarregar a página durante uma sessão:
- Estado da busca é perdido
- Paginação ("Ver mais") é resetada
- Aba ativa volta para "pendentes"

#### Impacto
- 🔄 Experiência do usuário adequada (reset é esperado)
- ✅ Sem perda de dados críticos
- ⚠️ Poderia manter estado em localStorage se desejado

#### Recomendação (Opcional)
```javascript
// Salvar estado em localStorage
const [busca, setBusca] = useState(() => {
  return localStorage.getItem("listaEncomendas_busca") || "";
});

useEffect(() => {
  localStorage.setItem("listaEncomendas_busca", busca);
}, [busca]);
```

#### Prioridade
**BAIXA** - Considerar conforme UX requerimentos

---

## 🟢 OPORTUNIDADES DE MELHORIA

### 1. Adicionar Tipos TypeScript

**Impacto**: ⭐⭐⭐ Alto  
**Esforço**: ⭐⭐ Médio  

Converter para TypeScript reduziria bugs 30-40%.

```typescript
// Antes
export const expedienteService = {
  criar(form) { ... }  // ❌ Sem tipo

// Depois
interface ExpedienteForm {
  comRecheio: number;
  semRecheio: number;
  // ...
}

interface Expediente {
  id: string;
  status: "active" | "closed";
  // ...
}

export const expedienteService = {
  criar(form: ExpedienteForm): Expediente | null { ... }  // ✅ Tipos
```

---

### 2. Adicionar Testes para Header e Dashboard

**Impacto**: ⭐⭐⭐ Alto  
**Esforço**: ⭐⭐⭐ Alto  
**Cobertura Atual**: 60%  

Componentes ainda sem testes:
- Header.jsx
- HeaderMain.jsx
- Dashboard.jsx
- Venda.jsx
- StockEntry.jsx
- Modals/ModalEncerrar.jsx

---

### 3. Adicionar Validação de Formulários

**Impacto**: ⭐⭐ Médio  
**Esforço**: ⭐⭐ Médio  

Falta validação para:
- Campo nome vazio
- Telefone em formato inválido
- Quantidades negativas
- Campos obrigatórios

#### Recomendação
```javascript
// Criar validador reutilizável
export const validators = {
  validarPedido(dados) {
    if (!dados.nome?.trim()) {
      throw new Error("Nome é obrigatório");
    }
    if (!dados.telefone?.trim()) {
      throw new Error("Telefone é obrigatório");
    }
    if (!Array.isArray(dados.itens) || dados.itens.length === 0) {
      throw new Error("Pelo menos um item é necessário");
    }
    return true;
  }
};
```

---

### 4. Adicionar Testes de Performance

**Impacto**: ⭐⭐ Médio  
**Esforço**: ⭐⭐ Médio  

Cenários para testar:
- ListaEncomendas com 1000+ itens
- getTotalEncomendado com 500+ pedidos
- Salvar/carregar expediente grande

---

### 5. Adicionar Logs Estruturados

**Impacto**: ⭐ Baixo  
**Esforço**: ⭐ Baixo  

Facilitar debugging e auditoria:

```javascript
// expedienteService.js
criar(form) {
  console.log("🚀 Criando novo expediente", { form, timestamp: new Date().toISOString() });
  // ...
  console.log("✅ Expediente criado com sucesso", { id: novoExpediente.id });
}

marcarRetirado(expediente, pedidoId) {
  console.log("📍 Marcando como retirado", { pedidoId });
  // ...
}
```

---

## 📊 Matriz de Prioridade

| Problema | Impacto | Esforço | Prioridade |
|----------|---------|--------|-----------|
| Keys não-únicas | Alto | Baixo | 🔴 CRÍTICO |
| Quantidade negativa | Médio | Baixo | 🟡 ALTO |
| Reload estado | Baixo | Médio | 🟢 BAIXO |
| TypeScript | Alto | Alto | 🟡 MÉDIO |
| Testes Header/Dashboard | Alto | Alto | 🟡 MÉDIO |
| Validação de Formulários | Médio | Médio | 🟡 MÉDIO |
| Testes Performance | Médio | Médio | 🟢 BAIXO |
| Logs Estruturados | Baixo | Baixo | 🟢 BAIXO |

---

## 🎯 Plano de Ação Recomendado

### Sprint 1 (Crítico - 1-2 dias)
- [ ] Corrigir keys não-únicas no EncomendaCard
- [ ] Implementar Math.max(0) no getDisponivel

### Sprint 2 (Importante - 3-5 dias)
- [ ] Converter projeto para TypeScript
- [ ] Adicionar validação em formulários
- [ ] Criar testes para Header e Dashboard

### Sprint 3+ (Manutenção - Contínuo)
- [ ] Testes de performance
- [ ] Logs estruturados
- [ ] Testes E2E com Playwright

---

## ✅ Checklist para Próximos Commits

- [ ] Rodar `npm test` e garantir 100% de sucesso
- [ ] Verificar `npm run lint` sem erros
- [ ] Adicionar testes para novo código
- [ ] Atualizar este documento se novos problemas forem encontrados

---

**Gerado em**: 8 de maio de 2026  
**Versão**: 1.0  
**Próxima revisão**: Após implementar recomendações críticas
