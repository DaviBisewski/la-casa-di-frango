/**
 * Service de Armazenamento (localStorage)
 * Gerencia persistência de dados do expediente no navegador
 * 
 * Estrutura de dados:
 * - expediente_atual: expediente em aberto no momento
 * - frango_db: base de dados com histórico de todos os expedientes
 */

const CHAVE_ATUAL = "expediente_atual";
const CHAVE_DB = "frango_db";

export const storage = {
  /**
   * Recupera o expediente atual (aberto) do localStorage
   * @returns {Object|null} Expediente atual ou null se nenhum está aberto
   */
  getExpedienteAtual() {
    const data = localStorage.getItem(CHAVE_ATUAL);
    return data ? JSON.parse(data) : null;
  },

  /**
   * Salva o expediente atual no localStorage
   * Substitui completamente o expediente anterior
   * @param {Object} expediente - Expediente a salvar
   */
  salvarExpedienteAtual(expediente) {
    localStorage.setItem(CHAVE_ATUAL, JSON.stringify(expediente));
  },

  /**
   * Recupera a base de dados completa (histórico)
   * @returns {Object} Objeto com array 'days' contendo todos os expedientes
   */
  getDB() {
    const data = localStorage.getItem(CHAVE_DB);
    return data ? JSON.parse(data) : { days: [] };
  },

  /**
   * Salva a base de dados completa no localStorage
   * @param {Object} db - Objeto com array 'days' de expedientes
   */
  salvarDB(db) {
    localStorage.setItem(CHAVE_DB, JSON.stringify(db));
  },

  /**
   * Recupera o histórico de expedientes em ordem inversa
   * Mais recentes primeiro
   * @returns {Array} Lista de expedientes ordenados
   */
  getHistorico() {
    return [...this.getDB().days].reverse();
  },

  /**
   * Adiciona um novo expediente à base de dados
   * Usado quando um novo expediente é criado
   * @param {Object} expediente - Novo expediente a adicionar
   */
  adicionarExpedienteToDB(expediente) {
    const db = this.getDB();
    db.days.push(expediente);
    this.salvarDB(db);
  },

  /**
   * Atualiza um expediente existente na base de dados
   * Usado quando encomendas ou vendas são adicionadas
   * @param {Object} expediente - Expediente atualizado
   */
  atualizarExpedienteNoDB(expediente) {
    const db = this.getDB();
    db.days = db.days.map((d) => d.id === expediente.id ? expediente : d);
    this.salvarDB(db);
  },
};