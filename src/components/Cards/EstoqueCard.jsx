import { expedienteService } from "../../services/expedienteService";

export function EstoqueCard({ titulo, icone, expediente, chave, fullWidth = false }) {
  // Calcula todos os valores dinamicamente baseado no expediente
  const estoque = expediente?.estoque?.[chave] || 0;
  const encomendado = expedienteService.getTotalEncomendado(expediente, chave);
  const vendido = expedienteService.getTotalVendido(expediente, chave);
  const disponivel = expedienteService.getDisponivel(expediente, chave);

  return (
    <div className={`
      bg-white border-2 border-[#0F4C3A]/10 rounded-2xl p-5 sm:p-10 flex-shrink-0
      w-full sm:${fullWidth ? "w-full" : "min-w-[420px]"}
    `}>
      <div className="flex items-center gap-3 sm:gap-5 mb-6 sm:mb-10">
        <img src={icone} alt={titulo} className="w-7 h-7 sm:w-11 sm:h-11" />
        <span className="text-[#0F4C3A] text-xl sm:text-3xl font-bold">{titulo}</span>
      </div>

      <div className="space-y-5 sm:space-y-8">
        <div className="flex items-center justify-between gap-4">
          <span className="text-[#0F4C3A]/70 text-lg sm:text-3xl font-semibold">Estoque:</span>
          <span className="text-[#0F4C3A] text-2xl sm:text-4xl font-extrabold">{estoque}</span>
        </div>

        <div className="flex items-center justify-between gap-4">
          <span className="text-[#0F4C3A]/70 text-lg sm:text-3xl font-semibold">Encomendado:</span>
          <span className="text-[#0F4C3A] text-2xl sm:text-4xl font-extrabold">{encomendado}</span>
        </div>

        <div className="flex items-center justify-between gap-4">
          <span className="text-[#0F4C3A]/70 text-lg sm:text-3xl font-semibold">Vendido:</span>
          <span className="text-[#0F4C3A] text-2xl sm:text-4xl font-extrabold">{vendido}</span>
        </div>

        <div className="flex items-center justify-between gap-4">
          <span className="text-[#0F4C3A]/70 text-lg sm:text-3xl font-semibold">Disponíveis:</span>
          <span className={`text-2xl sm:text-4xl font-extrabold ${disponivel >= 0 ? "text-[#0F4C3A]" : "text-red-600"}`}>
            {disponivel}
          </span>
        </div>
      </div>
    </div>
  );
}