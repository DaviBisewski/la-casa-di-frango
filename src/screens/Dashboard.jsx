import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useExpediente } from "../hooks/useExpediente";
import { EstoqueCarrossel } from "../components/Layout/EstoqueCarrosel";
import { EstoqueCard } from "../components/Cards/EstoqueCard";
import { EstoqueFiltros } from "../components/Layout/EstoqueFiltro";
import { BotoesAcao } from "../components/ui/ButtonsAction";

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
  const { expediente } = useExpediente();
  const navigate = useNavigate();
  const [filtroAtivo, setFiltroAtivo] = useState("frangos");

  if (!expediente) {
    navigate("/");
    return null;
  }

  const { estoque, isSunday, status } = expediente;
  const isAtivo = status === "active";

  const itemsFrangos = [
    {
      titulo: "Frangos C/R",
      icone: frangoIcon,
      chave: "frangosComRecheio",
    },
    {
      titulo: "Frangos S/R",
      icone: frangoIcon,
      chave: "frangosSemRecheio",
    },
    {
      titulo: "Meio Frango",
      icone: frangoIcon,
      chave: "meioFrango",
    },
  ];

  return (
    <div className="max-w-[1400px] mx-auto px-12 py-16">

      <div className="flex items-center justify-between mb-15">
        <div className="flex items-center gap-5">
          <img src={estoqueIcon} alt="Estoque" className="w-14 h-14" />
          <h2 className="text-[#0F4C3A] text-5xl font-extrabold">Estoque</h2>
        </div>

        <span className="flex items-center gap-6 bg-[#0F4C3A] text-white
                         text-3xl font-semibold px-13 py-5 rounded-full">
          <img
            src={isAtivo ? ativoIcon : encerradoIcon}
            alt={isAtivo ? "Ativo" : "Encerrado"}
            className="w-10 h-10 brightness-0 invert"
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

    </div>
  );
}