import { QuantidadeCounter } from '../Layout/QuantidadeCounter';

export function ProdutoLinha({ icone, titulo, quantidade, onChange, max }) {
  return (
    <div className="flex items-center justify-between py-5 sm:py-7 md:py-10
                    gap-4 md:gap-6
                    border-b border-[#0F4C3A]/10 last:border-0">
      <div className="flex items-center gap-3 sm:gap-4 md:gap-6 min-w-0">
        <img
          src={icone}
          alt={titulo}
          className="w-10 h-10 sm:w-12 sm:h-12 md:w-16 md:h-16 flex-shrink-0"
        />

        <span className="text-[#0F4C3A]
                         text-xl sm:text-2xl md:text-4xl
                         font-bold truncate">
          {titulo}
        </span>
      </div>

      <div className="flex-shrink-0">
        <QuantidadeCounter
          value={quantidade}
          onChange={onChange}
          max={max}
        />
      </div>
    </div>
  );
}