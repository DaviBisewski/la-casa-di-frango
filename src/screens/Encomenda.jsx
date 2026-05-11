import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useExpediente } from "../contexts/ExpedienteContext";
import { useToast } from "../contexts/ToastContext";
import { MENSAGENS } from "../services/toastService";
import { ProdutoLinha } from "../components/ui/ProdutoLinha";
import { EstoqueFiltros } from "../components/Layout/EstoqueFiltro";
import { ButtonConfirm } from "../components/ui/ButtonConfirm";
import { expedienteService } from "../services/expedienteService";

import { PRODUTOS, FILTROS_CATEGORIA } from "../constants/produtos";
import encomendaIcon from "../assets/icons/frango.svg";

function CampoTexto({
  label,
  placeholder,
  value,
  onChange,
  type = "text",
}) {
  return (
    <div className="flex flex-col gap-2 sm:gap-3 mb-6 sm:mb-10 w-full">

      {/* Label */}
      <label
        className="
          text-[#0F4C3A]
          text-lg sm:text-2xl lg:text-3xl
          font-semibold
          leading-tight
        "
      >
        {label}
      </label>

      {/* Input */}
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="
          w-full
          bg-[#D4F1E6]
          text-[#0F4C3A]

          text-base sm:text-xl lg:text-2xl

          px-4 py-4
          sm:px-6 sm:py-5
          lg:px-8 lg:py-6

          rounded-2xl

          placeholder:text-[#0F4C3A]/40

          border-2 border-transparent
          focus:border-[#0F4C3A]/20
          outline-none
          transition-all
          shadow-inner
        "
      />
    </div>
  );
}

export default function Encomenda() {
  const { expediente, adicionarEncomenda } = useExpediente();
  const { mostrar } = useToast();
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

  // Simplificar: usar useMemo para calcular produtos visíveis
  // IMPORTANTE: Hooks DEVEM estar antes de qualquer return condicional
  const produtosVisiveis = useMemo(() => {
    if (!expediente) return [];
    const { isSunday } = expediente;
    if (isSunday) return PRODUTOS[filtroAtivo] || [];
    // Se não for domingo, mostra apenas frangos
    return filtroAtivo === "frangos" ? PRODUTOS.frangos : [];
  }, [expediente, filtroAtivo]);

  if (!expediente) return null;

  const { isSunday } = expediente;

  const handleSubmit = () => {
    const itens = Object.entries(qtds)
      .filter(([, quantidade]) => quantidade > 0)
      .map(([chave, quantidade]) => ({ chave, quantidade }));

    if (!nome.trim() || itens.length === 0) return;

    adicionarEncomenda({ nome, telefone, itens });
    mostrar(MENSAGENS.ENCOMENDA_ADICIONADA, "sucesso");
    navigate("/dashboard");
  };

  /* ========================= ENCOMENDA RESPONSIVO ========================= */

return (
  <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-12 py-6 sm:py-10 lg:py-16">

    <div className="flex items-center gap-3 sm:gap-4 mb-3 sm:mb-4">
      <img
        src={encomendaIcon}
        alt="Encomenda"
        className="w-8 h-8 sm:w-10 sm:h-10 lg:w-12 lg:h-12"
      />

      <h2 className="text-[#0F4C3A] text-2xl sm:text-4xl lg:text-5xl font-extrabold">
        Informe a encomenda
      </h2>
    </div>

    <p className="text-[#0F4C3A]/60 text-base sm:text-2xl lg:text-3xl font-medium mb-8 sm:mb-12 lg:mb-16 capitalize">
      Hoje é{" "}
      {new Intl.DateTimeFormat("pt-BR", {
        weekday: "long",
        day: "numeric",
        month: "long",
      }).format(new Date())}
    </p>

    <CampoTexto
      label="Informe o nome:"
      placeholder="João Silva"
      value={nome}
      onChange={setNome}
    />

    <CampoTexto
      label="Informe o telefone:"
      placeholder="(47) 99994-2292"
      value={telefone}
      onChange={setTelefone}
      type="tel"
    />

    {isSunday && (
      <div className="mb-6 sm:mb-8">
        <EstoqueFiltros
          filtros={FILTROS_CATEGORIA}
          filtroAtivo={filtroAtivo}
          onChange={setFiltroAtivo}
        />
      </div>
    )}

    {produtosVisiveis.length > 0 && (
      <div className="mb-10 sm:mb-14 lg:mb-16">
        {produtosVisiveis.map((produto) => (
          <ProdutoLinha
            key={produto.chave}
            icone={produto.icone}
            titulo={produto.titulo}
            quantidade={qtds[produto.chave]}
            onChange={(valor) =>
              setQtds((prev) => ({
                ...prev,
                [produto.chave]: valor,
              }))
            }
            max={expedienteService.getDisponivel(expediente, produto.chave)}
          />
        ))}
      </div>
    )}

    <ButtonConfirm onClick={handleSubmit}>
      Adicionar Encomenda
    </ButtonConfirm>

  </div>
);
}