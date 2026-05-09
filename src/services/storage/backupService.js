/**
 * Serviço de backup e restauração de dados
 * Exporta todos os dados para JSON e permite reimportar
 * Também faz backup automático no localStorage como segurança extra
 */

import {
  getTodosExpedientesIDB,
  importarExpedientesIDB,
  salvarMetaIDB,
} from "./indexedDB";

const CHAVE_BACKUP_LOCAL = "frango_backup_emergencia";
const CHAVE_BACKUP_TS    = "frango_backup_timestamp";

/**
 * Exporta todos os dados para um arquivo JSON para download
 * O arquivo contém todos os expedientes + metadados do backup
 */
export async function exportarJSON() {
  const expedientes = await getTodosExpedientesIDB();

  const payload = {
    versao:      "1.0",
    exportadoEm: new Date().toISOString(),
    app:         "La Casa Di Frango",
    expedientes,
  };

  const blob = new Blob([JSON.stringify(payload, null, 2)], {
    type: "application/json",
  });

  // cria link de download e clica automaticamente
  const url  = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href     = url;
  link.download = `frango_backup_${new Date().toISOString().slice(0, 10)}.json`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);

  await salvarMetaIDB("ultimoExport", new Date().toISOString());
}

/**
 * Importa dados de um arquivo JSON previamente exportado
 * Faz merge com os dados existentes — não apaga nada
 * @param {File} arquivo - Arquivo JSON selecionado pelo usuário
 * @returns {Promise<{ importados: number, erro: string|null }>}
 */
export async function importarJSON(arquivo) {
  return new Promise((resolve) => {
    const reader = new FileReader();

    reader.onload = async (e) => {
      try {
        const payload = JSON.parse(e.target.result);

        // valida estrutura mínima do arquivo
        if (!payload.expedientes || !Array.isArray(payload.expedientes)) {
          resolve({ importados: 0, erro: "Arquivo inválido ou corrompido" });
          return;
        }

        await importarExpedientesIDB(payload.expedientes);

        // sincroniza localStorage com o primeiro expediente ativo encontrado
        const ativo = payload.expedientes.find((ex) => ex.status === "active");
        if (ativo) {
          localStorage.setItem("expediente_atual", JSON.stringify(ativo));
        }

        resolve({ importados: payload.expedientes.length, erro: null });
      } catch {
        resolve({ importados: 0, erro: "Erro ao processar o arquivo" });
      }
    };

    reader.onerror = () =>
      resolve({ importados: 0, erro: "Erro ao ler o arquivo" });

    reader.readAsText(arquivo);
  });
}

/**
 * Salva um backup de emergência no localStorage
 * Chamado automaticamente a cada 5 minutos e antes de operações críticas
 * @param {Array} expedientes
 */
export function salvarBackupEmergencia(expedientes) {
  try {
    const payload = {
      salvoEm:     new Date().toISOString(),
      expedientes,
    };
    localStorage.setItem(CHAVE_BACKUP_LOCAL, JSON.stringify(payload));
    localStorage.setItem(CHAVE_BACKUP_TS, Date.now().toString());
  } catch {
    console.warn("Backup de emergência falhou — localStorage cheio?");
  }
}

/**
 * Recupera o backup de emergência do localStorage
 * Usado para restaurar dados em caso de falha do IndexedDB
 * @returns {{ expedientes: Array, salvoEm: string }|null}
 */
export function getBackupEmergencia() {
  try {
    const raw = localStorage.getItem(CHAVE_BACKUP_LOCAL);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

/**
 * Retorna quando foi feito o último backup de emergência
 * @returns {Date|null}
 */
export function getUltimoBackupTimestamp() {
  const ts = localStorage.getItem(CHAVE_BACKUP_TS);
  return ts ? new Date(parseInt(ts)) : null;
}