import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useExpediente } from "../hooks/useExpediente";
import { ProdutoLinha } from "../components/ui/ProdutoLinha";
import { EstoqueFiltros } from "../components/Layout/EstoqueFiltro";
import { ButtonConfirm } from "../components/ui/ButtonConfirm";
import { InputGroup } from "../components/Forms/InputGroup";

import frangoIcon from "../assets/icons/frango.svg";
import maioneseIcon from "../assets/icons/maionese.svg";
import costelaIcon from "../assets/icons/costela.svg";
import encomendaIcon from "../assets/icons/frango.svg";

const FILTROS = [
  { key: "frangos",   label: "Frangos",   icone: frangoIcon   },
  { key: "maioneses", label: "Maioneses", icone: maioneseIcon },
  { key: "costela",   label: "Costela",   icone: costelaIcon  },
];

export default function Encomenda() {
  const { expediente, adicionarEncomenda } = useExpediente();
  const navigate = useNavigate();

  const [nome, setNome] = useState("");
  const [telefone, setTelefone] = useState("");
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

  const { estoque, isSunday } = expediente;

  function setQtd(chave, valor) {
    setQtds((prev) => ({ ...prev, [chave]: valor }));
  }

  function handleSubmit() {
    const itens = Object.entries(qtds)
      .filter(([, quantidade]) => quantidade > 0)
      .map(([chave, quantidade]) => ({ chave, quantidade }));

    if (!nome || itens.length === 0) return;

    adicionarEncomenda({ nome, telefone, itens });
    navigate("/dashboard");
  }

  return (
    <div className="max-w-[1400px] mx-auto px-12 py-16">

      {/* Título */}
      <div className="flex items-center gap-4 mb-4">
        <img src={encomendaIcon} alt="Encomenda" className="w-10 h-10" />
        <h2 className="text-[#0F4C3A] text-4xl font-extrabold">
          Informe a encomenda
        </h2>
      </div>

      <p className="text-[#0F4C3A]/60 text-2xl font-medium mb-12 capitalize">
        Hoje é {new Intl.DateTimeFormat('pt-BR', {
          weekday: 'long', day: 'numeric', month: 'long'
        }).format(new Date())}
      </p>

      {/* Nome */}
      <div className="mb-8">
        <InputGroup
          label="Informe o nome:"
          name="nome"
          placeholder="João Silva"
          value={nome}
          onChange={(e) => setNome(e.target.value)}
        />
      </div>

      {/* Telefone */}
      <div className="mb-12">
        <InputGroup
          label="Informe o telefone:"
          name="telefone"
          placeholder="(47) 99994-2292"
          value={telefone}
          onChange={(e) => setTelefone(e.target.value)}
        />
      </div>

      {/* Filtros — só domingo */}
      {isSunday && (
        <EstoqueFiltros
          filtros={FILTROS}
          filtroAtivo={filtroAtivo}
          onChange={setFiltroAtivo}
        />
      )}

      {/* Produtos — Frangos */}
      {(!isSunday || filtroAtivo === "frangos") && (
        <div className="mb-12">
          <ProdutoLinha
            icone={frangoIcon}
            titulo="Frango S/R"
            quantidade={qtds.frangosSemRecheio}
            onChange={(v) => setQtd("frangosSemRecheio", v)}
            max={estoque.frangosSemRecheio}
          />
          <ProdutoLinha
            icone={frangoIcon}
            titulo="Frango C/R"
            quantidade={qtds.frangosComRecheio}
            onChange={(v) => setQtd("frangosComRecheio", v)}
            max={estoque.frangosComRecheio}
          />
          <ProdutoLinha
            icone={frangoIcon}
            titulo="Meio Frango"
            quantidade={qtds.meioFrango}
            onChange={(v) => setQtd("meioFrango", v)}
            max={estoque.meioFrango}
          />
        </div>
      )}

      {/* Produtos — Maioneses (domingo) */}
      {isSunday && filtroAtivo === "maioneses" && (
        <div className="mb-12">
          <ProdutoLinha
            icone={maioneseIcon}
            titulo="Maionese R$10,00"
            quantidade={qtds.maionese10}
            onChange={(v) => setQtd("maionese10", v)}
            max={estoque.maionese10}
          />
          <ProdutoLinha
            icone={maioneseIcon}
            titulo="Maionese R$15,00"
            quantidade={qtds.maionese15}
            onChange={(v) => setQtd("maionese15", v)}
            max={estoque.maionese15}
          />
        </div>
      )}

      {/* Produto — Costela (domingo) */}
      {isSunday && filtroAtivo === "costela" && (
        <div className="mb-12">
          <ProdutoLinha
            icone={costelaIcon}
            titulo="Costela"
            quantidade={qtds.costela}
            onChange={(v) => setQtd("costela", v)}
            max={estoque.costela}
          />
        </div>
      )}

      <ButtonConfirm onClick={handleSubmit}>
        Adicionar Encomenda
      </ButtonConfirm>

    </div>
  );
}