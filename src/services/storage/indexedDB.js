/**
 * Camada de persistência principal usando IndexedDB
 * Mais robusto que localStorage — suporta dados grandes e transações seguras
 * Todos os dados do app ficam aqui como fonte da verdade
 */

const DB_NAME = "lacasadifrango_db";
const DB_VERSION = 1;
const STORE_EXPEDIENTES = "expedientes";
const STORE_META = "meta";

/**
 * Abre (ou cria) o banco IndexedDB
 * Cria as stores necessárias na primeira vez
 * @returns {Promise<IDBDatabase>}
 */
function abrirDB() {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, DB_VERSION);

    req.onupgradeneeded = (e) => {
      const db = e.target.result;

      // store principal de expedientes com índice por data e status
      if (!db.objectStoreNames.contains(STORE_EXPEDIENTES)) {
        const store = db.createObjectStore(STORE_EXPEDIENTES, { keyPath: "id" });
        store.createIndex("date",   "date",   { unique: false });
        store.createIndex("status", "status", { unique: false });
      }

      // store de metadados (último sync, versão, etc)
      if (!db.objectStoreNames.contains(STORE_META)) {
        db.createObjectStore(STORE_META, { keyPath: "chave" });
      }
    };

    req.onsuccess = (e) => resolve(e.target.result);
    req.onerror   = (e) => reject(e.target.error);
  });
}

/**
 * Salva ou atualiza um expediente no IndexedDB
 * Usa put() que faz upsert — insere se não existe, atualiza se existe
 * @param {Object} expediente
 */
export async function salvarExpedienteIDB(expediente) {
  const db = await abrirDB();
  return new Promise((resolve, reject) => {
    const tx    = db.transaction(STORE_EXPEDIENTES, "readwrite");
    const store = tx.objectStore(STORE_EXPEDIENTES);
    const req   = store.put({ ...expediente, _updatedAt: Date.now() });
    req.onsuccess = () => resolve();
    req.onerror   = (e) => reject(e.target.error);
  });
}

/**
 * Retorna todos os expedientes salvos ordenados por data decrescente
 * @returns {Promise<Array>}
 */
export async function getTodosExpedientesIDB() {
  const db = await abrirDB();
  return new Promise((resolve, reject) => {
    const tx    = db.transaction(STORE_EXPEDIENTES, "readonly");
    const store = tx.objectStore(STORE_EXPEDIENTES);
    const req   = store.getAll();
    req.onsuccess = (e) => {
      const dados = e.target.result || [];
      resolve(dados.sort((a, b) => b.date.localeCompare(a.date)));
    };
    req.onerror = (e) => reject(e.target.error);
  });
}

/**
 * Busca um expediente específico pelo ID
 * @param {string} id
 * @returns {Promise<Object|null>}
 */
export async function getExpedientePorIdIDB(id) {
  const db = await abrirDB();
  return new Promise((resolve, reject) => {
    const tx    = db.transaction(STORE_EXPEDIENTES, "readonly");
    const store = tx.objectStore(STORE_EXPEDIENTES);
    const req   = store.get(id);
    req.onsuccess = (e) => resolve(e.target.result || null);
    req.onerror   = (e) => reject(e.target.error);
  });
}

/**
 * Salva um valor de metadado (ex: último sync, versão)
 * @param {string} chave
 * @param {*} valor
 */
export async function salvarMetaIDB(chave, valor) {
  const db = await abrirDB();
  return new Promise((resolve, reject) => {
    const tx    = db.transaction(STORE_META, "readwrite");
    const store = tx.objectStore(STORE_META);
    const req   = store.put({ chave, valor, atualizadoEm: Date.now() });
    req.onsuccess = () => resolve();
    req.onerror   = (e) => reject(e.target.error);
  });
}

/**
 * Lê um valor de metadado
 * @param {string} chave
 * @returns {Promise<*>}
 */
export async function getMetaIDB(chave) {
  const db = await abrirDB();
  return new Promise((resolve, reject) => {
    const tx    = db.transaction(STORE_META, "readonly");
    const store = tx.objectStore(STORE_META);
    const req   = store.get(chave);
    req.onsuccess = (e) => resolve(e.target.result?.valor ?? null);
    req.onerror   = (e) => reject(e.target.error);
  });
}

/**
 * Importa uma lista de expedientes para o IndexedDB
 * Usado na importação de backup JSON — faz upsert em cada item
 * @param {Array} expedientes
 */
export async function importarExpedientesIDB(expedientes) {
  const db = await abrirDB();
  return new Promise((resolve, reject) => {
    const tx    = db.transaction(STORE_EXPEDIENTES, "readwrite");
    const store = tx.objectStore(STORE_EXPEDIENTES);
    expedientes.forEach((exp) => store.put({ ...exp, _updatedAt: Date.now() }));
    tx.oncomplete = () => resolve();
    tx.onerror    = (e) => reject(e.target.error);
  });
}