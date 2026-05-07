import { QuantidadeCounter } from '../Layout/QuantidadeCounter';

export function ProdutoLinha({ icone, titulo, quantidade, onChange, max }) {
  return (
    <div className="flex items-center justify-between py-6 
                    border-b border-[#0F4C3A]/10 last:border-0">
      <div className="flex items-center gap-4">
        <img src={icone} alt={titulo} className="w-10 h-10" />
        <span className="text-[#0F4C3A] text-2xl font-semibold">{titulo}</span>
      </div>
      <QuantidadeCounter value={quantidade} onChange={onChange} max={max} />
    </div>
  );
}