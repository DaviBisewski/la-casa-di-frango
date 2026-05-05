import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import './App.css';
import Home from './screens/Home';
import StockEntry from './screens/StockEntry';
import Header from './components/Header/Header';
import { HeaderMain } from './components/Header/HeaderMain'; // ← nome atualizado

function LayoutHandler() {
  const location = useLocation();
  const isHome = location.pathname === "/";

  return (
    <>
      {isHome ? <Header /> : <HeaderMain />}

      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/estoque" element={<StockEntry />} />
      </Routes>
    </>
  );
}

function App() {
  return (
    <Router>
      <div className="App">
        <LayoutHandler />
      </div>
    </Router>
  );
}

export default App;