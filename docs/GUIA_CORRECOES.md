# 🔧 Guia de Correções - Exemplos de Código

## 1. Refatorar Header (Remover Duplicação)

### ❌ Antes (Dois arquivos)
**Header.jsx** - com botão de config à direita  
**HeaderMain.jsx** - sem botão, logo centralizado

### ✅ Depois (Um arquivo)

**src/components/Header/Header.jsx**
```jsx
import logo from '../../assets/logos/logo.svg';
import gearIcon from '../../assets/icons/config.svg';
import { Link } from 'react-router-dom';

export function Header({ showConfig = false, onConfigClick }) {
  return (
    <header className="w-full bg-[#0F4C3A] py-15 px-10 shadow-md">
      <div className={`
        max-w-[1400px] mx-auto flex items-center 
        ${showConfig ? 'justify-between' : 'justify-center'}
      `}>
        
        {/* Logo e Marca */}
        <Link to="/">
          <div className="flex items-center gap-6">
            <div className="flex-shrink-0">
              <img 
                src={logo} 
                alt="Logo La Casa Di Frango" 
                className="w-28 h-28 object-contain"
              />
            </div>
            <h1 className="text-white text-5xl font-extrabold">
              La Casa Di Frango
            </h1>
          </div>
        </Link>

        {/* Botão de Configurações (opcional) */}
        {showConfig && (
          <button 
            onClick={onConfigClick}
            className="p-4 hover:opacity-80 transition-opacity" 
            aria-label="Configurações"
          >
            <img 
              src={gearIcon} 
              alt="Configurações" 
              className="w-20 h-20 brightness-0 invert" 
            />
          </button>
        )}

      </div>
    </header>
  );
}

// Para manter compatibilidade, exportar também as variantes nomeadas
export function HeaderMain() {
  return <Header />;
}

export default Header;
```

**Uso em App.jsx:**
```jsx
import { Header } from './components/Header/Header';

function LayoutHandler() {
  const location = useLocation();
  const isHome = location.pathname === "/";
  
  const handleConfigClick = () => {
    // Implementar navegação para configurações
    console.log("Abrir configurações");
  };

  return (
    <>
      <Header 
        showConfig={isHome} 
        onConfigClick={handleConfigClick}
      />
      <Routes>
        {/* ... */}
      </Routes>
    </>
  );
}
```

---

## 2. Remover Código Comentado

### ❌ Antes - Dashboard.jsx
```jsx
return (
  <div className="max-w-[1400px] mx-auto px-12 py-16">

    {/* Cabeçalho — estoque + status maiores */}
    <div className="flex items-center justify-between mb-12">
      {/* ... */}
    </div>

    {/* Filtros — só domingo */}
    {isSunday && (
      <EstoqueFiltros
        filtros={FILTROS}
        filtroAtivo={filtroAtivo}
        onChange={setFiltroAtivo}
      />
    )}

    {/* Frangos */}
    {(!isSunday || filtroAtivo === "frangos") && (
      <EstoqueCarrossel items={itemsFrangos} />
    )}

    {/* Maioneses */}
    {isSunday && filtroAtivo === "maioneses" && (
      {/* ... */}
    )}

    {/* Costela */}
    {isSunday && filtroAtivo === "costela" && (
      {/* ... */}
    )}

    {/* Botões de ação */}
    {isAtivo && <BotoesAcao />}

  </div>
);
```

### ✅ Depois - Dashboard.jsx (Limpo)
```jsx
return (
  <div className="max-w-[1400px] mx-auto px-12 py-16">

    <div className="flex items-center justify-between mb-12">
      <div className="flex items-center gap-5">
        <img src={estoqueIcon} alt="Estoque" className="w-14 h-14" />
        <h2 className="text-[#0F4C3A] text-5xl font-extrabold">Estoque</h2>
      </div>
      <span className="flex items-center gap-4 bg-[#0F4C3A] text-white
                       text-2xl font-semibold px-10 py-5 rounded-full">
        <img
          src={isAtivo ? ativoIcon : encerradoIcon}
          alt={isAtivo ? "Ativo" : "Encerrado"}
          className="w-8 h-8 brightness-0 invert"
        />
        {isAtivo ? "Ativo" : "Encerrado"}
      </span>
    </div>

    {isSunday && (
      <EstoqueFiltros
        filtros={FILTROS}
        filtroAtivo={filtroAtivo}
        onChange={setFiltroAtivo}
      />
    )}

    {(!isSunday || filtroAtivo === "frangos") && (
      <EstoqueCarrossel items={itemsFrangos} />
    )}

    {isSunday && filtroAtivo === "maioneses" && (
      <div className="grid grid-cols-2 gap-6">
        <EstoqueCard titulo="Maionese R$10,00" icone={maioneseIcon} estoque={estoque.maionese10} fullWidth />
        <EstoqueCard titulo="Maionese R$15,00" icone={maioneseIcon} estoque={estoque.maionese15} fullWidth />
      </div>
    )}

    {isSunday && filtroAtivo === "costela" && (
      <EstoqueCard titulo="Costela" icone={costelaIcon} estoque={estoque.costela} fullWidth />
    )}

    {isAtivo && <BotoesAcao />}

  </div>
);
```

---

## 3. Corrigir EstoqueCard - Remover Prop Não Utilizado

### ❌ Antes - EstoqueCard.jsx
```jsx
export function EstoqueCard({ titulo, icone, estoque, encomendado = 0, fullWidth = false }) {
  const disponivel = estoque - encomendado;  // Prop nunca é passado!

  return (
    <div className={`
      bg-white border-2 border-[#0F4C3A]/10 rounded-2xl p-10 flex-shrink-0
      ${fullWidth ? "w-full" : "min-w-[420px]"}
    `}>
      {/* ... */}
      <div className="flex items-center justify-between">
        <span className="text-[#0F4C3A]/70 text-3xl font-semibold">Encomendado:</span>
        <span className="text-[#0F4C3A] text-4xl font-extrabold">{encomendado}</span>
      </div>
      {/* ... */}
    </div>
  );
}
```

### ✅ Depois - EstoqueCard.jsx (Simplificado)
```jsx
export function EstoqueCard({ titulo, icone, estoque, fullWidth = false }) {
  return (
    <div className={`
      bg-white border-2 border-[#0F4C3A]/10 rounded-2xl p-10 flex-shrink-0
      ${fullWidth ? "w-full" : "min-w-[420px]"}
    `}>
      <div className="flex items-center gap-5 mb-10">
        <img src={icone} alt={titulo} className="w-11 h-11" />
        <span className="text-[#0F4C3A] text-3xl font-bold">{titulo}</span>
      </div>

      <div className="space-y-8">
        <div className="flex items-center justify-between">
          <span className="text-[#0F4C3A]/70 text-3xl font-semibold">Estoque:</span>
          <span className="text-[#0F4C3A] text-4xl font-extrabold">{estoque}</span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-[#0F4C3A]/70 text-3xl font-semibold">Disponíveis:</span>
          <span className="text-[#0F4C3A] text-4xl font-extrabold">{estoque}</span>
        </div>
      </div>
    </div>
  );
}
```

---

## 4. Corrigir ButtonExpediente.jsx - Remover Comentário

### ❌ Antes
```jsx
<button 
  onClick={onStart} // 🔥 AQUI
  className="w-full bg-[#0F4C3A] hover:bg-[#0a3528] active:scale-[0.98] transition-all 
             rounded-[20px] py-20 flex items-center justify-center gap-20 shadow-lg group mt-20"
>
```

### ✅ Depois
```jsx
<button 
  onClick={onStart}
  className="w-full bg-[#0F4C3A] hover:bg-[#0a3528] active:scale-[0.98] transition-all 
             rounded-[20px] py-20 flex items-center justify-center gap-20 shadow-lg group mt-20"
>
```

---

## 5. Corrigir Icon Name Mismatch - Encomenda.jsx

### ❌ Antes
```jsx
import encomendaIcon from "../assets/icons/frango.svg";  // ❌ Nome não corresponde

// Depois usa:
<img src={encomendaIcon} alt="Encomenda" className="w-10 h-10" />
```

### ✅ Depois (Opção A - Verificar se existe ícone)
```jsx
// Se existir arquivo encomenda.svg:
import encomendaIcon from "../assets/icons/encomenda.svg";
```

### ✅ Depois (Opção B - Usar ícone correto)
```jsx
// Se não existir, usar um dos ícones existentes:
import plusIcon from "../assets/icons/plus.svg";

// E usar em outro lugar ou renomear variável:
<img src={plusIcon} alt="Encomenda" className="w-10 h-10" />
```

---

## 6. Exemplo: Script para Remover Comentários em Lote

Se preferir automatizar a remoção de comentários estruturais com regex:

**remover_comentarios.js** (Node.js script)
```javascript
const fs = require('fs');
const path = require('path');

const screenFiles = [
  'src/screens/Dashboard.jsx',
  'src/screens/Venda.jsx',
  'src/screens/Encomenda.jsx',
  'src/screens/Home.jsx'
];

const pattern = /\s*{\/\*\s*[^*]+\*\/}\s*/g;

screenFiles.forEach(file => {
  const filePath = path.join(__dirname, file);
  const content = fs.readFileSync(filePath, 'utf8');
  const cleaned = content.replace(pattern, '\n');
  fs.writeFileSync(filePath, cleaned);
  console.log(`✅ Cleaned: ${file}`);
});

console.log('✅ Todos os comentários foram removidos!');
```

**Para executar:**
```bash
node remover_comentarios.js
```

---

## 7. Refatorar Screens com Muitos Comentários

Se a estrutura é complexa, considere extrair em componentes:

### ❌ Antes (Venda.jsx muito longo)
```jsx
export default function Venda() {
  // 100+ linhas com múltiplas seções comentadas
  return (
    <div>
      {/* Título */}
      {/* Filtros */}
      {/* Frangos */}
      {/* Maioneses */}
      {/* Costela */}
      {/* Botão */}
    </div>
  );
}
```

### ✅ Depois (Componentes separados)
```jsx
// src/screens/Venda.jsx
import { VendaTitulo } from '../components/Venda/VendaTitulo';
import { VendaProdutos } from '../components/Venda/VendaProdutos';
import { VendaBotao } from '../components/Venda/VendaBotao';

export default function Venda() {
  // Lógica e estado aqui
  
  return (
    <div className="max-w-[1400px] mx-auto px-12 py-16">
      <VendaTitulo />
      <VendaProdutos {...props} />
      <VendaBotao onClick={handleSubmit} />
    </div>
  );
}
```

---

## ⏱️ Tempo de Correção Estimado

| Tarefa | Tempo |
|--------|-------|
| Remover comentários (4 files) | 5 min |
| Refatorar Headers | 20 min |
| Corrigir EstoqueCard | 5 min |
| Corrigir ButtonExpediente | 2 min |
| Corrigir icon em Encomenda | 5 min |
| Testar tudo | 15 min |
| **TOTAL** | **52 min** |

---

**Gerado:** 7 de maio de 2026
