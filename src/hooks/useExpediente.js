import { useEffect, useState } from "react";

export function useExpediente() {
  const [expediente, setExpediente] = useState(null);

  useEffect(() => {
    const data = localStorage.getItem("expediente_atual");
    if (data) setExpediente(JSON.parse(data));
  }, []);

  useEffect(() => {
    if (expediente) {
      localStorage.setItem("expediente_atual", JSON.stringify(expediente));
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

    const db = JSON.parse(localStorage.getItem("frango_db")) || { days: [] };
    db.days.push(novoExpediente);
    localStorage.setItem("frango_db", JSON.stringify(db));
    setExpediente(novoExpediente);
  }

  function verExpediente(expDoHistorico) {
    setExpediente(expDoHistorico);
  }

  function getHistorico() {
    const db = JSON.parse(localStorage.getItem("frango_db")) || { days: [] };
    return [...db.days].reverse();
  }

  return {
    expediente,
    iniciarExpedienteComEstoque,
    verExpediente,
    getHistorico,
  };
}