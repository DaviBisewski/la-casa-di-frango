import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useExpediente } from "../hooks/useExpediente";
import { EstoqueCarrossel } from "../components/Layout/EstoqueCarrosel";
import { EstoqueCard } from "../components/Cards/EstoqueCard";
import { EstoqueFiltros } from "../components/Layout/EstoqueFiltro";
import { BotoesAcao } from "../components/ui/ButtonsAction";
import { ListaEncomendas } from "../components/Layout/ListaEncomendas";
import { BotaoEncerrar } from "../components/ui/BotaoEncerrar";

import estoqueIcon from "../assets/icons/estoque.svg";
import ativoIcon from "../assets/icons/statusActive.svg";
import encerradoIcon from "../assets/icons/encerrado.svg";
import frangoIcon from "../assets/icons/frango.svg";
import maioneseIcon from "../assets/icons/maionese.svg";
import costelaIcon from "../assets/icons/costela.svg";

const FILTROS = [
  { key: "frangos",   label: "Frangos",   icone: frangoIcon   },
  { key: "maioneses", label: "Maioneses", icone: maioneseIcon },
  { key: "costela",   label: "Costela",   icone: costelaIcon  },
];

export default function Dashboard() {
  const { expediente, marcarRetirado, encerrarExpediente } = useExpediente();
  const navigate = useNavigate();
  const [filtroAtivo, setFiltroAtivo] = useState("frangos");

  if (!expediente) {
    navigate("/");
    return null;
  }

  const { isSunday, status } = expediente;
  const isAtivo = status === "active";

  const itemsFrangos = [
    { titulo: "Frangos C/R", icone: frangoIcon, chave: "frangosComRecheio" },
    { titulo: "Frangos S/R", icone: frangoIcon, chave: "frangosSemRecheio" },
    { titulo: "Meio Frango", icone: frangoIcon, chave: "meioFrango"        },
  ];

  /** Encerra e volta para home */
  function handleEncerrar() {
    encerrarExpediente();
    navigate("/");
  }

/* ========================= DASHBOARD RESPONSIVO ========================= */

return (
  <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-12 py-6 sm:py-10 lg:py-16">

    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8 sm:mb-12 lg:mb-15">

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
                   text-white text-sm sm:text-xl lg:text-3xl font-semibold
                   px-5 sm:px-8 lg:px-13 py-3 sm:py-4 lg:py-5 rounded-full w-fit"
      >
        <img
          src={isAtivo ? ativoIcon : encerradoIcon}
          alt={isAtivo ? "Ativo" : "Encerrado"}
          className="w-4 h-4 sm:w-6 sm:h-6 lg:w-10 lg:h-10 brightness-0 invert"
        />

        {isAtivo ? "Ativo" : "Encerrado"}
      </span>
    </div>

    {isSunday && (
      <EstoqueFiltros
        filtros={FILTROS}
        filtroAtivo={filtroAtivo}
        onChange={setFiltroAtivo}
      />
    )}

    {(!isSunday || filtroAtivo === "frangos") && (
      <EstoqueCarrossel items={itemsFrangos} expediente={expediente} />
    )}

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

    {isSunday && filtroAtivo === "costela" && (
      <EstoqueCard
        titulo="Costela"
        icone={costelaIcon}
        expediente={expediente}
        chave="costela"
        fullWidth
      />
    )}

    {isAtivo && <BotoesAcao />}

    {(expediente.pedidos || []).length > 0 && (
      <ListaEncomendas
        pedidos={expediente.pedidos}
        onRetirar={marcarRetirado}
      />
    )}

    {isAtivo && (
      <BotaoEncerrar
        expediente={expediente}
        onEncerrar={handleEncerrar}
      />
    )}
  </div>
);
}