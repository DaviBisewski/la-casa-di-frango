import { storage } from "./storage";

/**
 * Service de lógica de negócio do expediente
 * Contém funções para criar, atualizar e calcular dados do expediente
 *
 * Nota: O sistema não desconta automaticamente do estoque.
 * As quantidades disponíveis são calculadas como:
 * Disponível = Estoque Original - Encomendas - Vendas
 */
export const expedienteService = {

  /**
   * Cria um novo expediente com o estoque inicial do dia
   * @param {Object} form - Valores do formulário com quantidades iniciais
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
   * @param {string} chave - Identificador do produto
   * @returns {number} Total vendido
   */
  getTotalVendido(expediente, chave) {
    return (expediente.vendas || []).reduce((total, venda) => {
      const item = (venda.itens || []).find((i) => i.chave === chave);
      return total + (item ? item.quantidade : 0);
    }, 0);
  },

  /**
   * Calcula a quantidade disponível de um produto
   * Fórmula: Estoque Original - Encomendas - Vendas
   * @param {Object} expediente - Expediente atual
   * @param {string} chave - Identificador do produto
   * @returns {number} Quantidade disponível
   */
  getDisponivel(expediente, chave) {
    const original    = expediente.estoque[chave] || 0;
    const encomendado = this.getTotalEncomendado(expediente, chave);
    const vendido     = this.getTotalVendido(expediente, chave);
    return original - encomendado - vendido;
  },

  /**
   * Marca um pedido como retirado pelo cliente
   * Atualiza a flag 'retirado' do pedido para true
   * @param {Object} expediente - Expediente atual
   * @param {number} pedidoId - ID do pedido a ser marcado
   * @returns {Object} Expediente atualizado
   */
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

  /**
   * Adiciona uma encomenda ao expediente
   * NÃO desconta do estoque — apenas registra o pedido
   * O disponível é calculado dinamicamente via getDisponivel()
   * @param {Object} expediente - Expediente atual
   * @param {Object} dados - { nome, telefone, itens }
   * @returns {Object} Expediente atualizado
   */
  adicionarEncomenda(expediente, { nome, telefone, itens }) {
    const atualizado = {
      ...expediente,
      pedidos: [
        ...expediente.pedidos,
        {
          id: Date.now(),
          tipo: "encomenda",
          nome,
          telefone,
          itens,
          retirado: false, // começa sempre como pendente
        },
      ],
    };

    storage.salvarExpedienteAtual(atualizado);
    storage.atualizarExpedienteNoDB(atualizado);
    return atualizado;
  },

  /**
   * Registra uma venda rápida no expediente
   * NÃO desconta do estoque — apenas registra a venda
   * O disponível é calculado dinamicamente via getDisponivel()
   * @param {Object} expediente - Expediente atual
   * @param {Object} dados - { itens }
   * @returns {Object} Expediente atualizado
   */
  adicionarVenda(expediente, { itens }) {
    const atualizado = {
      ...expediente,
      vendas: [
        ...expediente.vendas,
        {
          id: Date.now(),
          tipo: "venda",
          itens,
        },
      ],
    };

    storage.salvarExpedienteAtual(atualizado);
    storage.atualizarExpedienteNoDB(atualizado);
    return atualizado;
  },
};