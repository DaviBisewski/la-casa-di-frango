import { storage } from "./storage";

export const expedienteService = {

  /**
   * Verifica se já existe um expediente ativo no banco
   * Impede criar dois expedientes ativos ao mesmo tempo
   * @returns {boolean} true se houver expediente ativo
   */
  temExpedienteAtivo() {
    const db = storage.getDB();
    return db.days.some((d) => d.status === "active");
  },

/**
 * Cria um novo expediente com o estoque inicial do dia
 * Usa timestamp no ID para garantir unicidade
 * @param {Object} form - Valores do formulário
 * @returns {Object} Novo expediente criado
 */
criar(form) {
  const hoje = new Date().toISOString().split("T")[0];
  const isSunday = new Date().getDay() === 0;
  const timestamp = Date.now();

  const novoExpediente = {
    id: `${hoje}-${timestamp}`,
    date: hoje,
    status: "active",
    isSunday,
    iniciadoEm: timestamp,
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

  return novoExpediente;
},

  getTotalEncomendado(expediente, chave) {
    return (expediente.pedidos || []).reduce((total, pedido) => {
      const item = (pedido.itens || []).find((i) => i.chave === chave);
      return total + (item ? item.quantidade : 0);
    }, 0);
  },

  getTotalVendido(expediente, chave) {
    return (expediente.vendas || []).reduce((total, venda) => {
      const item = (venda.itens || []).find((i) => i.chave === chave);
      return total + (item ? item.quantidade : 0);
    }, 0);
  },

  getDisponivel(expediente, chave) {
    const original    = expediente.estoque[chave] || 0;
    const encomendado = this.getTotalEncomendado(expediente, chave);
    const vendido     = this.getTotalVendido(expediente, chave);
    return original - encomendado - vendido;
  },

  getTempoAtivo(expediente) {
    if (!expediente.iniciadoEm) return "—";
    const ms = Date.now() - expediente.iniciadoEm;
    const totalMin = Math.floor(ms / 60000);
    const horas = Math.floor(totalMin / 60);
    const min = totalMin % 60;
    const pad = (n) => String(n).padStart(2, "0");
    return horas > 0 ? `${horas}h ${pad(min)}min` : `${pad(min)}min`;
  },

  marcarRetirado(expediente, pedidoId) {
    const atualizado = {
      ...expediente,
      pedidos: expediente.pedidos.map((p) =>
        p.id === pedidoId ? { ...p, retirado: true } : p
      ),
    };
    storage.salvarExpedienteAtual(atualizado);
    storage.atualizarExpedienteNoDB(atualizado);
    return atualizado;
  },

  encerrar(expediente) {
    const atualizado = {
      ...expediente,
      status: "closed",
      encerradoEm: Date.now(),
    };
    storage.salvarExpedienteAtual(atualizado);
    storage.atualizarExpedienteNoDB(atualizado);
    return atualizado;
  },

  adicionarEncomenda(expediente, { nome, telefone, itens }) {
    const atualizado = {
      ...expediente,
      pedidos: [
        ...expediente.pedidos,
        { id: Date.now(), tipo: "encomenda", nome, telefone, itens, retirado: false },
      ],
    };
    storage.salvarExpedienteAtual(atualizado);
    storage.atualizarExpedienteNoDB(atualizado);
    return atualizado;
  },

  adicionarVenda(expediente, { itens }) {
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