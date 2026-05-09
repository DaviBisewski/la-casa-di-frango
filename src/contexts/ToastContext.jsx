import React, {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
  useRef,
} from "react";

const ToastContext = createContext();

/* ========================= ÍCONES ========================= */

function getIcon(tipo) {
  switch (tipo) {
    case "sucesso":
    case "success":
      return (
        <svg viewBox="0 0 24 24" fill="none" className="w-full h-full">
          <circle
            cx="12"
            cy="12"
            r="11"
            stroke="currentColor"
            strokeWidth="2"
          />
          <path
            d="M7 12.5l3.5 3.5 6.5-7"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      );

    case "erro":
    case "error":
      return (
        <svg viewBox="0 0 24 24" fill="none" className="w-full h-full">
          <circle
            cx="12"
            cy="12"
            r="11"
            stroke="currentColor"
            strokeWidth="2"
          />
          <path
            d="M8 8l8 8M16 8l-8 8"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
          />
        </svg>
      );

    case "aviso":
    case "warning":
      return (
        <svg viewBox="0 0 24 24" fill="none" className="w-full h-full">
          <path
            d="M12 3L22 21H2L12 3z"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinejoin="round"
          />
          <path
            d="M12 10v5M12 17.5v.5"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
          />
        </svg>
      );

    default:
      return (
        <svg viewBox="0 0 24 24" fill="none" className="w-full h-full">
          <circle
            cx="12"
            cy="12"
            r="11"
            stroke="currentColor"
            strokeWidth="2"
          />
          <path
            d="M12 11v6M12 8v.5"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
          />
        </svg>
      );
  }
}

/* ========================= ESTILOS ========================= */

function getEstilo(tipo) {
  switch (tipo) {
    case "sucesso":
    case "success":
      return {
        container: "bg-white border-l-4 sm:border-l-8 border-[#0F4C3A]",
        icone: "text-[#0F4C3A]",
        titulo: "text-[#0F4C3A]",
        barra: "bg-[#0F4C3A]",
        fechar: "text-[#0F4C3A]/50 hover:text-[#0F4C3A]",
      };

    case "erro":
    case "error":
      return {
        container: "bg-white border-l-4 sm:border-l-8 border-red-600",
        icone: "text-red-600",
        titulo: "text-red-700",
        barra: "bg-red-600",
        fechar: "text-red-400 hover:text-red-600",
      };

    case "aviso":
    case "warning":
      return {
        container: "bg-white border-l-4 sm:border-l-8 border-amber-500",
        icone: "text-amber-500",
        titulo: "text-amber-700",
        barra: "bg-amber-500",
        fechar: "text-amber-400 hover:text-amber-600",
      };

    default:
      return {
        container: "bg-white border-l-4 sm:border-l-8 border-blue-500",
        icone: "text-blue-500",
        titulo: "text-blue-700",
        barra: "bg-blue-500",
        fechar: "text-blue-400 hover:text-blue-600",
      };
  }
}

const DURACAO_MS = 4000;

/* ========================= TOAST ITEM ========================= */

function ToastItem({ toast, onRemover }) {
  const [progresso, setProgresso] = useState(100);
  const [saindo, setSaindo] = useState(false);

  const intervalRef = useRef(null);

  const estilo = getEstilo(toast.tipo);

  function fechar() {
    setSaindo(true);

    setTimeout(() => {
      onRemover(toast.id);
    }, 350);
  }

  function iniciarProgresso() {
    const intervalo = 50;
    const decremento = (intervalo / DURACAO_MS) * 100;

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

  function pausar() {
    clearInterval(intervalRef.current);
  }

  function retomar() {
    iniciarProgresso();
  }

  useEffect(() => {
    iniciarProgresso();

    return () => clearInterval(intervalRef.current);
  }, []);

  return (
    <div
      onMouseEnter={pausar}
      onMouseLeave={retomar}
      style={{
        animation: saindo
          ? "toastSair 0.35s cubic-bezier(0.4,0,0.2,1) forwards"
          : "toastEntrar 0.4s cubic-bezier(0.34,1.56,0.64,1) forwards",
      }}
      className={`
        ${estilo.container}
        w-full overflow-hidden shadow-2xl
        rounded-2xl sm:rounded-none
      `}
    >
      {/* CONTEÚDO */}
      <div
        className="
          flex items-start sm:items-center justify-between
          gap-3 sm:gap-6
          px-4 py-4
          sm:px-8 sm:py-6
          lg:px-10 lg:py-8
        "
      >
        {/* ÍCONE + TEXTO */}
        <div className="flex items-start sm:items-center gap-3 sm:gap-5 flex-1 min-w-0">
          <div
            className={`
              ${estilo.icone}
              flex-shrink-0
              w-6 h-6
              sm:w-8 sm:h-8
              lg:w-10 lg:h-10
            `}
          >
            {getIcon(toast.tipo)}
          </div>

          <p
            className={`
              ${estilo.titulo}
              text-sm sm:text-xl lg:text-3xl
              font-bold leading-snug
              break-words
            `}
          >
            {toast.mensagem}
          </p>
        </div>

        {/* BOTÃO FECHAR */}
        <button
          onClick={fechar}
          className={`
            ${estilo.fechar}
            flex-shrink-0
            p-1.5 sm:p-2 lg:p-3
            rounded-full
            hover:bg-black/5
            transition-all duration-200
            active:scale-90
          `}
          aria-label="Fechar"
        >
          <svg
            viewBox="0 0 24 24"
            fill="none"
            className="w-4 h-4 sm:w-5 sm:h-5 lg:w-7 lg:h-7"
          >
            <path
              d="M6 18L18 6M6 6l12 12"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
            />
          </svg>
        </button>
      </div>

      {/* BARRA PROGRESSO */}
      <div className="w-full h-1 sm:h-1.5 bg-black/5">
        <div
          className={`${estilo.barra} h-full transition-none`}
          style={{ width: `${progresso}%` }}
        />
      </div>
    </div>
  );
}

/* ========================= CONTAINER ========================= */

function ToastContainer({ toasts, onRemover }) {
  return (
    <div
      className="
        fixed top-3 sm:top-0 left-0 right-0
        z-50 pointer-events-none
        px-3 sm:px-0
      "
    >
      <div className="pointer-events-auto flex flex-col gap-2 sm:gap-0">
        {toasts.map((toast) => (
          <ToastItem
            key={toast.id}
            toast={toast}
            onRemover={onRemover}
          />
        ))}
      </div>

      <style>{`
        @keyframes toastEntrar {
          from {
            opacity: 0;
            transform: translateY(-100%);
          }

          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes toastSair {
          from {
            opacity: 1;
            transform: translateY(0);
          }

          to {
            opacity: 0;
            transform: translateY(-100%);
          }
        }
      `}</style>
    </div>
  );
}

/* ========================= PROVIDER ========================= */

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const mostrar = useCallback((mensagem, tipo = "info") => {
    const id = Date.now();

    setToasts((prev) => [
      ...prev,
      {
        id,
        mensagem,
        tipo,
      },
    ]);
  }, []);

  const remover = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  return (
    <ToastContext.Provider value={{ mostrar, remover }}>
      {children}

      <ToastContainer
        toasts={toasts}
        onRemover={remover}
      />
    </ToastContext.Provider>
  );
}

/* ========================= HOOK ========================= */

export function useToast() {
  const context = useContext(ToastContext);

  if (!context) {
    throw new Error(
      "useToast deve ser usado dentro de ToastProvider"
    );
  }

  return context;
}