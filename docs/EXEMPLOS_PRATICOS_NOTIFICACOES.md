# 🎨 EXEMPLOS PRÁTICOS - Notificações em Ação

## 📱 Antes vs Depois

### ❌ ANTES (StockEntry.jsx)
```javascript
function handleSubmit() {
  iniciarExpedienteComEstoque(form);
  navigate("/dashboard");  // Usuário não sabe se funcionou!
}
```

### ✅ DEPOIS (StockEntry.jsx)
```javascript
function handleSubmit() {
  try {
    iniciarExpedienteComEstoque(form);
    notificarSucesso(MENSAGENS.EXPEDIENTE_CRIADO);  // 🎉 Notificação verde!
    navigate("/dashboard");
  } catch (erro) {
    notificarErro(MENSAGENS.ERRO_GENERICO);  // ❌ Notificação vermelha se erro
    console.error('Erro ao iniciar expediente:', erro);
  }
}
```

---

## 🎯 Exemplos de Cada Tipo de Notificação

### 1️⃣ Sucesso (Verde)
```javascript
// Quando operação é bem-sucedida
notificarSucesso(MENSAGENS.EXPEDIENTE_CRIADO);
// Exibição: "Expediente iniciado com sucesso! 🎉"
// Duração: 2 segundos
// Cor: Verde #2ecc71
```

**Cenários:**
- ✅ Novo expediente criado
- ✅ Encomenda adicionada
- ✅ Venda registrada

---

### 2️⃣ Erro (Vermelho)
```javascript
// Quando algo dá errado
notificarErro(MENSAGENS.ERRO_GENERICO);
// Exibição: "Ocorreu um erro ao processar a ação"
// Duração: 3 segundos (mais longo para ler)
// Cor: Vermelho #e74c3c
```

**Cenários:**
- ❌ Falha ao salvar dados
- ❌ Validação falhando
- ❌ Erro de conexão (se implementar API)

---

### 3️⃣ Aviso (Amarelo)
```javascript
// Quando há algo importante a informar
notificarAviso(MENSAGENS.QUANTIDADE_INSUFICIENTE);
// Exibição: "Atenção: Quantidade indisponível em estoque"
// Duração: 2.5 segundos
// Cor: Amarelo #f39c12
```

**Cenários:**
- ⚠️ Quantidade em falta em encomenda
- ⚠️ Quantidade insuficiente para venda
- ⚠️ Confirmar ação crítica

---

### 4️⃣ Informação (Azul)
```javascript
// Quando é apenas informação
notificarInfo(`Visualizando expediente de 07 mai`);
// Exibição: data formatada
// Duração: 2 segundos
// Cor: Azul #3498db
```

**Cenários:**
- ℹ️ Mudança de contexto
- ℹ️ Ação não crítica concluída
- ℹ️ Status de operação

---

## 💻 Código Real dos 4 Screens

### 🏠 StockEntry.jsx - Iniciar Expediente
```javascript
/**
 * Submete o formulário de estoque inicial
 * Inicia um novo expediente com as quantidades informadas
 * Notifica o usuário de sucesso ou erro
 */
function handleSubmit() {
  try {
    iniciarExpedienteComEstoque(form);
    notificarSucesso(MENSAGENS.EXPEDIENTE_CRIADO);
    navigate("/dashboard");
  } catch (erro) {
    notificarErro(MENSAGENS.ERRO_GENERICO);
    console.error('Erro ao iniciar expediente:', erro);
  }
}
```

**Flow:**
1. Usuário preenche quantidades
2. Clica em "SALVAR"
3. `handleSubmit()` é acionado
4. Se bem-sucedido → Toast verde "Expediente iniciado com sucesso! 🎉"
5. Se erro → Toast vermelho "Ocorreu um erro ao processar a ação"

---

### 📦 Encomenda.jsx - Adicionar Encomenda
```javascript
/**
 * Submete uma nova encomenda
 * Valida dados, calcula itens não vazios, e salva a encomenda
 * Notifica o usuário sobre sucesso, aviso de falta de estoque ou erro
 */
function handleSubmit() {
  try {
    const itens = Object.entries(qtds)
      .filter(([, quantidade]) => quantidade > 0)
      .map(([chave, quantidade]) => ({ chave, quantidade }));

    if (!nome.trim() || itens.length === 0) {
      notificarAviso('Preencha o nome do cliente e selecione um produto');
      return;
    }

    adicionarEncomenda({ nome, telefone, itens });
    
    // Calcula quantidade em falta
    let totalEmFalta = 0;
    itens.forEach(({ chave, quantidade }) => {
      const disponivel = expedienteService.getDisponivel(expediente, chave);
      if (quantidade > disponivel) {
        totalEmFalta += quantidade - disponivel;
      }
    });

    if (totalEmFalta > 0) {
      notificarAviso(MENSAGENS.ENCOMENDA_EM_FALTA(totalEmFalta));
    } else {
      notificarSucesso(MENSAGENS.ENCOMENDA_ADICIONADA);
    }
    
    navigate("/dashboard");
  } catch (erro) {
    notificarErro(MENSAGENS.ERRO_GENERICO);
    console.error('Erro ao adicionar encomenda:', erro);
  }
}
```

**Fluxos Possíveis:**

**Cenário 1: Sem nome ou produtos**
- Toast amarelo: "Preencha o nome do cliente e selecione um produto"
- Não navega

**Cenário 2: Com quantidade suficiente**
- Toast verde: "Encomenda adicionada com sucesso! 📦"
- Navega para dashboard

**Cenário 3: Quantidade insuficiente**
- Toast amarelo: "Total em falta: 5 unidades"
- Navega para dashboard (encomenda salva mesmo assim)

**Cenário 4: Erro ao salvar**
- Toast vermelho: "Ocorreu um erro ao processar a ação"
- Não navega (usuário pode tentar novamente)

---

### 💳 Venda.jsx - Registrar Venda
```javascript
/**
 * Submete uma nova venda
 * Valida se há itens selecionados e registra a venda no expediente
 * Notifica o usuário sobre sucesso, aviso de quantidade insuficiente ou erro
 */
function handleSubmit() {
  try {
    const itens = Object.entries(qtds)
      .filter(([, quantidade]) => quantidade > 0)
      .map(([chave, quantidade]) => ({ chave, quantidade }));

    if (itens.length === 0) {
      notificarAviso('Selecione pelo menos um produto para vender');
      return;
    }

    // Verifica se há quantidade suficiente
    let quantidadeInsuficiente = false;
    itens.forEach(({ chave, quantidade }) => {
      const disponivel = expedienteService.getDisponivel(expediente, chave);
      if (quantidade > disponivel) {
        quantidadeInsuficiente = true;
      }
    });

    if (quantidadeInsuficiente) {
      notificarAviso(MENSAGENS.QUANTIDADE_INSUFICIENTE);
    }

    adicionarVenda({ itens });
    notificarSucesso(MENSAGENS.VENDA_REGISTRADA);
    navigate("/dashboard");
  } catch (erro) {
    notificarErro(MENSAGENS.ERRO_GENERICO);
    console.error('Erro ao registrar venda:', erro);
  }
}
```

**Fluxos Possíveis:**

**Cenário 1: Sem produtos selecionados**
- Toast amarelo: "Selecione pelo menos um produto para vender"
- Não navega

**Cenário 2: Venda com quantidade suficiente**
- Toast verde: "Venda registrada com sucesso! ✅"
- Navega para dashboard

**Cenário 3: Quantidade insuficiente**
- Toast amarelo: "Atenção: Quantidade indisponível em estoque"
- Depois toast verde: "Venda registrada com sucesso! ✅"
- Navega para dashboard (venda salva mesmo assim)

**Cenário 4: Erro ao registrar**
- Toast vermelho: "Ocorreu um erro ao processar a ação"
- Não navega

---

### 🏠 Home.jsx - Visualizar Expediente Anterior
```javascript
/**
 * Muda o expediente visualizado para o selecionado no histórico
 * Notifica ao usuário qual expediente está sendo visualizado
 * @param {Object} exp - Objeto do expediente a visualizar
 */
function handleVerExpediente(exp) {
  verExpediente(exp);
  const data = new Intl.DateTimeFormat('pt-BR', {
    weekday: 'short', day: 'numeric', month: 'short'
  }).format(new Date(exp.data));
  notificarInfo(`Visualizando expediente de ${data}`);
  navigate("/dashboard");
}
```

**Flow:**
1. Usuário vê histórico de expedientes
2. Clica em um expediente anterior
3. Toast azul: "Visualizando expediente de 06 mai"
4. Navega para dashboard com dados daquele dia

---

## 🎨 Aparência Visual

### Toast Sucesso
```
┌─────────────────────────────────────────────┐
│ ✓ Expediente iniciado com sucesso! 🎉        │
└─────────────────────────────────────────────┘
Posição: Canto superior direito
Cor: Verde (#2ecc71)
Duração: 2 segundos
Ícone: Checkmark automático
```

### Toast Erro
```
┌─────────────────────────────────────────────┐
│ ✕ Ocorreu um erro ao processar a ação       │
└─────────────────────────────────────────────┘
Posição: Canto superior direito
Cor: Vermelho (#e74c3c)
Duração: 3 segundos
Ícone: X automático
```

### Toast Aviso
```
┌─────────────────────────────────────────────┐
│ ⚠ Total em falta: 5 unidades                │
└─────────────────────────────────────────────┘
Posição: Canto superior direito
Cor: Amarelo (#f39c12)
Duração: 2.5 segundos
Ícone: Triângulo automático
```

### Toast Info
```
┌─────────────────────────────────────────────┐
│ ℹ Visualizando expediente de 06 mai          │
└─────────────────────────────────────────────┘
Posição: Canto superior direito
Cor: Azul (#3498db)
Duração: 2 segundos
Ícone: i automático
```

---

## 🔄 Fluxo Completo Exemplo

### Usuário inicializa novo expediente:

```
1. HOME PAGE
   └─> Clica em "INFORME O ESTOQUE DE HOJE"

2. STOCK ENTRY PAGE
   └─> Preenche:
       • Frangos C/R: 50
       • Frangos S/R: 40
       • Meios: 20
   └─> Clica em "SALVAR"

3. handleSubmit() EXECUTADO
   ├─> Valida dados ✓
   ├─> Chama iniciarExpedienteComEstoque()
   ├─> Salva em localStorage ✓
   ├─> Chama notificarSucesso()
   │   └─> 🎉 Toast Verde Aparece:
   │       "Expediente iniciado com sucesso! 🎉"
   ├─> (Após 2 segundos toast desaparece)
   └─> Navega para "/dashboard"

4. DASHBOARD PAGE
   └─> Mostra estoque do dia com dados
```

---

## 📝 Constantes de Mensagens

Em `/src/utils/toastConfig.js`:

```javascript
export const MENSAGENS = {
  // Sucessos
  EXPEDIENTE_CRIADO: 'Expediente iniciado com sucesso! 🎉',
  ENCOMENDA_ADICIONADA: 'Encomenda adicionada com sucesso! 📦',
  VENDA_REGISTRADA: 'Venda registrada com sucesso! ✅',
  
  // Avisos
  QUANTIDADE_INSUFICIENTE: 'Atenção: Quantidade indisponível em estoque',
  ENCOMENDA_EM_FALTA: (quantidade) => `Total em falta: ${quantidade} unidades`,
  
  // Informações
  EXPEDIENTE_VISUALIZADO: (data) => `Visualizando expediente de ${data}`,
  
  // Erros
  ERRO_GENERICO: 'Ocorreu um erro ao processar a ação',
  ERRO_VALIDACAO: 'Verifique os dados e tente novamente',
  ERRO_SALVAR: 'Erro ao salvar os dados',
};
```

---

## 🎯 Como Adicionar Nova Notificação

### Passo 1: Definir mensagem em `toastConfig.js`
```javascript
MENSAGENS = {
  // ...existentes...
  MINHA_NOVA_MENSAGEM: 'Minha nova mensagem aqui',
}
```

### Passo 2: Usar no componente
```javascript
import { notificarSucesso, MENSAGENS } from "../utils/toastConfig";

function meuComponente() {
  // ... código ...
  notificarSucesso(MENSAGENS.MINHA_NOVA_MENSAGEM);
}
```

### Passo 3: Testar no navegador
```bash
npm run dev
# Executar ação que dispara notificação
```

---

**Fim dos Exemplos Práticos**
