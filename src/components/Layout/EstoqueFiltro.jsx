import { useCallback } from 'react';

/**
 * Filtros de estoque com botões interativos
 * @param {Array} filtros - Array de filtros com { key, label, icone }
 * @param {string} filtroAtivo - Filtro selecionado
 * @param {Function} onChange - Callback ao mudar filtro
 */
export function EstoqueFiltros({ filtros, filtroAtivo, onChange }) {
  // useCallback para evitar recriação de handler a cada render
  const handleFiltroClick = useCallback((chave) => {
    onChange(chave);
  }, [onChange]);

  return (
    <div className="flex gap-3 sm:gap-4 mb-6 sm:mb-10 overflow-x-auto no-scrollbar pb-2">
      {filtros.map((f) => (
        <button
          key={f.key}
          onClick={() => handleFiltroClick(f.key)}
          className={`
            flex items-center gap-2 sm:gap-3
            px-4 sm:px-8 py-3 sm:py-4
            rounded-full text-sm sm:text-2xl font-semibold
            border-2 transition-all whitespace-nowrap flex-shrink-0
            ${filtroAtivo === f.key
              ? "bg-[#0F4C3A] text-white border-[#0F4C3A]"
              : "bg-white text-[#0F4C3A] border-[#0F4C3A]/20 hover:border-[#0F4C3A]/50"
            }
          `}
        >
          <img
            src={f.icone}
            alt={f.label}
            className={`w-4 h-4 sm:w-7 sm:h-7 ${filtroAtivo === f.key ? "brightness-0 invert" : ""}`}
          />
          {f.label}
        </button>
      ))}
    </div>
  );
}