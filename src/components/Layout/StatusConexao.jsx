/**
 * Badge de status de conexão com a internet
 * Verde quando online, vermelho quando offline
 */
import wifiIcon from "../../assets/icons/wifi.svg";
import wifiOffIcon from "../../assets/icons/wifiOff.svg";

export function StatusConexao({ online }) {
  return (
    <div
      className={`flex items-start sm:items-center gap-3 sm:gap-4 px-4 sm:px-8 py-4 sm:py-5 rounded-2xl text-sm sm:text-2xl font-semibold
      ${online ? "bg-[#D4F1E6] text-[#0F4C3A]" : "bg-red-50 text-red-700"}`}
    >
      <img
        src={online ? wifiIcon : wifiOffIcon}
        alt={online ? "Online" : "Offline"}
        className={`w-5 h-5 sm:w-8 sm:h-8 flex-shrink-0 ${online ? "" : "opacity-70"}`}
      />

      <div
        className={`w-2 h-2 sm:w-3 sm:h-3 rounded-full animate-pulse mt-1 sm:mt-0 flex-shrink-0 ${
          online ? "bg-[#0F4C3A]" : "bg-red-500"
        }`}
      />

      <span className="leading-snug break-words">
        {online
          ? "Conectado à internet"
          : "Sem conexão — dados salvos localmente"}
      </span>
    </div>
  );
}