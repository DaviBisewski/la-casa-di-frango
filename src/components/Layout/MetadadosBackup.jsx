/**
 * Exibe informações do último backup local e sync na nuvem
 */
export function MetadadosBackup({ ultimoBackup, ultimoSync, totalDias, pendentes, supabaseAtivo }) {

  function formatarTS(ts) {
    if (!ts) return "Nunca";
    const date = typeof ts === "string" ? new Date(ts) : ts;
    return new Intl.DateTimeFormat("pt-BR", {
      day: "2-digit", month: "2-digit", year: "numeric",
      hour: "2-digit", minute: "2-digit", second: "2-digit",
    }).format(date);
  }

  return (
    <div className="space-y-2">
      <p className="text-[#0F4C3A]/60 text-sm sm:text-2xl font-medium break-words">
        Último backup local: {formatarTS(ultimoBackup)}
        {totalDias > 0 && (
          <span> • Total: {totalDias} {totalDias === 1 ? "dia" : "dias"}</span>
        )}
      </p>

      {supabaseAtivo && (
        <p className="text-[#0F4C3A]/60 text-sm sm:text-2xl font-medium break-words">
          Último sync na nuvem: {formatarTS(ultimoSync)}
          {pendentes > 0 && (
            <span className="text-amber-600 font-bold"> • {pendentes} pendente(s)</span>
          )}
        </p>
      )}
    </div>
  );
}