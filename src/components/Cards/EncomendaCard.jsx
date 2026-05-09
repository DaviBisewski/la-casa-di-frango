import telefoneIcon from '../../assets/icons/telefone.svg';
import corretoIcon from '../../assets/icons/correto.svg';

const LABEL = {
  frangosComRecheio: "C/R",
  frangosSemRecheio: "S/R",
  meioFrango:        "Meio FR",
  maionese10:        "Mai. P",
  maionese15:        "Mai. G",
  costela:           "Costela",
};

/**
 * Card de encomenda com radius assimétrico
 * Esquerda arredondada suave, direita quase circular
 * Ícone e textos grandes para fácil leitura no tablet
 */
export function EncomendaCard({ pedido, onRetirar, retirado = false }) {
  return (
    <div className={`
      flex flex-col sm:flex-row sm:items-center justify-between gap-4
      transition-all duration-300 overflow-hidden
      rounded-2xl sm:rounded-l-2xl sm:rounded-r-full
      ${retirado
        ? "bg-white border-2 border-[#0F4C3A]/10 opacity-50"
        : "bg-[#D4F1E6]"
      }
    `}>

      {/* Lado esquerdo: nome, telefone e itens */}
      <div className="flex flex-col sm:flex-row sm:items-center gap-6 sm:gap-12 flex-1 px-5 py-5 sm:px-12 sm:py-10">

        {/* Nome e telefone */}
        <div className="flex flex-col gap-3 sm:gap-4 min-w-0 sm:min-w-[280px]">
          <span className="text-[#0F4C3A] text-2xl sm:text-4xl font-extrabold break-words">
            {pedido.nome}
          </span>
          <div className="flex items-center gap-3 sm:gap-4">
            <img src={telefoneIcon} alt="Telefone" className="w-5 h-5 sm:w-9 sm:h-9" />
            <span className="text-[#0F4C3A]/70 text-lg sm:text-3xl font-medium break-all">
              {pedido.telefone || "—"}
            </span>
          </div>
        </div>

        {/* Itens do pedido */}
        <div className="flex flex-col gap-2 sm:gap-3 flex-1">
          {(pedido.itens || []).map((item) => (
            <span key={item.chave} className="text-[#0F4C3A] text-lg sm:text-3xl">
              <span className="font-medium">{item.quantidade}x</span>
              {" FR "}
              <span className="font-extrabold">{LABEL[item.chave] || item.chave}</span>
            </span>
          ))}
        </div>

      </div>

      {/* Botão circular de retirada */}
      {!retirado ? (
        <button
          onClick={() => onRetirar(pedido.id)}
          className="w-20 h-20 sm:w-36 sm:h-36 rounded-full bg-[#0F4C3A] flex items-center justify-center
                     flex-shrink-0 self-end sm:self-auto mr-4 sm:mr-3 mb-4 sm:mb-0
                     hover:bg-[#0a3528] hover:scale-105
                     active:scale-95 transition-all duration-200 shadow-xl"
        >
          <img src={corretoIcon} alt="Retirado" className="w-8 h-8 sm:w-16 sm:h-16 brightness-0 invert" />
        </button>
      ) : (
        <div className="w-20 h-20 sm:w-36 sm:h-36 rounded-full bg-[#0F4C3A]/10 flex items-center
                        justify-center flex-shrink-0 self-end sm:self-auto mr-4 sm:mr-3 mb-4 sm:mb-0">
          <img src={corretoIcon} alt="Retirado" className="w-8 h-8 sm:w-16 sm:h-16 opacity-25" />
        </div>
      )}

    </div>
  );
}