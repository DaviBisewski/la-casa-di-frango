import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useExpediente } from "../hooks/useExpediente";
import { EstoqueCarrossel } from "../components/Layout/EstoqueCarrocel";
import { EstoqueCard } from "../components/Cards/EstoqueCard";
import { EstoqueFiltros } from "../components/Layout/EstoqueFiltro";

import estoqueIcon from "../assets/icons/estoque.svg";
import ativoIcon from "../assets/icons/clock.svg";
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
    { titulo: "Frangos C/R", icone: frangoIcon,  estoque: estoque.frangosComRecheio },
    { titulo: "Frangos S/R", icone: frangoIcon,  estoque: estoque.frangosSemRecheio },
    { titulo: "Meio Frango", icone: frangoIcon,  estoque: estoque.meioFrango        },
  ];

  return (
    <div className="max-w-[1400px] mx-auto px-12 py-16">

      {/* Cabeçalho */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-4">
          <img src={estoqueIcon} alt="Estoque" className="w-10 h-10" />
          <h2 className="text-[#0F4C3A] text-4xl font-extrabold">Estoque</h2>
        </div>

        <span className="flex items-center gap-3 bg-[#0F4C3A] text-white
                         text-2xl font-semibold px-8 py-4 rounded-full">
          <img
            src={isAtivo ? ativoIcon : encerradoIcon}
            alt={isAtivo ? "Ativo" : "Encerrado"}
            className="w-6 h-6 brightness-0 invert"
          />
          {isAtivo ? "Ativo" : "Encerrado"}
        </span>
      </div>

      {/* Filtros — só domingo */}
      {isSunday && (
        <EstoqueFiltros
          filtros={FILTROS}
          filtroAtivo={filtroAtivo}
          onChange={setFiltroAtivo}
        />
      )}

      {/* Frangos */}
      {(!isSunday || filtroAtivo === "frangos") && (
        <>
          <h3 className="text-[#0F4C3A] text-3xl font-bold mb-8">Frangos</h3>
          <EstoqueCarrossel items={itemsFrangos} />
        </>
      )}

      {/* Maioneses */}
      {isSunday && filtroAtivo === "maioneses" && (
        <>
          <h3 className="text-[#0F4C3A] text-3xl font-bold mb-8">Maioneses</h3>
          <div className="grid grid-cols-2 gap-6">
            <EstoqueCard titulo="Maionese R$10,00" icone={maioneseIcon} estoque={estoque.maionese10} fullWidth />
            <EstoqueCard titulo="Maionese R$15,00" icone={maioneseIcon} estoque={estoque.maionese15} fullWidth />
          </div>
        </>
      )}

      {/* Costela */}
      {isSunday && filtroAtivo === "costela" && (
        <>
          <h3 className="text-[#0F4C3A] text-3xl font-bold mb-8">Costela</h3>
          <EstoqueCard titulo="Costela" icone={costelaIcon} estoque={estoque.costela} fullWidth />
        </>
      )}

    </div>
  );
}