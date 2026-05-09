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
    <div className="flex gap-4 mb-10">
      {filtros.map((f) => (
        <button
          key={f.key}
          onClick={() => handleFiltroClick(f.key)}
          className={`
            flex items-center gap-3 px-8 py-4 rounded-full text-2xl font-semibold
            border-2 transition-all
            ${filtroAtivo === f.key
              ? "bg-[#0F4C3A] text-white border-[#0F4C3A]"
              : "bg-white text-[#0F4C3A] border-[#0F4C3A]/20 hover:border-[#0F4C3A]/50"
            }
          `}
        >
          <img
            src={f.icone}
            alt={f.label}
            className={`w-7 h-7 ${filtroAtivo === f.key ? "brightness-0 invert" : ""}`}
          />
          {f.label}
        </button>
      ))}
    </div>
  );
}