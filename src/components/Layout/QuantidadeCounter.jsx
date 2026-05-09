import { useCallback } from "react";

/**
 * Contador de quantidade com botões + e - 
 * Clampa valor entre 0 e max
 * 
 * @param {number} value - Valor atual
 * @param {Function} onChange - Callback quando valor muda
 * @param {number} max - Valor máximo permitido
 */
export function QuantidadeCounter({ value, onChange, max }) {
  // useCallback para evitar recriação de funções a cada render
  // Se onChange vier de componente pai estável, evita re-renders desnecessários
  const handleDecrementar = useCallback(() => {
    onChange(Math.max(0, value - 1));
  }, [value, onChange]);

  const handleIncrementar = useCallback(() => {
    onChange(Math.min(max, value + 1));
  }, [value, onChange, max]);

  return (
    <div className="flex items-center bg-[#0F4C3A] rounded-full overflow-hidden h-12 sm:h-20">
      <button
        onClick={handleDecrementar}
        className="px-4 sm:px-8 h-full text-white text-2xl sm:text-4xl font-light
                   hover:bg-[#0a3528] transition-colors active:scale-95 flex items-center"
      >
        −
      </button>

      <div className="w-10 h-10 sm:w-16 sm:h-16 rounded-full bg-[#D4F1E6] flex items-center justify-center mx-1 flex-shrink-0">
        <span className="text-[#0F4C3A] text-lg sm:text-3xl font-bold">
          {value}
        </span>
      </div>

      <button
        onClick={handleIncrementar}
        className="px-4 sm:px-8 h-full text-white text-2xl sm:text-4xl font-light
                   hover:bg-[#0a3528] transition-colors active:scale-95 flex items-center"
      >
        +
      </button>
    </div>
  );
}