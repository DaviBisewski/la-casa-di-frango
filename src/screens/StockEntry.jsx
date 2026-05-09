import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useExpediente } from "../hooks/useExpediente";
import { expedienteService } from "../services/expedienteService";
import { useToast } from "../contexts/ToastContext";
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

  function handleSubmit() {
    // 🔥 bloqueia se já houver expediente ativo
    if (expedienteService.temExpedienteAtivo()) {
      mostrar("Já existe um expediente ativo. Encerre-o antes de criar um novo.", "aviso");
      navigate("/dashboard");
      return;
    }

    iniciarExpedienteComEstoque(form);
    navigate("/dashboard");
  }

 /* ========================= STOCK ENTRY RESPONSIVO ========================= */

return (
  <div className="bg-white font-sans">
    <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-12 py-6 sm:py-10 lg:py-16">

      <div className="flex items-center gap-3 sm:gap-6 mb-3 sm:mb-4">

        <img
          src={stockIcon}
          alt="Estoque"
          className="w-8 h-8 sm:w-10 sm:h-10 lg:w-14 lg:h-14"
        />

        <h2 className="text-[#0F4C3A] text-2xl sm:text-4xl lg:text-5xl font-bold tracking-tight">
          Informe o estoque de hoje
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

      <div className="space-y-4 sm:space-y-6">
        <InputGroup
          label="Informe quantidade de Frangos C/R:"
          name="comRecheio"
          placeholder="Ex: 40"
          value={form.comRecheio}
          onChange={handleChange}
        />

        <InputGroup
          label="Informe quantidade de Frangos S/R:"
          name="semRecheio"
          placeholder="Ex: 40"
          value={form.semRecheio}
          onChange={handleChange}
        />

        <InputGroup
          label="Informe quantidade de Meios Frangos:"
          name="meio"
          placeholder="Ex: 10"
          value={form.meio}
          onChange={handleChange}
        />

        {isSunday && (
          <div className="pt-8 sm:pt-12 space-y-4 sm:space-y-6 border-t-2 border-gray-100 mt-4 sm:mt-6">

            <InputGroup
              label="Quantidade de Maionese (P):"
              name="maionese10"
              placeholder="Ex: 15"
              value={form.maionese10}
              onChange={handleChange}
            />

            <InputGroup
              label="Quantidade de Maionese (G):"
              name="maionese15"
              placeholder="Ex: 10"
              value={form.maionese15}
              onChange={handleChange}
            />

            <InputGroup
              label="Quantidade de Costela:"
              name="costela"
              placeholder="Ex: 5"
              value={form.costela}
              onChange={handleChange}
            />
          </div>
        )}
      </div>

      <div className="mt-10 sm:mt-14">
        <ButtonConfirm onClick={handleSubmit}>
          Confirmar
        </ButtonConfirm>
      </div>
    </div>
  </div>
);
}