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

  return (
    <div className="max-w-[1400px] mx-auto px-12 py-16">

      {/* Cabeçalho com status */}
      <div className="flex items-center justify-between mb-12">
        <div className="flex items-center gap-5">
          <img src={estoqueIcon} alt="Estoque" className="w-14 h-14" />
          <h2 className="text-[#0F4C3A] text-5xl font-extrabold">Estoque</h2>
        </div>

        <span className="flex items-center gap-4 bg-[#0F4C3A] text-white
                         text-2xl font-semibold px-10 py-5 rounded-full">
          <img
            src={encerradoIcon}
            alt="Encerrado"
            className="w-8 h-8 brightness-0 invert"
          />
          Encerrado
        </span>
      </div>

      {/* Carrossel de frangos */}
      <EstoqueCarrossel items={itemsFrangos} expediente={expediente} />

      {/* Cards de domingo se aplicável */}
      {isSunday && (
        <div className="mt-10 space-y-6">
          <div className="grid grid-cols-2 gap-6">
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

      {/* Lista de encomendas — mostra todas para visualização do histórico */}
      {(expediente.pedidos || []).length > 0 && (
        <ListaEncomendas
          pedidos={expediente.pedidos}
          onRetirar={() => {}} // somente leitura no histórico
          somenteLeitura
        />
      )}

    </div>
  );
}