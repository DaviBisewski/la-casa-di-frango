/**
 * Orquestrador central de armazenamento
 * Camada única que todos os outros serviços devem usar
 * Garante que os dados são salvos em todas as camadas de segurança
 *
 * Hierarquia de segurança:
 * 1. localStorage     — cache instantâneo do expediente atual
 * 2. IndexedDB        — banco principal persistente
 * 3. Backup emergência — snapshot no localStorage a cada 5min
 * 4. Sync online      — envia para servidor quando disponível
 */

import {
  salvarExpedienteIDB,
  getTodosExpedientesIDB,
  getExpedientePorIdIDB,
} from "./storage/indexedDB";

import {
  salvarBackupEmergencia,
  getBackupEmergencia,
} from "./storage/backupService";

import { marcarPendente } from "./storage/syncService";

const CHAVE_ATUAL = "expediente_atual";
const CHAVE_DB_LEGADO = "frango_db"; // compatibilidade com dados antigos

/**
 * Migra dados do localStorage legado para o IndexedDB
 * Executado uma vez na inicialização do app
 */
export async function migrarDadosLegados() {
  const migrado = localStorage.getItem("frango_migrado_v2");
  if (migrado) return;

  try {
    const dbLegado = localStorage.getItem(CHAVE_DB_LEGADO);
    if (dbLegado) {
      const { days } = JSON.parse(dbLegado);
      if (days?.length > 0) {
        const { importarExpedientesIDB } = await import("./storage/indexedDB");
        await importarExpedientesIDB(days);
        console.log(`✅ Migrados ${days.length} expedientes do localStorage`);
      }
    }
    localStorage.setItem("frango_migrado_v2", "true");
  } catch {
    console.warn("Migração falhou — dados legados mantidos");
  }
}

/**
 * Salva expediente em todas as camadas
 * localStorage → IndexedDB → marca para sync
 * @param {Object} expediente
 */
export async function salvarExpediente(expediente) {
  // 1. localStorage — instantâneo
  localStorage.setItem(CHAVE_ATUAL, JSON.stringify(expediente));

  // 2. IndexedDB — persistente
  await salvarExpedienteIDB(expediente);

  // 3. marca para sync online quando disponível
  marcarPendente(expediente.id);
}

/**
 * Retorna o expediente atual do localStorage (síncrono e rápido)
 * @returns {Object|null}
 */
export function getExpedienteAtual() {
  try {
    const raw = localStorage.getItem(CHAVE_ATUAL);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

/**
 * Retorna todos os expedientes do IndexedDB em ordem decrescente
 * Em caso de falha, tenta recuperar do backup de emergência
 * @returns {Promise<Array>}
 */
export async function getHistorico() {
  try {
    return await getTodosExpedientesIDB();
  } catch {
    console.warn("IndexedDB falhou — usando backup de emergência");
    const backup = getBackupEmergencia();
    return backup?.expedientes || [];
  }
}

/**
 * Adiciona novo expediente ao banco
 * @param {Object} expediente
 */
export async function adicionarExpediente(expediente) {
  await salvarExpediente(expediente);
}

/**
 * Atualiza expediente existente no banco
 * @param {Object} expediente
 */
export async function atualizarExpediente(expediente) {
  await salvarExpediente(expediente);
}

/**
 * Verifica se há expediente ativo no banco
 * @returns {Promise<boolean>}
 */
export async function temExpedienteAtivo() {
  const todos = await getTodosExpedientesIDB();
  return todos.some((e) => e.status === "active");
}

/**
 * Dispara backup de emergência com todos os dados atuais
 * Chamado automaticamente a cada 5 minutos pelo useBackupAutomatico
 */
export async function fazerBackupEmergencia() {
  try {
    const todos = await getTodosExpedientesIDB();
    salvarBackupEmergencia(todos);
  } catch {
    console.warn("Backup de emergência falhou");
  }
}
