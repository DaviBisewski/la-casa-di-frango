import { useNavigate } from "react-router-dom";
import plusIcon from "../../assets/icons/plus.svg";
import vendaIcon from "../../assets/icons/venda.svg";

export function BotoesAcao() {
  const navigate = useNavigate();

  return (
    <div className="grid grid-cols-2 gap-6 mt-16">
      <button
        onClick={() => navigate("/encomenda")}
        className="flex items-center justify-center gap-5 bg-[#0F4C3A]
                   text-white text-4xl font-bold py-12 rounded-2xl
                   hover:bg-[#0a3528] active:scale-[0.98] transition-all shadow-lg"
      >
        <img src={plusIcon} alt="Encomenda" className="w-13 h-13 rounded-full bg-black/10 p-3 brightness-0 invert" />
        Encomenda
      </button>

      <button
        onClick={() => navigate("/venda")}
        className="flex items-center justify-center gap-5 border-2 border-[#0F4C3A]
                   text-[#0F4C3A] text-4xl font-bold py-12 rounded-2xl
                   hover:bg-[#0F4C3A]/5 active:scale-[0.98] transition-all"
      >
        <img src={vendaIcon} alt="Venda" className="w-13 h-13 " />
        Venda
      </button>
    </div>
  );
}