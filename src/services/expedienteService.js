import { storage } from "./storage";

export const expedienteService = {
  criar(form) {
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
        meioFrango:        Number(form.meio),
        maionese10: isSunday ? Number(form.maionese10) : 0,
        maionese15: isSunday ? Number(form.maionese15) : 0,
        costela:    isSunday ? Number(form.costela)    : 0,
      },
      pedidos: [],
      vendas:  [],
    };

    storage.adicionarExpedienteToDB(novoExpediente);
    storage.salvarExpedienteAtual(novoExpediente);

    return novoExpediente;
  },

  adicionarEncomenda(expediente, { nome, telefone, itens }) {
    const atualizado = { ...expediente, estoque: { ...expediente.estoque } };

    itens.forEach(({ chave, quantidade }) => {
      atualizado.estoque[chave] -= quantidade;
    });

    atualizado.pedidos = [
      ...atualizado.pedidos,
      { id: Date.now(), tipo: "encomenda", nome, telefone, itens },
    ];

    storage.salvarExpedienteAtual(atualizado);
    storage.atualizarExpedienteNoDB(atualizado);

    return atualizado;
  },

  adicionarVenda(expediente, { itens }) {
    const atualizado = { ...expediente, estoque: { ...expediente.estoque } };

    itens.forEach(({ chave, quantidade }) => {
      atualizado.estoque[chave] -= quantidade;
    });

    atualizado.vendas = [
      ...atualizado.vendas,
      { id: Date.now(), tipo: "venda", itens },
    ];

    storage.salvarExpedienteAtual(atualizado);
    storage.atualizarExpedienteNoDB(atualizado);

    return atualizado;
  },
};