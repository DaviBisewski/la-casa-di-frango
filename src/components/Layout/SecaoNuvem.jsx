import uploadIcon from "../../assets/icons/upload.svg";
import downloadIcon from "../../assets/icons/download.svg";

export function SecaoNuvem({ online, loading, onEnviar, onBaixar }) {
  return (
    <div className="space-y-3 sm:space-y-4">
      <h3 className="text-[#0F4C3A] text-xl sm:text-3xl font-extrabold">
        Nuvem
      </h3>

      <button
        onClick={onEnviar}
        disabled={loading || !online}
        className="w-full flex items-center justify-center gap-3 sm:gap-8
                   bg-[#0F4C3A] text-white text-xl sm:text-4xl font-bold
                   py-5 sm:py-12 rounded-2xl hover:bg-[#0a3528]
                   active:scale-[0.99] transition-all shadow-lg
                   disabled:opacity-50 disabled:cursor-not-allowed px-4"
      >
        <img
          src={uploadIcon}
          alt="Enviar"
          className="w-7 h-7 sm:w-14 sm:h-14 brightness-0 invert"
        />
        {loading ? "Sincronizando..." : "Enviar para nuvem"}
      </button>

      <button
        onClick={onBaixar}
        disabled={loading || !online}
        className="w-full flex items-center justify-center gap-3 sm:gap-8
                   border-2 border-[#0F4C3A]/20 text-[#0F4C3A] text-xl sm:text-4xl font-bold
                   py-5 sm:py-12 rounded-2xl hover:bg-[#0F4C3A]/5
                   active:scale-[0.99] transition-all
                   disabled:opacity-50 disabled:cursor-not-allowed px-4"
      >
        <img
          src={downloadIcon}
          alt="Baixar"
          className="w-7 h-7 sm:w-14 sm:h-14"
        />
        {loading ? "Baixando..." : "Baixar da nuvem"}
      </button>
    </div>
  );
}