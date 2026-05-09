import { storage } from "./storage";

/**
 * Serviço de lógica de negócio para expedientes (dias de venda)
 * Responsável por: criar, modificar, calcular métricas de expedientes
 * NÃO faz I/O — a persistência é delegada a storage.*
 * 
 * Estrutura do Expediente:
 * {
 *   id: "2024-05-09-1234567890",    // data + timestamp
 *   date: "2024-05-09",              // data formatada
 *   status: "active" | "closed",     // estado do expediente
 *   iniciadoEm: timestamp,           // quando foi criado
 *   encerradoEm: timestamp,          // quando foi encerrado
 *   estoque: { ... },                // quantidade inicial de cada produto
 *   pedidos: [ ... ],                // encomendas do dia
 *   vendas: [ ... ],                 // vendas balcão do dia
 * }
 */
export const expedienteService = {

  /**
   * Verifica se já existe um expediente ativo (em aberto)
   * IMPORTANTE: Impede criar dois expedientes ativos ao mesmo tempo
   * 
   * @returns {boolean} true se houver expediente com status='active'
   * 
   * @example
   * if (expedienteService.temExpedienteAtivo()) {
   *   throw new Error("Já existe um expediente aberto!");
   * }
   */
  temExpedienteAtivo() {
    const db = storage.getDB();
    return db.days.some((d) => d.status === "active");
  },

  /**
   * Cria um novo expediente com estoque inicial do dia
   * 
   * REGRA: Em domingos (isSunday=true), adiciona produtos especiais:
   *   - maionese10, maionese15, costela
   * Em outros dias, esses ficam com estoque = 0
   * 
   * @param {Object} form - Formulário do usuário com valores iniciais
   * @param {number} form.comRecheio - Frangos com recheio
   * @param {number} form.semRecheio - Frangos sem recheio  
   * @param {number} form.meio - Meios-frangos
   * @param {number} form.maionese10 - Maionese 10g (só domingos)
   * @param {number} form.maionese15 - Maionese 15g (só domingos)
   * @param {number} form.costela - Costela (só domingos)
   * 
   * @returns {Object} Novo expediente com id único (data+timestamp)
   * 
   * @example
   * const novo = expedienteService.criar({
   *   comRecheio: 50,
   *   semRecheio: 40,
   *   meio: 30,
   *   maionese10: 100,
   *   maionese15: 80,
   *   costela: 20,
   * });
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

  /**
   * Calcula total de uma chave encomendado em todos os pedidos
   * 
   * @param {Object} expediente - Expediente para calcular
   * @param {string} chave - Nome da chave de produto (ex: "frangosComRecheio")
   * @returns {number} Quantidade total encomendada
   * 
   * @example
   * const totalComRecheio = expedienteService.getTotalEncomendado(exp, "frangosComRecheio");
   */
  getTotalEncomendado(expediente, chave) {
    return (expediente.pedidos || []).reduce((total, pedido) => {
      const item = (pedido.itens || []).find((i) => i.chave === chave);
      return total + (item ? item.quantidade : 0);
    }, 0);
  },

  /**
   * Calcula total de uma chave vendido em todas as vendas
   * 
   * @param {Object} expediente - Expediente para calcular
   * @param {string} chave - Nome da chave de produto
   * @returns {number} Quantidade total vendida
   */
  getTotalVendido(expediente, chave) {
    return (expediente.vendas || []).reduce((total, venda) => {
      const item = (venda.itens || []).find((i) => i.chave === chave);
      return total + (item ? item.quantidade : 0);
    }, 0);
  },

  /**
   * Calcula quantidade disponível de um produto
   * Fórmula: Estoque Original - Encomendado - Vendido
   * 
   * NUNCA retorna negativo — retorna 0 se ficar negativo
   * 
   * @param {Object} expediente - Expediente para calcular
   * @param {string} chave - Nome da chave de produto
   * @returns {number} Quantidade disponível (sempre >= 0)
   * 
   * @example
   * const disp = expedienteService.getDisponivel(exp, "frangosComRecheio");
   * // Se original=50, encomendado=20, vendido=15 → retorna 15
   */
  getDisponivel(expediente, chave) {
    const original    = expediente.estoque[chave] || 0;
    const encomendado = this.getTotalEncomendado(expediente, chave);
    const vendido     = this.getTotalVendido(expediente, chave);
    return original - encomendado - vendido;
  },

  /**
   * Calcula tempo decorrido desde abertura do expediente
   * Formato: "Xh YYmin" ou "YYmin" se menos de 1 hora
   * 
   * @param {Object} expediente - Expediente para calcular
   * @returns {string} Tempo formatado ou "—" se não houver iniciadoEm
   * 
   * @example
   * getTempoAtivo(exp) → "2h 15min"
   */
  getTempoAtivo(expediente) {
    if (!expediente.iniciadoEm) return "—";
    const ms = Date.now() - expediente.iniciadoEm;
    const totalMin = Math.floor(ms / 60000);
    const horas = Math.floor(totalMin / 60);
    const min = totalMin % 60;
    const pad = (n) => String(n).padStart(2, "0");
    return horas > 0 ? `${horas}h ${pad(min)}min` : `${pad(min)}min`;
  },

  /**
   * Marca um pedido específico como retirado
   * Persiste a mudança no banco via storage
   * 
   * @param {Object} expediente - Expediente contendo o pedido
   * @param {string|number} pedidoId - ID do pedido a marcar
   * @returns {Object} Expediente atualizado com retirado=true no pedido
   * 
   * @example
   * const atualizado = expedienteService.marcarRetirado(exp, pedido.id);
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
   * Encerra um expediente (fecha o dia de vendas)
   * Marca status como 'closed' e registra horário de encerramento
   * 
   * @param {Object} expediente - Expediente a encerrar
   * @returns {Object} Expediente encerrado com status='closed' e encerradoEm
   * 
   * @example
   * const encerrado = expedienteService.encerrar(exp);
   * // Agora exp.status === 'closed' e exp.encerradoEm está preenchido
   */
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

  /**
   * Adiciona uma nova encomenda (pedido por telefone/redes sociais)
   * Gera ID único baseado em timestamp
   * 
   * @param {Object} expediente - Expediente para adicionar encomenda
   * @param {Object} params - Dados da encomenda
   * @param {string} params.nome - Nome do cliente
   * @param {string} params.telefone - Telefone de contato
   * @param {Array} params.itens - Itens da encomenda [{ chave, quantidade }, ...]
   * @returns {Object} Expediente com nova encomenda adicionada
   * 
   * @example
   * const atualizado = expedienteService.adicionarEncomenda(exp, {
   *   nome: "João Silva",
   *   telefone: "11987654321",
   *   itens: [{ chave: "frangosComRecheio", quantidade: 2 }]
   * });
   */
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

  /**
   * Adiciona uma venda de balcão (venda rápida sem cliente)
   * Não requer nome nem telefone, apenas quantidade vendida
   * 
   * @param {Object} expediente - Expediente para adicionar venda
   * @param {Object} params - Dados da venda
   * @param {Array} params.itens - Itens vendidos [{ chave, quantidade }, ...]
   * @returns {Object} Expediente com nova venda adicionada
   * 
   * @example
   * const atualizado = expedienteService.adicionarVenda(exp, {
   *   itens: [{ chave: "frangosComRecheio", quantidade: 1 }]
   * });
   */
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