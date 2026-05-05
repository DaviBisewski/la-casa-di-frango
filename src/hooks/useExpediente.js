import { useEffect, useState } from "react";

export function useExpediente() {
  const [expediente, setExpediente] = useState(null);

  // carregar
  useEffect(() => {
    const data = localStorage.getItem("expediente_atual");

    if (data) {
      setExpediente(JSON.parse(data));
    }
  }, []);

  // salvar
  useEffect(() => {
    if (expediente) {
      localStorage.setItem(
        "expediente_atual",
        JSON.stringify(expediente)
      );
    }
  }, [expediente]);

  // ação
  function iniciarExpediente() {
    const hoje = new Date().toISOString().split("T")[0];

    const novoExpediente = {
      id: hoje,
      date: hoje,
      status: "active",
      pedidos: [],
    };

    setExpediente(novoExpediente);
  }

  return {
    expediente,
    iniciarExpediente,
  };
}