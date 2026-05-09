import { useState } from "react";
import { ModalEncerrar } from "../Modals/ModalEncerrar";
import { expedienteService } from "../../services/expedienteService";
import clockIcon from "../../assets/icons/clock.svg";

/**
 * Botão de encerrar expediente com tempo ativo e modal de confirmação
 * @param {Object} expediente - Expediente atual
 * @param {Function} onEncerrar - Callback após confirmar encerramento
 */
export function BotaoEncerrar({ expediente, onEncerrar }) {
  const [modalAberto, setModalAberto] = useState(false);
  const [tempo, setTempo] = useState(
    expedienteService.getTempoAtivo(expediente)
  );

  function handleConfirmar() {
    setModalAberto(false);
    onEncerrar();
  }

  return (
    <>
      <div className="mt-10 md:mt-16 pt-10 md:pt-16 border-t-2 border-[#0F4C3A]/10">

        {/* Tempo ativo */}
        <div className="flex items-center gap-3 md:gap-4 mb-6 md:mb-8">
          <img
            src={clockIcon}
            alt="Tempo"
            className="w-6 h-6 sm:w-7 sm:h-7 md:w-9 md:h-9 opacity-50"
          />
          <span className="text-[#0F4C3A]/60 text-base sm:text-lg md:text-2xl font-semibold">
            Expediente ativo a {tempo}
          </span>
        </div>

        {/* Botão encerrar */}
        <button
          onClick={() => setModalAberto(true)}
          className="w-full bg-[#0F4C3A] text-white
                     text-2xl sm:text-3xl md:text-4xl font-bold
                     py-5 sm:py-7 md:py-12 rounded-2xl
                     hover:bg-[#0a3528]
                     active:scale-[0.99] transition-all shadow-xl"
        >
          Encerrar Expediente
        </button>
      </div>

      {/* Modal de confirmação */}
      {modalAberto && (
        <ModalEncerrar
          expediente={expediente}
          onConfirmar={handleConfirmar}
          onCancelar={() => setModalAberto(false)}
        />
      )}
    </>
  );
}