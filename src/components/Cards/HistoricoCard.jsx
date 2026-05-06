import ativoIcon from '../../assets/icons/clock.svg';
import encerradoIcon from '../../assets/icons/encerrado.svg';

const DIAS_SEMANA = ["DOM", "SEG", "TER", "QUA", "QUI", "SEX", "SÁB"];

function formatarData(dateStr) {
  const [ano, mes, dia] = dateStr.split("-");
  const data = new Date(Number(ano), Number(mes) - 1, Number(dia));
  const diaSemana = DIAS_SEMANA[data.getDay()];
  return `${diaSemana} - ${dia}/${mes}/${String(ano).slice(2)}`;
}

export default function HistoricoCard({ expediente, onClick }) {
  const isAtivo = expediente.status === "active";
  const estoque = expediente.estoque;

  const totalFrangos =
    (estoque.frangosComRecheio || 0) + (estoque.frangosSemRecheio || 0);
  const totalVendidos = (expediente.vendas || []).length;

  return (
    <button
      onClick={onClick}
      className="w-full text-left border-2 border-[#0F4C3A]/15 rounded-2xl p-8
                 hover:border-[#0F4C3A]/40 hover:shadow-md active:scale-[0.99]
                 transition-all bg-white"
    >
      {/* Linha do topo: data + status */}
      <div className="flex items-center justify-between mb-6">
        <span className="text-[#0F4C3A] text-2xl font-bold uppercase">
          {formatarData(expediente.date)}
        </span>

        {isAtivo ? (
          <span className="flex items-center gap-2 bg-[#D4F1E6] text-[#0F4C3A]
                           text-xl font-semibold px-5 py-2 rounded-full">
            <img src={ativoIcon} alt="Ativo" className="w-5 h-5" />
            Ativo
          </span>
        ) : (
          <span className="flex items-center gap-2 bg-[#0F4C3A] text-white
                           text-xl font-semibold px-5 py-2 rounded-full">
            <img src={encerradoIcon} alt="Encerrado" className="w-5 h-5 brightness-0 invert" />
            Encerrado
          </span>
        )}
      </div>

      {/* Linhas de estoque */}
      <div className="space-y-3">
        <div className="flex items-center gap-4">
          <span className="text-[#0F4C3A]/70 text-2xl w-48">Frangos C/R</span>
          <span className="text-[#0F4C3A] text-2xl font-bold">{estoque.frangosComRecheio}</span>
          <span className="text-[#0F4C3A]/60 text-2xl">Frangos</span>
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <span className="text-[#0F4C3A]/70 text-2xl w-48">Frangos S/R</span>
            <span className="text-[#0F4C3A] text-2xl font-bold">{estoque.frangosSemRecheio}</span>
            <span className="text-[#0F4C3A]/60 text-2xl">Frangos</span>
          </div>
          <span className="text-[#0F4C3A] text-2xl font-bold">
            {totalVendidos}/{totalFrangos}
          </span>
        </div>
      </div>
    </button>
  );
}