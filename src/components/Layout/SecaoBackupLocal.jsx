/**
 * Seção de backup manual via arquivo JSON
 * Exporta todos os dados ou importa de um arquivo existente
 */
import { useRef } from "react";
import exportarIcon from "../../assets/icons/exportar.svg";
import importarIcon from "../../assets/icons/importar.svg";

export function SecaoBackupLocal({ loading, onExportar, onImportar }) {
  const inputRef = useRef(null);

  return (
    <div className="space-y-3 sm:space-y-4">
      <h3 className="text-[#0F4C3A] text-xl sm:text-3xl font-extrabold">
        Backup local
      </h3>

      <button
        onClick={onExportar}
        className="w-full flex items-center justify-center gap-3 sm:gap-8
                   bg-[#0F4C3A] text-white text-xl sm:text-4xl font-bold
                   py-5 sm:py-12 rounded-2xl hover:bg-[#0a3528]
                   active:scale-[0.99] transition-all shadow-lg px-4"
      >
        <img
          src={exportarIcon}
          alt="Exportar"
          className="w-7 h-7 sm:w-14 sm:h-14 brightness-0 invert"
        />
        Exportar
      </button>

      <button
        onClick={() => inputRef.current?.click()}
        disabled={loading}
        className="w-full flex items-center justify-center gap-3 sm:gap-8
                   border-2 border-[#0F4C3A]/20 text-[#0F4C3A] text-xl sm:text-4xl font-bold
                   py-5 sm:py-12 rounded-2xl hover:bg-[#0F4C3A]/5
                   active:scale-[0.99] transition-all
                   disabled:opacity-50 disabled:cursor-not-allowed px-4"
      >
        <img
          src={importarIcon}
          alt="Importar"
          className="w-7 h-7 sm:w-14 sm:h-14"
        />
        {loading ? "Importando..." : "Importar"}
      </button>

      {/* Input oculto para seleção de arquivo */}
      <input
        ref={inputRef}
        type="file"
        accept=".json"
        onChange={onImportar}
        className="hidden"
      />
    </div>
  );
}