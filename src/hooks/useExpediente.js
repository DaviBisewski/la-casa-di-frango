import { useEffect, useState } from "react";

export function useExpediente() {

  const [expediente, setExpediente] = useState(null);

  useEffect(() => {
    const data = localStorage.getItem("expediente_atual");
    if (data) {
      setExpediente(JSON.parse(data));
    }
  }, []);

  useEffect(() => {
    if (expediente) {
      localStorage.setItem(
        "expediente_atual",
        JSON.stringify(expediente)
      );
    }
  }, [expediente]);

  function iniciarExpedienteComEstoque(form) {
    const hoje = new Date().toISOString().split("T")[0];
    const isSunday = new Date().getDay() === 0;

    const novoExpediente = {
      id: hoje,
      date: hoje,
      status: "active",
      isSunday,

      estoque: {
        frangosComRecheio: Number(form.comRecheio),
        frangosSemRecheio: Number(form.semRecheio),
        meioFrango: Number(form.meio),

        maionese10: isSunday ? Number(form.maionese10) : 0,
        maionese15: isSunday ? Number(form.maionese15) : 0,
        costela: isSunday ? Number(form.costela) : 0,
      },

      pedidos: [],
      vendas: [],
    };

    setExpediente(novoExpediente);
  }

  // 🔥 AQUI
  return {
    expediente,
    iniciarExpedienteComEstoque,
  };
}