import { storage } from "./storage";

/**
 * Service de lógica de negócio do expediente
 * Contém funções para criar, atualizar e calcular dados do expediente
 * 
 * Nota: O sistema não desconta automaticamente do estãgio
 * As quantidades disponíveis são calculadas como:
 * Disponível = Estãgio Original - Encomendas - Vendas
 */
export const expedienteService = {
  /**
   * Cria um novo expediente com o estãgio inicial do dia
   * @param {Object} form - Valores do formulário com quantidades iniciais
   * @returns {Object} Novo expediente criado
   */
  criar(form) {
    const hoje = new Date().toISOString().split("T")[0];
    const isSunday = new Date().getDay() === 0;
    const timestamp = Date.now(); // ID único mesmo no mesmo dia

    const novoExpediente = {
      id: `${hoje}-${timestamp}`,
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

  /**
   * Calcula o total encomendado de um produto
   * Soma todas as encomendas daquele produto no expediente
   * @param {Object} expediente - Expediente atual
   * @param {string} chave - Identificador do produto (ex: 'frangosComRecheio')
   * @returns {number} Total encomendado
   */
  // soma tudo que foi encomendado de um produto
  getTotalEncomendado(expediente, chave) {
    return (expediente.pedidos || []).reduce((total, pedido) => {
      const item = (pedido.itens || []).find((i) => i.chave === chave);
      return total + (item ? item.quantidade : 0);
    }, 0);
  },

  /**
   * Calcula o total vendido de um produto
   * Soma todas as vendas daquele produto no expediente
   * @param {Object} expediente - Expediente atual
   * @param {string} chave - Identificador do produto (ex: 'frangosComRecheio')
   * @returns {number} Total vendido
   */
  // soma tudo que foi vendido de um produto
  getTotalVendido(expediente, chave) {
    return (expediente.vendas || []).reduce((total, venda) => {
      const item = (venda.itens || []).find((i) => i.chave === chave);
      return total + (item ? item.quantidade : 0);
    }, 0);
  },

  /**
   * Calcula a quantidade disponível de um produto
   * Fórmula: Estãgio Original - Encomendas - Vendas
   * @param {Object} expediente - Expediente atual
   * @param {string} chave - Identificador do produto
   * @returns {number} Quantidade disponível para nova encomenda ou venda
   */
  // estoque original - encomendas - vendas
  getDisponivel(expediente, chave) {
    const original    = expediente.estoque[chave] || 0;
    const encomendado = this.getTotalEncomendado(expediente, chave);
    const vendido     = this.getTotalVendido(expediente, chave);
    return original - encomendado - vendido;
  },

  /**
   * Adiciona uma encomenda (pedido do cliente) ao expediente
   * IMPORTANTE: Não desconta do estãgio, apenas registra o pedido
   * @param {Object} expediente - Expediente atual
   * @param {Object} dados - Dados da encomenda {nome, telefone, itens}
   * @returns {Object} Expediente atualizado
   */
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

  /**
   * Registra uma venda rápida (venda no balão) no expediente
   * IMPORTANTE: Não desconta do estãgio, apenas registra a venda
   * @param {Object} expediente - Expediente atual
   * @param {Object} dados - Dados da venda {itens}
   * @returns {Object} Expediente atualizado
   */
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