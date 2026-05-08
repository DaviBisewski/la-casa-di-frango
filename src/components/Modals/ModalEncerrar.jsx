import { useState, useEffect } from "react";
import { expedienteService } from "../../services/expedienteService";
import clockIcon from "../../assets/icons/clock.svg";

/**
 * Modal de confirmação para encerrar o expediente
 * Mostra tempo decorrido e atualiza a cada minuto
 * @param {Object} expediente - Expediente atual
 * @param {Function} onConfirmar - Callback ao confirmar encerramento
 * @param {Function} onCancelar - Callback ao cancelar
 */
export function ModalEncerrar({ expediente, onConfirmar, onCancelar }) {
  /** Tempo ativo atualizado a cada minuto */
  const [tempo, setTempo] = useState(
    expedienteService.getTempoAtivo(expediente)
  );

  useEffect(() => {
    const intervalo = setInterval(() => {
      setTempo(expedienteService.getTempoAtivo(expediente));
    }, 30000);
    return () => clearInterval(intervalo);
  }, [expediente]);

  return (
    <>
      {/* Overlay escuro com fade */}
      <div
        onClick={onCancelar}
        className="fixed inset-0 bg-black/50 z-40 animate-fade-in"
      />

      {/* Modal centralizado */}
      <div className="fixed inset-0 z-50 flex items-center justify-center px-12">
        <div
          className="bg-white rounded-3xl p-16 w-full max-w-[700px] shadow-2xl
                     animate-scale-in"
        >
          {/* Tempo ativo */}
          <div className="flex items-center gap-5 mb-6">
            <img src={clockIcon} alt="Tempo" className="w-10 h-10 opacity-60" />
            <span className="text-[#0F4C3A]/60 text-2xl font-semibold">
              Expediente ativo a {tempo}
            </span>
          </div>

          {/* Pergunta */}
          <h2 className="text-[#0F4C3A] text-5xl font-extrabold mb-6 leading-tight">
            Encerrar expediente?
          </h2>
          <p className="text-[#0F4C3A]/50 text-2xl mb-16">
            Essa ação não pode ser desfeita. O expediente será marcado como encerrado.
          </p>

          {/* Botões */}
          <div className="flex flex-col gap-5">
            <button
              onClick={onConfirmar}
              className="w-full bg-[#0F4C3A] text-white text-3xl font-bold
                         py-8 rounded-2xl hover:bg-[#0a3528]
                         active:scale-[0.99] transition-all shadow-lg"
            >
              Encerrar Expediente
            </button>

            <button
              onClick={onCancelar}
              className="w-full border-2 border-[#0F4C3A]/20 text-[#0F4C3A]
                         text-3xl font-semibold py-8 rounded-2xl
                         hover:border-[#0F4C3A]/50 hover:bg-[#0F4C3A]/5
                         active:scale-[0.99] transition-all"
            >
              Cancelar
            </button>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes fade-in {
          from { opacity: 0; }
          to   { opacity: 1; }
        }
        @keyframes scale-in {
          from { opacity: 0; transform: scale(0.92); }
          to   { opacity: 1; transform: scale(1); }
        }
        .animate-fade-in  { animation: fade-in  0.25s ease-out; }
        .animate-scale-in { animation: scale-in 0.25s ease-out; }
      `}</style>
    </>
  );
}