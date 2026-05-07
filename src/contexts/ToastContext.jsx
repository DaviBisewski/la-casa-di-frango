import { createContext, useContext, useState, useCallback, useEffect, useRef } from "react";

const ToastContext = createContext(null);

const CONFIG = {
  sucesso: {
    bg: "bg-[#0F4C3A]",
    barra: "bg-[#D4F1E6]",
    texto: "text-white",
    subtexto: "text-white/70",
    icone: (
      <svg viewBox="0 0 24 24" fill="none" className="w-14 h-14 flex-shrink-0">
        <circle cx="12" cy="12" r="11" stroke="white" strokeWidth="2" />
        <path d="M7 12.5l3.5 3.5 6.5-7" stroke="white" strokeWidth="2.5"
              strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
  },
  erro: {
    bg: "bg-red-700",
    barra: "bg-red-300",
    texto: "text-white",
    subtexto: "text-white/70",
    icone: (
      <svg viewBox="0 0 24 24" fill="none" className="w-14 h-14 flex-shrink-0">
        <circle cx="12" cy="12" r="11" stroke="white" strokeWidth="2" />
        <path d="M8 8l8 8M16 8l-8 8" stroke="white" strokeWidth="2.5"
              strokeLinecap="round" />
      </svg>
    ),
  },
  aviso: {
    bg: "bg-amber-600",
    barra: "bg-amber-200",
    texto: "text-white",
    subtexto: "text-white/70",
    icone: (
      <svg viewBox="0 0 24 24" fill="none" className="w-14 h-14 flex-shrink-0">
        <path d="M12 3L22 21H2L12 3z" stroke="white" strokeWidth="2"
              strokeLinejoin="round" />
        <path d="M12 10v5M12 17v1" stroke="white" strokeWidth="2.5"
              strokeLinecap="round" />
      </svg>
    ),
  },
  info: {
    bg: "bg-blue-700",
    barra: "bg-blue-200",
    texto: "text-white",
    subtexto: "text-white/70",
    icone: (
      <svg viewBox="0 0 24 24" fill="none" className="w-14 h-14 flex-shrink-0">
        <circle cx="12" cy="12" r="11" stroke="white" strokeWidth="2" />
        <path d="M12 11v6M12 8v1" stroke="white" strokeWidth="2.5"
              strokeLinecap="round" />
      </svg>
    ),
  },
};

function ToastItem({ mensagem, tipo, duracao, onFechar }) {
  const [progresso, setProgresso] = useState(100);
  const [saindo, setSaindo] = useState(false);
  const intervalRef = useRef(null);
  const config = CONFIG[tipo] || CONFIG.sucesso;

  useEffect(() => {
    const intervalo = 50;
    const decremento = (intervalo / duracao) * 100;

    intervalRef.current = setInterval(() => {
      setProgresso((prev) => {
        if (prev <= 0) {
          clearInterval(intervalRef.current);
          fechar();
          return 0;
        }
        return prev - decremento;
      });
    }, intervalo);

    return () => clearInterval(intervalRef.current);
  }, []);

  function fechar() {
    setSaindo(true);
    setTimeout(() => onFechar(), 400);
  }

  function pausar() {
    clearInterval(intervalRef.current);
  }

  function retomar() {
    const intervalo = 50;
    const decremento = (intervalo / duracao) * 100;
    intervalRef.current = setInterval(() => {
      setProgresso((prev) => {
        if (prev <= 0) {
          clearInterval(intervalRef.current);
          fechar();
          return 0;
        }
        return prev - decremento;
      });
    }, intervalo);
  }

  return (
    <div
      onMouseEnter={pausar}
      onMouseLeave={retomar}
      onClick={fechar}
      style={{
        animation: saindo
          ? "slideUp 0.4s cubic-bezier(0.4,0,0.2,1) forwards"
          : "slideDown 0.4s cubic-bezier(0.4,0,0.2,1) forwards",
      }}
      className={`
        ${config.bg} cursor-pointer
        w-1/2 fixed top-0 right-0 z-50
        rounded-bl-3xl overflow-hidden shadow-2xl
      `}
    >
      {/* Conteúdo */}
      <div className="flex items-center gap-8 px-12 py-8">
        {config.icone}
        <div className="flex flex-col gap-1">
          <p className={`${config.texto} text-4xl font-extrabold leading-tight`}>
            {mensagem}
          </p>
          <p className={`${config.subtexto} text-xl`}>
            Toque para fechar
          </p>
        </div>
      </div>

      {/* Barra de progresso */}
      <div className="w-full h-2 bg-white/10">
        <div
          className={`${config.barra} h-full transition-none`}
          style={{ width: `${progresso}%` }}
        />
      </div>
    </div>
  );
}

export function ToastProvider({ children }) {
  const [toast, setToast] = useState(null);

  const mostrar = useCallback((mensagem, tipo = "sucesso", duracao = 3000) => {
    setToast({ mensagem, tipo, duracao, id: Date.now() });
  }, []);

  return (
    <ToastContext.Provider value={{ mostrar }}>
      {children}

      {toast && (
        <ToastItem
          key={toast.id}
          mensagem={toast.mensagem}
          tipo={toast.tipo}
          duracao={toast.duracao}
          onFechar={() => setToast(null)}
        />
      )}

      <style>{`
        @keyframes slideDown {
          from { transform: translateY(-100%); opacity: 0; }
          to   { transform: translateY(0);     opacity: 1; }
        }
        @keyframes slideUp {
          from { transform: translateY(0);     opacity: 1; }
          to   { transform: translateY(-100%); opacity: 0; }
        }
      `}</style>
    </ToastContext.Provider>
  );
}

export function useToast() {
  return useContext(ToastContext);
}