import { useNavigate, useLocation } from "react-router-dom";
import { EstoqueCarrossel } from "../components/Layout/EstoqueCarrosel";
import { EstoqueCard } from "../components/Cards/EstoqueCard";
import { ListaEncomendas } from "../components/Layout/ListaEncomendas";

import estoqueIcon from "../assets/icons/estoque.svg";
import encerradoIcon from "../assets/icons/encerrado.svg";
import frangoIcon from "../assets/icons/frango.svg";
import maioneseIcon from "../assets/icons/maionese.svg";
import costelaIcon from "../assets/icons/costela.svg";

/**
 * Tela de visualização de expediente encerrado
 * Recebe o expediente via location.state ao navegar
 * Mostra estoque do dia e lista de encomendas (somente retiradas)
 */
export default function ExpedienteHistorico() {
  const navigate = useNavigate();
  const location = useLocation();

  /** Expediente passado via navigate("/historico", { state: { expediente } }) */
  const expediente = location.state?.expediente;

  if (!expediente) {
    navigate("/");
    return null;
  }

  const { estoque, isSunday, status } = expediente;
  const isAtivo = status === "active";

  const itemsFrangos = [
    { titulo: "Frangos C/R", icone: frangoIcon, chave: "frangosComRecheio" },
    { titulo: "Frangos S/R", icone: frangoIcon, chave: "frangosSemRecheio" },
    { titulo: "Meio Frango", icone: frangoIcon, chave: "meioFrango"        },
  ];

  /* ========================= HISTORICO RESPONSIVO ========================= */

return (
  <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-12 py-6 sm:py-10 lg:py-16">

    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8 sm:mb-12">

      <div className="flex items-center gap-3 sm:gap-5">
        <img
          src={estoqueIcon}
          alt="Estoque"
          className="w-8 h-8 sm:w-10 sm:h-10 lg:w-14 lg:h-14"
        />

        <h2 className="text-[#0F4C3A] text-2xl sm:text-4xl lg:text-5xl font-extrabold">
          Estoque
        </h2>
      </div>

      <span
        className="flex items-center justify-center gap-3 bg-[#0F4C3A]
                   text-white text-sm sm:text-lg lg:text-2xl font-semibold
                   px-5 sm:px-8 lg:px-10 py-3 sm:py-4 lg:py-5 rounded-full w-fit"
      >
        <img
          src={encerradoIcon}
          alt="Encerrado"
          className="w-4 h-4 sm:w-6 sm:h-6 lg:w-8 lg:h-8 brightness-0 invert"
        />

        Encerrado
      </span>
    </div>

    <EstoqueCarrossel items={itemsFrangos} expediente={expediente} />

    {isSunday && (
      <div className="mt-6 sm:mt-10 space-y-4 sm:space-y-6">

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
          <EstoqueCard
            titulo="Maionese R$10,00"
            icone={maioneseIcon}
            expediente={expediente}
            chave="maionese10"
            fullWidth
          />

          <EstoqueCard
            titulo="Maionese R$15,00"
            icone={maioneseIcon}
            expediente={expediente}
            chave="maionese15"
            fullWidth
          />
        </div>

        <EstoqueCard
          titulo="Costela"
          icone={costelaIcon}
          expediente={expediente}
          chave="costela"
          fullWidth
        />
      </div>
    )}

    {(expediente.pedidos || []).length > 0 && (
      <ListaEncomendas
        pedidos={expediente.pedidos}
        onRetirar={() => {}}
      />
    )}

  </div>
);
}