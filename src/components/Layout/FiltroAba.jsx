import { useCallback } from 'react';
import pendenteIcon from '../../assets/icons/pendente.svg';
import retiradoIcon from '../../assets/icons/retirado.svg';

const ABAS = [
  { key: "pendentes", label: "Pendentes", icone: pendenteIcon },
  { key: "retirados", label: "Retirados", icone: retiradoIcon },
];

/**
 * Abas de filtro com animação suave ao trocar
 * Sem linha de fundo — só a borda inferior verde na aba ativa
 */
export function FiltroAba({ abaAtiva, onChange }) {
  // useCallback para evitar recriação de handler a cada render
  const handleAbaClick = useCallback((chave) => {
    onChange(chave);
  }, [onChange]);

  return (
    <div className="flex items-center justify-center gap-6 sm:gap-20 mb-10 sm:mb-20">
      {ABAS.map((aba) => (
        <button
          key={aba.key}
          onClick={() => handleAbaClick(aba.key)}
          className={`
            flex items-center gap-2 sm:gap-5 pb-3 sm:pb-4 transition-all duration-300
            ${abaAtiva === aba.key
              ? "text-[#0F4C3A] border-b-4 border-[#0F4C3A] "
              : "text-[#0F4C3A]/35 border-b-4 border-transparent"
            }
          `}
        >
          <img
            src={aba.icone}
            alt={aba.label}
            className={`transition-all duration-300 ${
              abaAtiva === aba.key
                ? "w-6 h-6 sm:w-12 sm:h-12 opacity-100"
                : "w-5 h-5 sm:w-10 sm:h-10 opacity-35"
            }`}
          />
          <span className={`font-extrabold transition-all duration-300 ${
            abaAtiva === aba.key
              ? "text-lg sm:text-4xl"
              : "text-base sm:text-3xl"
          }`}>
            {aba.label}
          </span>
        </button>
      ))}
    </div>
  );
}