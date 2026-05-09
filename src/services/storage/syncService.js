/**
 * Serviço de sincronização com Supabase
 * Envia expedientes pendentes quando há conexão
 * Totalmente offline-first — nunca bloqueia o app
 */

import { supabase, supabaseAtivo } from "./supabaseClient";
import {
  getTodosExpedientesIDB,
  salvarMetaIDB,
  getMetaIDB,
} from "./indexedDB";

const CHAVE_PENDENTES = "frango_sync_pendentes";

/**
 * Marca expediente como pendente de sync
 * Persiste no localStorage para sobreviver a fechamentos do app
 * @param {string} expedienteId
 */
export function marcarPendente(expedienteId) {
  try {
    const raw       = localStorage.getItem(CHAVE_PENDENTES);
    const pendentes = raw ? JSON.parse(raw) : [];
    if (!pendentes.includes(expedienteId)) {
      pendentes.push(expedienteId);
      localStorage.setItem(CHAVE_PENDENTES, JSON.stringify(pendentes));
    }
  } catch {
    console.warn("Erro ao marcar pendente de sync");
  }
}

/**
 * Retorna lista de IDs pendentes de sync
 * @returns {Array<string>}
 */
function getPendentes() {
  try {
    const raw = localStorage.getItem(CHAVE_PENDENTES);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

/**
 * Remove ID da fila de pendentes após sync bem-sucedido
 * @param {string} id
 */
function removerPendente(id) {
  const pendentes = getPendentes().filter((p) => p !== id);
  localStorage.setItem(CHAVE_PENDENTES, JSON.stringify(pendentes));
}

/**
 * Converte expediente do formato local para o formato do Supabase
 * O Supabase usa snake_case e JSONB para objetos complexos
 * @param {Object} exp
 * @returns {Object}
 */
function paraFormatoSupabase(exp) {
  return {
    id:           exp.id,
    date:         exp.date,
    status:       exp.status,
    is_sunday:    exp.isSunday,
    iniciado_em:  exp.iniciadoEm  || null,
    encerrado_em: exp.encerradoEm || null,
    estoque:      exp.estoque,
    pedidos:      exp.pedidos  || [],
    vendas:       exp.vendas   || [],
    updated_at:   exp._updatedAt || Date.now(),
  };
}

/**
 * Converte expediente do Supabase para o formato local
 * @param {Object} row
 * @returns {Object}
 */
export function doFormatoSupabase(row) {
  return {
    id:           row.id,
    date:         row.date,
    status:       row.status,
    isSunday:     row.is_sunday,
    iniciadoEm:   row.iniciado_em,
    encerradoEm:  row.encerrado_em,
    estoque:      row.estoque,
    pedidos:      row.pedidos  || [],
    vendas:       row.vendas   || [],
    _updatedAt:   row.updated_at,
  };
}

/**
 * Verifica conexão com a internet
 * @returns {boolean}
 */
export function isOnline() {
  return navigator.onLine;
}

/**
 * Retorna quantidade de expedientes pendentes de sync
 * @returns {number}
 */
export function getPendenteCount() {
  return getPendentes().length;
}

/**
 * Sincroniza todos os expedientes pendentes com o Supabase
 * Usa upsert — insere se não existe, atualiza se existe
 * @returns {Promise<{ sincronizados: number, erros: number }>}
 */
export async function sincronizarPendentes() {
  if (!supabaseAtivo() || !isOnline()) {
    return { sincronizados: 0, erros: 0 };
  }

  const pendentes = getPendentes();
  if (pendentes.length === 0) return { sincronizados: 0, erros: 0 };

  const todos = await getTodosExpedientesIDB();
  let sincronizados = 0;
  let erros = 0;

  for (const id of pendentes) {
    const exp = todos.find((e) => e.id === id);
    if (!exp) { removerPendente(id); continue; }

    try {
      const { error } = await supabase
        .from("expedientes")
        .upsert(paraFormatoSupabase(exp), { onConflict: "id" });

      if (error) {
        console.error(`Erro ao sincronizar ${id}:`, error.message);
        erros++;
      } else {
        removerPendente(id);
        sincronizados++;
      }
    } catch (err) {
      console.error(`Falha de rede ao sincronizar ${id}:`, err);
      erros++;
    }
  }

  if (sincronizados > 0) {
    await salvarMetaIDB("ultimoSync", new Date().toISOString());
    console.log(`☁️ ${sincronizados} expediente(s) sincronizados com Supabase`);
  }

  return { sincronizados, erros };
}

/**
 * Baixa todos os expedientes do Supabase e salva no IndexedDB
 * Usado para restaurar dados em um novo dispositivo
 * @returns {Promise<{ importados: number, erro: string|null }>}
 */
export async function baixarDoSupabase() {
  if (!supabaseAtivo()) {
    return { importados: 0, erro: "Supabase não configurado" };
  }
  if (!isOnline()) {
    return { importados: 0, erro: "Sem conexão com a internet" };
  }

  try {
    const { data, error } = await supabase
      .from("expedientes")
      .select("*")
      .order("date", { ascending: false });

    if (error) return { importados: 0, erro: error.message };

    const { importarExpedientesIDB } = await import("./indexedDB");
    const expedientes = (data || []).map(doFormatoSupabase);
    await importarExpedientesIDB(expedientes);

    // atualiza localStorage se houver expediente ativo
    const ativo = expedientes.find((e) => e.status === "active");
    if (ativo) localStorage.setItem("expediente_atual", JSON.stringify(ativo));

    return { importados: expedientes.length, erro: null };
  } catch (err) {
    return { importados: 0, erro: err.message };
  }
}

/**
 * Inicia listener de conectividade
 * Ao voltar online, sincroniza automaticamente
 * @param {Function} onSyncComplete - Callback com resultado do sync
 */
export function iniciarSync(onSyncComplete) {
  window.addEventListener("online", async () => {
    console.log("🌐 Conexão restaurada — sincronizando com Supabase...");
    const resultado = await sincronizarPendentes();
    if (onSyncComplete) onSyncComplete(resultado);
  });
}

/**
 * Retorna data/hora do último sync bem-sucedido
 * @returns {Promise<string|null>}
 */
export async function getUltimoSync() {
  return getMetaIDB("ultimoSync");
}