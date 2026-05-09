/**
 * Badge de status de conexão com a internet
 * Verde quando online, vermelho quando offline
 */
import wifiIcon from "../../assets/icons/wifi.svg";
import wifiOffIcon from "../../assets/icons/wifiOff.svg";

export function StatusConexao({ online }) {
  return (
    <div className={`flex items-center gap-4 px-8 py-5 rounded-2xl text-2xl font-semibold
      ${online ? "bg-[#D4F1E6] text-[#0F4C3A]" : "bg-red-50 text-red-700"}`}>
      <img
        src={online ? wifiIcon : wifiOffIcon}
        alt={online ? "Online" : "Offline"}
        className={`w-8 h-8 ${online ? "" : "opacity-70"}`}
      />
      <div className={`w-3 h-3 rounded-full animate-pulse ${online ? "bg-[#0F4C3A]" : "bg-red-500"}`} />
      {online ? "Conectado à internet" : "Sem conexão — dados salvos localmente"}
    </div>
  );
}