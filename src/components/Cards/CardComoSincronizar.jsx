/**
 * Card explicativo do fluxo de sincronização entre dispositivos
 */
export function CardComoSincronizar() {
  const passos = [
    "1 - Exporte o backup",
    "2 - Envie para outro dispositivo",
    "3 - Importe aqui",
  ];

  return (
    <div className="bg-[#D4F1E6] rounded-2xl p-5 sm:p-10">
      <p className="text-[#0F4C3A] text-lg sm:text-2xl font-extrabold mb-4 sm:mb-6">
        Como sincronizar:
      </p>
      <div className="space-y-2 sm:space-y-3">
        {passos.map((passo) => (
          <p key={passo} className="text-[#0F4C3A] text-base sm:text-2xl font-medium">
            {passo}
          </p>
        ))}
      </div>
    </div>
  );
}