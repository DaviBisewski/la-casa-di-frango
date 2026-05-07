import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useExpediente } from "../hooks/useExpediente";
import { EstoqueCarrossel } from "../components/Layout/EstoqueCarrosel";
import { EstoqueCard } from "../components/Cards/EstoqueCard";
import { EstoqueFiltros } from "../components/Layout/EstoqueFiltro";
import { BotoesAcao } from "../components/ui/ButtonsAction";
import { ListaEncomendas } from "../components/Layout/ListaEncomendas";

import estoqueIcon from "../assets/icons/estoque.svg";
import ativoIcon from "../assets/icons/statusActive.svg";
import encerradoIcon from "../assets/icons/encerrado.svg";
import frangoIcon from "../assets/icons/frango.svg";
import maioneseIcon from "../assets/icons/maionese.svg";
import costelaIcon from "../assets/icons/costela.svg";

/** Filtros de categoria — só usados no domingo */
const FILTROS = [
  { key: "frangos",   label: "Frangos",   icone: frangoIcon   },
  { key: "maioneses", label: "Maioneses", icone: maioneseIcon },
  { key: "costela",   label: "Costela",   icone: costelaIcon  },
];

/**
 * Tela principal do expediente ativo
 * Exibe estoque em carrossel, botões de ação e lista de encomendas
 */
export default function Dashboard() {
  const { expediente, marcarRetirado } = useExpediente();
  const navigate = useNavigate();

  /** Filtro de categoria ativo (usado apenas no domingo) */
  const [filtroAtivo, setFiltroAtivo] = useState("frangos");

  /** Redireciona para home se não houver expediente carregado */
  if (!expediente) {
    navigate("/");
    return null;
  }

  const { isSunday, status } = expediente;
  const isAtivo = status === "active";

  /**
   * Itens do carrossel de frangos
   * Cada item passa sua chave para o EstoqueCard calcular dinamicamente
   */
  const itemsFrangos = [
    { titulo: "Frangos C/R", icone: frangoIcon, chave: "frangosComRecheio" },
    { titulo: "Frangos S/R", icone: frangoIcon, chave: "frangosSemRecheio" },
    { titulo: "Meio Frango", icone: frangoIcon, chave: "meioFrango"        },
  ];

  return (
    <div className="max-w-[1400px] mx-auto px-12 py-16">

      {/* Cabeçalho — título do estoque e badge de status */}
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

      {/* Filtros de categoria — só aparecem no domingo */}
      {isSunday && (
        <EstoqueFiltros
          filtros={FILTROS}
          filtroAtivo={filtroAtivo}
          onChange={setFiltroAtivo}
        />
      )}

      {/* Carrossel de frangos — aparece sempre, ou quando filtro = frangos */}
      {(!isSunday || filtroAtivo === "frangos") && (
        <EstoqueCarrossel items={itemsFrangos} expediente={expediente} />
      )}

      {/* Cards de maionese — só domingo com filtro maioneses */}
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

      {/* Card de costela — só domingo com filtro costela */}
      {isSunday && filtroAtivo === "costela" && (
        <EstoqueCard
          titulo="Costela"
          icone={costelaIcon}
          expediente={expediente}
          chave="costela"
          fullWidth
        />
      )}

      {/* Botões de ação — só aparecem quando o expediente está ativo */}
      {isAtivo && <BotoesAcao />}

      {/* Lista de encomendas — só aparece se houver pedidos registrados */}
      {(expediente.pedidos || []).length > 0 && (
        <ListaEncomendas
          pedidos={expediente.pedidos}
          onRetirar={marcarRetirado}
        />
      )}

    </div>
  );
}