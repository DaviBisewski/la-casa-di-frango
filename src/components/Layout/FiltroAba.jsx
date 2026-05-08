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
  return (
    <div className="flex items-center justify-center gap-20 mb-20">
      {ABAS.map((aba) => (
        <button
          key={aba.key}
          onClick={() => onChange(aba.key)}
          className={`
            flex items-center gap-5 pb-4 transition-all duration-300
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
              abaAtiva === aba.key ? "w-12 h-12 opacity-100" : "w-10 h-10 opacity-35"
            }`}
          />
          <span className={`font-extrabold transition-all duration-300 ${
            abaAtiva === aba.key ? "text-4xl" : "text-3xl"
          }`}>
            {aba.label}
          </span>
        </button>
      ))}
    </div>
  );
}