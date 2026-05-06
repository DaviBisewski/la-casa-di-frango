import { useNavigate } from "react-router-dom";
import { useExpediente } from "../hooks/useExpediente";
import frangoIcon from "../assets/icons/frango.svg";
import estoqueIcon from "../assets/icons/estoque.svg";
import ativoIcon from "../assets/icons/statusActive.svg";
import encerradoIcon from "../assets/icons/encerrado.svg";

function EstoqueCard({ titulo, estoque, encomendado = 0 }) {
  const disponivel = estoque - encomendado;

  return (
    <div className="min-w-[340px] bg-white border-2 border-[#0F4C3A]/10 rounded-2xl p-8 flex-shrink-0">
      <div className="flex items-center gap-3 mb-8">
        <img src={frangoIcon} alt="Frango" className="w-8 h-8" />
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

export default function Dashboard() {
  const { expediente } = useExpediente();
  const navigate = useNavigate();

  if (!expediente) {
    navigate("/");
    return null;
  }

  const estoque = expediente.estoque;
  const isAtivo = expediente.status === "active";

  return (
    <div className="max-w-[1400px] mx-auto px-12 py-16">

      {/* Cabeçalho: Estoque + badge status */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-4">
          <img src={estoqueIcon} alt="Estoque" className="w-10 h-10" />
          <h2 className="text-[#0F4C3A] text-4xl font-extrabold">Estoque</h2>
        </div>

        {isAtivo ? (
          <span className="flex items-center gap-3 bg-[#D4F1E6] text-[#0F4C3A]
                           text-2xl font-semibold px-8 py-4 rounded-full">
            <img src={ativoIcon} alt="Ativo" className="w-6 h-6" />
            Ativo
          </span>
        ) : (
          <span className="flex items-center gap-3 bg-[#0F4C3A] text-white
                           text-2xl font-semibold px-8 py-4 rounded-full">
            <img src={encerradoIcon} alt="Encerrado" className="w-6 h-6 brightness-0 invert" />
            Encerrado
          </span>
        )}
      </div>

      {/* Subtítulo */}
      <h3 className="text-[#0F4C3A] text-3xl font-bold mb-8">Frangos</h3>

      {/* Carrossel */}
      <div className="flex gap-6 overflow-x-auto pb-6 snap-x snap-mandatory scroll-smooth
                      scrollbar-hide -mx-12 px-12">
        <div className="snap-start">
          <EstoqueCard titulo="Frangos C/R" estoque={estoque.frangosComRecheio} />
        </div>
        <div className="snap-start">
          <EstoqueCard titulo="Frangos S/R" estoque={estoque.frangosSemRecheio} />
        </div>
        <div className="snap-start">
          <EstoqueCard titulo="Meio Frango" estoque={estoque.meioFrango} />
        </div>

        {expediente.isSunday && (
          <>
            <div className="snap-start">
              <EstoqueCard titulo="Maionese P" estoque={estoque.maionese10} />
            </div>
            <div className="snap-start">
              <EstoqueCard titulo="Maionese G" estoque={estoque.maionese15} />
            </div>
            <div className="snap-start">
              <EstoqueCard titulo="Costela" estoque={estoque.costela} />
            </div>
          </>
        )}
      </div>

    </div>
  );
}