import { lazy, Suspense } from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import { ToastProvider } from './contexts/ToastContext';
import { ExpedienteProvider } from './contexts/ExpedienteContext';
import { useBackupAutomatico } from './hooks/useBackupAutomatico';
import './App.css';

// Home e Headers carregam imediatamente — são a tela inicial
import Home from './screens/Home';
import Header from './components/Header/Header';
import { HeaderMain } from './components/Header/HeaderMain';

/**
 * Screens secundárias carregadas sob demanda (lazy)
 * Reduz o bundle inicial — só baixa quando o usuário navegar para a tela
 */
const StockEntry          = lazy(() => import('./screens/StockEntry'));
const Dashboard           = lazy(() => import('./screens/Dashboard'));
const Encomenda           = lazy(() => import('./screens/Encomenda'));
const Venda               = lazy(() => import('./screens/Venda'));
const ExpedienteHistorico = lazy(() => import('./screens/ExpedienteHistorico'));
const Config              = lazy(() => import('./screens/Config'));

/**
 * Spinner exibido enquanto o chunk da screen está sendo baixado
 */
function LoadingScreen() {
  return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <div className="w-14 h-14 rounded-full border-4 border-[#0F4C3A]/20
                      border-t-[#0F4C3A] animate-spin" />
    </div>
  );
}

/**
 * Gerencia qual header renderizar e inicializa o backup automático
 * Separado do App para ter acesso ao useLocation dentro do Router
 */
function LayoutHandler() {
  const location = useLocation();
  const isHome   = location.pathname === "/";

  // Inicia backup a cada 5min e listener de sync online
  useBackupAutomatico();

  return (
    <>
      {isHome ? <Header /> : <HeaderMain />}

      <Suspense fallback={<LoadingScreen />}>
        <Routes>
          <Route path="/"          element={<Home />} />
          <Route path="/estoque"   element={<StockEntry />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/encomenda" element={<Encomenda />} />
          <Route path="/venda"     element={<Venda />} />
          <Route path="/historico" element={<ExpedienteHistorico />} />
          <Route path="/config"    element={<Config />} />
        </Routes>
      </Suspense>
    </>
  );
}

/**
 * Raiz da aplicação
 *
 * Ordem dos providers:
 * Router → ToastProvider → ExpedienteProvider → LayoutHandler
 *
 * ExpedienteProvider envolve tudo para que o estado do expediente
 * seja único e compartilhado entre todas as telas — resolve o bug
 * de Dashboard abrir com expediente antigo após criar novo
 */
function App() {
  return (
    <Router>
      <ToastProvider>
        <ExpedienteProvider>
          <div className="App">
            <LayoutHandler />
          </div>
        </ExpedienteProvider>
      </ToastProvider>
    </Router>
  );
}

export default App;