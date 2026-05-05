import { useState } from "react";
import { useExpediente } from "../hooks/useExpediente";
import { InputGroup } from '../components/Forms/InputGroup';

export default function StockEntry({ onFinish }) {
  const { iniciarExpedienteComEstoque } = useExpediente();

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
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  }

  function handleSubmit() {
    iniciarExpedienteComEstoque(form);
    onFinish();
  }

  return (
    <div className="min-h-screen bg-white">

      <div className="p-6 max-w-md mx-auto">
        <div className="flex items-center gap-2 mb-2">
          {/* Ícone de gráfico/estoque simulado */}
          <span className="text-2xl">📊</span> 
          <h2 className="text-[#1e392a] text-xl font-bold">
            Informe o estoque de hoje
          </h2>
        </div>
        
        <p className="text-gray-500 mb-8 italic">
          Hoje é {new Intl.DateTimeFormat('pt-BR', { weekday: 'long', day: 'numeric', month: 'long' }).format(new Date())}
        </p>

        {/* CAMPOS PADRÃO (SEMANA) */}
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

        {/* CAMPOS EXCLUSIVOS DE DOMINGO */}
        {isSunday && (
          <div className="pt-4 border-t border-gray-100 mt-4">
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

        <button 
          onClick={handleSubmit}
          className="w-full bg-[#2a4435] text-white font-bold py-4 rounded-lg mt-4 hover:bg-[#1e392a] transition-colors shadow-lg"
        >
          Confirmar
        </button>
      </div>
    </div>
  );
}