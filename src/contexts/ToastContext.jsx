import React, { createContext, useContext, useState, useCallback } from 'react';

const ToastContext = createContext();

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const mostrar = useCallback((mensagem, tipo = 'info') => {
    const id = Date.now();
    const novoToast = { id, mensagem, tipo };
    
    setToasts(prev => [...prev, novoToast]);

    // Remove o toast após 4 segundos
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 4000);
  }, []);

  const remover = useCallback((id) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  }, []);

  return (
    <ToastContext.Provider value={{ mostrar, remover }}>
      {children}
      <ToastContainer toasts={toasts} onRemove={remover} />
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast deve ser usado dentro de ToastProvider');
  }
  return context;
}

function ToastContainer({ toasts, onRemove }) {
  const getColorClasses = (tipo) => {
    switch (tipo) {
      case 'success':
        return 'bg-green-500';
      case 'error':
        return 'bg-red-500';
      case 'warning':
        return 'bg-yellow-500';
      case 'info':
      default:
        return 'bg-blue-500';
    }
  };

  return (
    <div className="fixed top-4 right-4 space-y-2 z-50 pointer-events-none">
      {toasts.map(toast => (
        <div
          key={toast.id}
          className={`${getColorClasses(toast.tipo)} text-white px-4 py-3 rounded-lg shadow-lg pointer-events-auto cursor-pointer transition-all duration-300`}
          onClick={() => onRemove(toast.id)}
        >
          {toast.mensagem}
        </div>
      ))}
    </div>
  );
}
