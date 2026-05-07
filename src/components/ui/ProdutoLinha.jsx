import { QuantidadeCounter } from '../Layout/QuantidadeCounter';

export function ProdutoLinha({ icone, titulo, quantidade, onChange, max }) {
  return (
    <div className="flex items-center justify-between py-10
                    border-b border-[#0F4C3A]/10 last:border-0">
      <div className="flex items-center gap-6">
        <img src={icone} alt={titulo} className="w-16 h-16" />
        <span className="text-[#0F4C3A] text-4xl font-bold">{titulo}</span>
      </div>
      <QuantidadeCounter value={quantidade} onChange={onChange} max={max} />
    </div>
  );
}