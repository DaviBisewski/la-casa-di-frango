import telefoneIcon from '../../assets/icons/telefone.svg';
import corretoIcon from '../../assets/icons/correto.svg';

const LABEL = {
  frangosComRecheio: "C/R",
  frangosSemRecheio: "S/R",
  meioFrango: "Meio FR",
  maionese10: "Mai. P",
  maionese15: "Mai. G",
  costela: "Costela",
};

export function EncomendaCard({ pedido, onRetirar, retirado = false }) {
  return (
    <div
      className={`
        flex items-center justify-between
        overflow-hidden
        transition-all duration-300

        rounded-l-2xl rounded-r-full

        min-h-[78px] sm:min-h-[120px]

        pl-5 pr-2 py-3
        sm:pl-10 sm:pr-3 sm:py-5

        ${
          retirado
            ? "bg-white border-2 border-[#0F4C3A]/10 opacity-50"
            : "bg-[#D4F1E6]"
        }
      `}
    >

      {/* Conteúdo esquerdo */}
      <div className="flex items-center justify-between flex-1 gap-5 min-w-0">

        {/* Nome + telefone */}
        <div className="flex flex-col min-w-0 w-[35%] sm:w-[280px]">
          <span
            className="
              text-[#0F4C3A]
              text-lg sm:text-4xl
              font-extrabold
              truncate
              leading-tight
            "
          >
            {pedido.nome}
          </span>

          <div className="flex items-center gap-2 mt-1">
            <img
              src={telefoneIcon}
              alt="Telefone"
              className="w-4 h-4 sm:w-8 sm:h-8 flex-shrink-0"
            />

            <span
              className="
                text-[#0F4C3A]/70
                text-sm sm:text-2xl
                truncate
              "
            >
              {pedido.telefone || "—"}
            </span>
          </div>
        </div>

        {/* Itens */}
        <div className="flex flex-col justify-center flex-1 min-w-0">
          {(pedido.itens || []).map((item) => (
            <span
              key={item.chave}
              className="
                text-[#0F4C3A]
                text-sm sm:text-2xl
                truncate
              "
            >
              <span className="font-medium">
                {item.quantidade}x
              </span>

              {" FR "}

              <span className="font-extrabold">
                {LABEL[item.chave] || item.chave}
              </span>
            </span>
          ))}
        </div>

      </div>

      {/* Botão direita */}
      {!retirado ? (
        <button
          onClick={() => onRetirar(pedido.id)}
          className="
            w-16 h-16
            sm:w-28 sm:h-28

            rounded-full
            bg-[#0F4C3A]

            flex items-center justify-center
            flex-shrink-0

            hover:bg-[#0a3528]
            active:scale-95
            transition-all

            shadow-lg
          "
        >
          <img
            src={corretoIcon}
            alt="Retirado"
            className="
              w-6 h-6
              sm:w-12 sm:h-12
              brightness-0 invert
            "
          />
        </button>
      ) : (
        <div
          className="
            w-16 h-16
            sm:w-28 sm:h-28

            rounded-full
            bg-[#0F4C3A]/10

            flex items-center justify-center
            flex-shrink-0
          "
        >
          <img
            src={corretoIcon}
            alt="Retirado"
            className="
              w-6 h-6
              sm:w-12 sm:h-12
              opacity-25
            "
          />
        </div>
      )}

    </div>
  );
}