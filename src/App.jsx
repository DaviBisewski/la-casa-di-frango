import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import { ToastProvider } from './contexts/ToastContext';
import { useBackupAutomatico } from './hooks/useBackupAutomatico';
import './App.css';

import Home from './screens/Home';
import StockEntry from './screens/StockEntry';
import Dashboard from './screens/Dashboard';
import Encomenda from './screens/Encomenda';
import Venda from './screens/Venda';
import ExpedienteHistorico from './screens/ExpedienteHistorico';
import Config from './screens/Config';
import Header from './components/Header/header';
import {HeaderMain}  from './components/Header/HeaderMain';



function LayoutHandler() {
  const location = useLocation();
  const isHome   = location.pathname === "/";

  useBackupAutomatico();

  return (
    <>
      {isHome ? <Header /> : <HeaderMain />}
      <Routes>
        <Route path="/"          element={<Home />} />
        <Route path="/estoque"   element={<StockEntry />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/encomenda" element={<Encomenda />} />
        <Route path="/venda"     element={<Venda />} />
        <Route path="/historico" element={<ExpedienteHistorico />} />
        <Route path="/config"    element={<Config />} />
      </Routes>
    </>
  );
}

function App() {
  return (
    <Router>
      <ToastProvider>
        <div className="App">
          <LayoutHandler />
        </div>
      </ToastProvider>
    </Router>
    
  );
}

export default App;