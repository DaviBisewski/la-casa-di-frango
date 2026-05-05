import { useNavigate } from "react-router-dom";
import { useExpediente } from "../hooks/useExpediente";

export default function Dashboard() {
  const { expediente } = useExpediente();
  const navigate = useNavigate();

  if (!expediente) {
    navigate("/");
    return null;
  }

  const estoque = expediente.estoque;

  return (
    <div className="p-12 max-w-[1400px] mx-auto">

      {/* Botão voltar */}
      <button
        onClick={() => navigate("/")}
        className="flex items-center gap-3 text-[#0F4C3A] text-2xl font-semibold
                   mb-12 hover:opacity-70 transition-opacity"
      >
        ← Voltar para Home
      </button>

      <h2 className="text-4xl font-bold text-[#0F4C3A] mb-10">
        Estoque — {expediente.date}
      </h2>

      <div className="grid grid-cols-2 gap-10">
        <div className="border-2 border-[#0F4C3A]/15 p-8 rounded-2xl">
          <h3 className="text-2xl font-bold text-[#0F4C3A] mb-4">Frangos C/R</h3>
          <p className="text-xl text-[#0F4C3A]/70">Estoque: <strong>{estoque.frangosComRecheio}</strong></p>
          <p className="text-xl text-[#0F4C3A]/70">Encomendado: <strong>0</strong></p>
          <p className="text-xl text-[#0F4C3A]/70">Disponível: <strong>{estoque.frangosComRecheio}</strong></p>
        </div>

        <div className="border-2 border-[#0F4C3A]/15 p-8 rounded-2xl">
          <h3 className="text-2xl font-bold text-[#0F4C3A] mb-4">Frangos S/R</h3>
          <p className="text-xl text-[#0F4C3A]/70">Estoque: <strong>{estoque.frangosSemRecheio}</strong></p>
          <p className="text-xl text-[#0F4C3A]/70">Encomendado: <strong>0</strong></p>
          <p className="text-xl text-[#0F4C3A]/70">Disponível: <strong>{estoque.frangosSemRecheio}</strong></p>
        </div>
      </div>
    </div>
  );
}