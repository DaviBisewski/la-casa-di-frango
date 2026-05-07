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

  // soma tudo que foi encomendado de um produto
  getTotalEncomendado(expediente, chave) {
    return (expediente.pedidos || []).reduce((total, pedido) => {
      const item = (pedido.itens || []).find((i) => i.chave === chave);
      return total + (item ? item.quantidade : 0);
    }, 0);
  },

  // soma tudo que foi vendido de um produto
  getTotalVendido(expediente, chave) {
    return (expediente.vendas || []).reduce((total, venda) => {
      const item = (venda.itens || []).find((i) => i.chave === chave);
      return total + (item ? item.quantidade : 0);
    }, 0);
  },

  // estoque original - encomendas - vendas
  getDisponivel(expediente, chave) {
    const original    = expediente.estoque[chave] || 0;
    const encomendado = this.getTotalEncomendado(expediente, chave);
    const vendido     = this.getTotalVendido(expediente, chave);
    return original - encomendado - vendido;
  },

  adicionarEncomenda(expediente, { nome, telefone, itens }) {
    // 🔥 NÃO desconta do estoque — apenas registra o pedido
    const atualizado = {
      ...expediente,
      pedidos: [
        ...expediente.pedidos,
        { id: Date.now(), tipo: "encomenda", nome, telefone, itens },
      ],
    };

    storage.salvarExpedienteAtual(atualizado);
    storage.atualizarExpedienteNoDB(atualizado);
    return atualizado;
  },

  adicionarVenda(expediente, { itens }) {
    // 🔥 NÃO desconta do estoque — apenas registra a venda
    const atualizado = {
      ...expediente,
      vendas: [
        ...expediente.vendas,
        { id: Date.now(), tipo: "venda", itens },
      ],
    };

    storage.salvarExpedienteAtual(atualizado);
    storage.atualizarExpedienteNoDB(atualizado);
    return atualizado;
  },
};