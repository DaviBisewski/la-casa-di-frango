import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { EstoqueCarrossel } from "../components/Layout/EstoqueCarrosel";
import { EstoqueCard } from "../components/Cards/EstoqueCard";
import { EstoqueFiltros } from "../components/Layout/EstoqueFiltro";
import { ListaEncomendas } from "../components/Layout/ListaEncomendas";

import { FILTROS_CATEGORIA } from "../constants/produtos";

import estoqueIcon from "../assets/icons/estoque.svg";
import encerradoIcon from "../assets/icons/encerrado.svg";
import frangoIcon from "../assets/icons/frango.svg";
import maioneseIcon from "../assets/icons/maionese.svg";
import costelaIcon from "../assets/icons/costela.svg";

/**
 * Tela de visualização de expediente encerrado
 * Recebe o expediente via location.state ao navegar
 * Mostra estoque do dia com filtro por categoria (igual ao Dashboard)
 * e lista de encomendas somente leitura
 */
export default function ExpedienteHistorico() {
  const navigate = useNavigate();
  const location = useLocation();

  const expediente = location.state?.expediente;

  /** Filtro de categoria — só usado no domingo, igual ao Dashboard */
  const [filtroAtivo, setFiltroAtivo] = useState("frangos");

  if (!expediente) {
    navigate("/");
    return null;
  }

  const { isSunday } = expediente;

  const itemsFrangos = [
    { titulo: "Frangos C/R", icone: frangoIcon, chave: "frangosComRecheio" },
    { titulo: "Frangos S/R", icone: frangoIcon, chave: "frangosSemRecheio" },
    { titulo: "Meio Frango", icone: frangoIcon, chave: "meioFrango"        },
  ];

  return (
    <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-12 py-6 sm:py-10 lg:py-16">

      {/* Cabeçalho — título + badge encerrado */}
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

        <span className="flex items-center justify-center gap-3 bg-[#0F4C3A]
                         text-white text-sm sm:text-lg lg:text-2xl font-semibold
                         px-5 sm:px-8 lg:px-10 py-3 sm:py-4 lg:py-5 rounded-full w-fit">
          <img
            src={encerradoIcon}
            alt="Encerrado"
            className="w-4 h-4 sm:w-6 sm:h-6 lg:w-8 lg:h-8 brightness-0 invert"
          />
          Encerrado
        </span>
      </div>

      {/* Filtros de categoria — só aparecem no domingo, igual ao Dashboard */}
      {isSunday && (
        <EstoqueFiltros
          filtros={FILTROS_CATEGORIA}
          filtroAtivo={filtroAtivo}
          onChange={setFiltroAtivo}
        />
      )}

      {/* Frangos — aparece sempre, ou quando filtro = frangos no domingo */}
      {(!isSunday || filtroAtivo === "frangos") && (
        <EstoqueCarrossel items={itemsFrangos} expediente={expediente} />
      )}

      {/* Maioneses — só domingo com filtro maioneses */}
      {isSunday && filtroAtivo === "maioneses" && (
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
      )}

      {/* Costela — só domingo com filtro costela */}
      {isSunday && filtroAtivo === "costela" && (
        <EstoqueCard
          titulo="Costela"
          icone={costelaIcon}
          expediente={expediente}
          chave="costela"
          fullWidth
        />
      )}

      {/* Lista de encomendas — somente leitura, sem botão de retirar */}
      {(expediente.pedidos || []).length > 0 && (
        <ListaEncomendas
          pedidos={expediente.pedidos}
          onRetirar={() => {}}
        />
      )}

    </div>
  );
}