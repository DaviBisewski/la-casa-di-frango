export function EstoqueCard({ titulo, icone, estoque, encomendado = 0, fullWidth = false }) {
  const disponivel = estoque - encomendado;

  return (
    <div className={`
      bg-white border-2 border-[#0F4C3A]/10 rounded-2xl p-8 flex-shrink-0
      ${fullWidth ? "w-full" : "min-w-[340px]"}
    `}>
      <div className="flex items-center gap-3 mb-8">
        <img src={icone} alt={titulo} className="w-8 h-8" />
        <span className="text-[#0F4C3A] text-2xl font-bold">{titulo}</span>
      </div>

      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <span className="text-[#0F4C3A]/70 text-2xl">Estoque:</span>
          <span className="text-[#0F4C3A] text-2xl font-extrabold">{estoque}</span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-[#0F4C3A]/70 text-2xl">Encomendado:</span>
          <span className="text-[#0F4C3A] text-2xl font-extrabold">{encomendado}</span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-[#0F4C3A]/70 text-2xl">Disponíveis:</span>
          <span className="text-[#0F4C3A] text-2xl font-extrabold">{disponivel}</span>
        </div>
      </div>
    </div>
  );
}