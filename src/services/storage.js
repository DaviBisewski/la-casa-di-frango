const CHAVE_ATUAL = "expediente_atual";
const CHAVE_DB = "frango_db";

export const storage = {
  getExpedienteAtual() {
    const data = localStorage.getItem(CHAVE_ATUAL);
    return data ? JSON.parse(data) : null;
  },

  salvarExpedienteAtual(expediente) {
    localStorage.setItem(CHAVE_ATUAL, JSON.stringify(expediente));
  },

  getDB() {
    const data = localStorage.getItem(CHAVE_DB);
    return data ? JSON.parse(data) : { days: [] };
  },

  salvarDB(db) {
    localStorage.setItem(CHAVE_DB, JSON.stringify(db));
  },

  getHistorico() {
    return [...this.getDB().days].reverse();
  },

  adicionarExpedienteToDB(expediente) {
    const db = this.getDB();
    db.days.push(expediente);
    this.salvarDB(db);
  },

  atualizarExpedienteNoDB(expediente) {
    const db = this.getDB();
    db.days = db.days.map((d) => d.id === expediente.id ? expediente : d);
    this.salvarDB(db);
  },
};