import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useExpediente } from "../contexts/ExpedienteContext";
import { useToast } from "../contexts/ToastContext";
import { temExpedienteAtivo } from "../services/storageManager";
import { InputGroup } from "../components/Forms/InputGroup";
import { ButtonConfirm } from "../components/ui/ButtonConfirm";
import stockIcon from '../assets/icons/frango.svg';

export default function StockEntry() {
  const { iniciarExpedienteComEstoque } = useExpediente();
  const { mostrar } = useToast();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    comRecheio: "",
    semRecheio: "",
    meio: "",
    maionese10: "",
    maionese15: "",
    costela: "",
  });

  const isSunday = new Date().getDay() === 0;

  function handleChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  /**
   * Submete o formulário de estoque inicial
   * IMPORTANTE: aguarda iniciarExpedienteComEstoque() completar antes de navegar
   * Isso garante que o Dashboard já encontra o novo expediente no estado global
   */
  async function handleSubmit() {
    // Verifica se já existe ativo antes de criar
    const ativo = await temExpedienteAtivo();
    if (ativo) {
      mostrar("Já existe um expediente ativo. Encerre-o antes de criar um novo.", "aviso");
      navigate("/dashboard");
      return;
    }

    // Aguarda o estado global atualizar ANTES de navegar
    const novo = await iniciarExpedienteComEstoque(form);

    if (!novo) {
      mostrar("Não foi possível criar o expediente.", "erro");
      return;
    }

    // Só navega após o estado estar pronto — Dashboard vai encontrar o expediente correto
    navigate("/dashboard");
  }

  return (
    <div className="bg-white font-sans">
      <div className="max-w-[1400px] mx-auto px-4 py-8 md:px-8 md:py-12 lg:px-12 lg:py-16">

        <div className="flex items-center gap-3 md:gap-4 lg:gap-6 mb-3 md:mb-4">
          <img src={stockIcon} alt="Estoque" className="w-8 h-8 md:w-11 md:h-11 lg:w-14 lg:h-14" />
          <h2 className="text-[#0F4C3A] text-2xl md:text-4xl lg:text-5xl font-bold tracking-tight">
            Informe o estoque de hoje
          </h2>
        </div>

        <p className="text-[#0F4C3A]/60 text-base md:text-2xl lg:text-3xl font-medium mb-8 md:mb-12 lg:mb-16 capitalize">
          Hoje é {new Intl.DateTimeFormat('pt-BR', {
            weekday: 'long', day: 'numeric', month: 'long'
          }).format(new Date())}
        </p>

        <div className="space-y-4 md:space-y-5 lg:space-y-6">
          <InputGroup label="Informe quantidade de Frangos C/R:" name="comRecheio" placeholder="Ex: 40" value={form.comRecheio} onChange={handleChange} />
          <InputGroup label="Informe quantidade de Frangos S/R:" name="semRecheio" placeholder="Ex: 40" value={form.semRecheio} onChange={handleChange} />
          <InputGroup label="Informe quantidade de Meios Frangos:" name="meio" placeholder="Ex: 10" value={form.meio} onChange={handleChange} />

          {isSunday && (
            <div className="pt-8 md:pt-10 lg:pt-12 space-y-4 md:space-y-5 lg:space-y-6 border-t-2 border-gray-100 mt-4 md:mt-5 lg:mt-6">
              <InputGroup label="Quantidade de Maionese (P):" name="maionese10" placeholder="Ex: 15" value={form.maionese10} onChange={handleChange} />
              <InputGroup label="Quantidade de Maionese (G):" name="maionese15" placeholder="Ex: 10" value={form.maionese15} onChange={handleChange} />
              <InputGroup label="Quantidade de Costela:" name="costela" placeholder="Ex: 5" value={form.costela} onChange={handleChange} />
            </div>
          )}
        </div>

        <div className="mt-8 md:mt-11 lg:mt-14">
          <ButtonConfirm onClick={handleSubmit}>
            Confirmar
          </ButtonConfirm>
        </div>

      </div>
    </div>
  );
}