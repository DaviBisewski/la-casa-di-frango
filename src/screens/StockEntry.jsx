import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useExpediente } from "../hooks/useExpediente";
import { InputGroup } from "../components/Forms/InputGroup";
import { ButtonConfirm } from "../components/ui/ButtonConfirm";
import { notificarSucesso, notificarErro, MENSAGENS } from "../utils/toastConfig";
import stockIcon from '../assets/icons/frango.svg';

export default function StockEntry() {
  const { iniciarExpedienteComEstoque } = useExpediente();
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

  /**
   * Atualiza os valores do formulário quando o usuário digita
   * @param {Event} e - Evento do input
   */
  function handleChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  /**
   * Submete o formulário de estoque inicial
   * Inicia um novo expediente com as quantidades informadas
   * Notifica o usuário de sucesso ou erro
   */
  function handleSubmit() {
    try {
      iniciarExpedienteComEstoque(form);
      notificarSucesso(MENSAGENS.EXPEDIENTE_CRIADO);
      navigate("/dashboard");
    } catch (erro) {
      notificarErro(MENSAGENS.ERRO_GENERICO);
      console.error('Erro ao iniciar expediente:', erro);
    }
  }

  return (
    <div className="bg-white font-sans">
      <div className="max-w-[1400px] mx-auto px-12 py-16">

        <div className="flex items-center gap-6 mb-4">
          <img src={stockIcon} alt="Estoque" className="w-14 h-14" />
          <h2 className="text-[#0F4C3A] text-5xl font-bold tracking-tight">
            Informe o estoque de hoje
          </h2>
        </div>

        <p className="text-[#0F4C3A]/60 text-3xl font-medium mb-16 capitalize">
          Hoje é {new Intl.DateTimeFormat('pt-BR', {
            weekday: 'long', day: 'numeric', month: 'long'
          }).format(new Date())}
        </p>

        <div className="space-y-6">
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
            <div className="pt-12 space-y-6 border-t-2 border-gray-100 mt-6">
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

        <div className="mt-14">
          <ButtonConfirm onClick={handleSubmit}>
            Confirmar
          </ButtonConfirm>
        </div>

      </div>
    </div>
  );
}