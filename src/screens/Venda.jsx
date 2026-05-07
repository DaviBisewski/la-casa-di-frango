import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useExpediente } from "../hooks/useExpediente";
import { useToast } from "../contexts/ToastContext";
import { MENSAGENS } from "../services/toastService";
import { expedienteService } from "../services/expedienteService";
import { ProdutoLinha } from "../components/ui/ProdutoLinha";
import { EstoqueFiltros } from "../components/Layout/EstoqueFiltro";
import { ButtonConfirm } from "../components/ui/ButtonConfirm";

import frangoIcon from "../assets/icons/frango.svg";
import maioneseIcon from "../assets/icons/maionese.svg";
import costelaIcon from "../assets/icons/costela.svg";
import vendaIcon from "../assets/icons/venda.svg";

const FILTROS = [
  { key: "frangos",   label: "Frangos",   icone: frangoIcon   },
  { key: "maioneses", label: "Maioneses", icone: maioneseIcon },
  { key: "costela",   label: "Costela",   icone: costelaIcon  },
];

export default function Venda() {
  const { expediente, adicionarVenda } = useExpediente();
  const { mostrar } = useToast();
  const navigate = useNavigate();

  const [filtroAtivo, setFiltroAtivo] = useState("frangos");
  const [qtds, setQtds] = useState({
    frangosSemRecheio: 0,
    frangosComRecheio: 0,
    meioFrango: 0,
    maionese10: 0,
    maionese15: 0,
    costela: 0,
  });

  if (!expediente) return null;

  const { isSunday } = expediente;

  function disponivel(chave) {
    return expedienteService.getDisponivel(expediente, chave);
  }

  function setQtd(chave, valor) {
    setQtds((prev) => ({ ...prev, [chave]: valor }));
  }

  function handleSubmit() {
    const itens = Object.entries(qtds)
      .filter(([, quantidade]) => quantidade > 0)
      .map(([chave, quantidade]) => ({ chave, quantidade }));

    if (itens.length === 0) return;

    adicionarVenda({ itens });
    mostrar(MENSAGENS.VENDA_REGISTRADA, "sucesso");
    navigate("/dashboard");
  }

  return (
    <div className="max-w-[1400px] mx-auto px-12 py-16">

      {/* Título */}
      <div className="flex items-center gap-4 mb-4">
        <img src={vendaIcon} alt="Venda" className="w-12 h-12" />
        <h2 className="text-[#0F4C3A] text-5xl font-extrabold">
          Venda Rápida
        </h2>
      </div>

      <p className="text-[#0F4C3A]/60 text-3xl font-medium mb-16 capitalize">
        Hoje é {new Intl.DateTimeFormat('pt-BR', {
          weekday: 'long', day: 'numeric', month: 'long'
        }).format(new Date())}
      </p>

      {/* Filtros — só domingo */}
      {isSunday && (
        <div className="mb-8">
          <EstoqueFiltros
            filtros={FILTROS}
            filtroAtivo={filtroAtivo}
            onChange={setFiltroAtivo}
          />
        </div>
      )}

      {/* Frangos */}
      {(!isSunday || filtroAtivo === "frangos") && (
        <div className="mb-16">
          <ProdutoLinha
            icone={frangoIcon}
            titulo="Frango S/R"
            quantidade={qtds.frangosSemRecheio}
            onChange={(v) => setQtd("frangosSemRecheio", v)}
            max={disponivel("frangosSemRecheio")}
          />
          <ProdutoLinha
            icone={frangoIcon}
            titulo="Frango C/R"
            quantidade={qtds.frangosComRecheio}
            onChange={(v) => setQtd("frangosComRecheio", v)}
            max={disponivel("frangosComRecheio")}
          />
          <ProdutoLinha
            icone={frangoIcon}
            titulo="Meio Frango"
            quantidade={qtds.meioFrango}
            onChange={(v) => setQtd("meioFrango", v)}
            max={disponivel("meioFrango")}
          />
        </div>
      )}

      {/* Maioneses */}
      {isSunday && filtroAtivo === "maioneses" && (
        <div className="mb-16">
          <ProdutoLinha
            icone={maioneseIcon}
            titulo="Maionese R$10,00"
            quantidade={qtds.maionese10}
            onChange={(v) => setQtd("maionese10", v)}
            max={disponivel("maionese10")}
          />
          <ProdutoLinha
            icone={maioneseIcon}
            titulo="Maionese R$15,00"
            quantidade={qtds.maionese15}
            onChange={(v) => setQtd("maionese15", v)}
            max={disponivel("maionese15")}
          />
        </div>
      )}

      {/* Costela */}
      {isSunday && filtroAtivo === "costela" && (
        <div className="mb-16">
          <ProdutoLinha
            icone={costelaIcon}
            titulo="Costela"
            quantidade={qtds.costela}
            onChange={(v) => setQtd("costela", v)}
            max={disponivel("costela")}
          />
        </div>
      )}

      <ButtonConfirm onClick={handleSubmit}>
        Adicionar Venda
      </ButtonConfirm>

    </div>
  );
}